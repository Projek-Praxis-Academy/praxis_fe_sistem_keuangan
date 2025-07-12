'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import axios from 'axios'
import EditModal from '@/components/EditModal'
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'

interface Kategori {
  id_kategori_pengeluaran: string
  id_jenis_pengeluaran: string
  nama_kategori_pengeluaran: string
  jenis_pengeluaran: {
    id_jenis_pengeluaran: string
    nama_jenis_pengeluaran: string
  }
}


interface SubPengeluaran {
  id_sub_pengeluaran: string
  nama_sub_pengeluaran: string
  nominal: number
  jumlah_item: number
  file_nota: string
  tanggal_pengeluaran: string
  id_kategori_pengeluaran: string
  kategori_pengeluaran?: {
    id_kategori_pengeluaran: string
    id_jenis_pengeluaran: string
    nama_kategori_pengeluaran: string
    created_at: string
    updated_at: string
  }
}

interface JenisPengeluaran {
  id_jenis_pengeluaran: string
  nama_jenis_pengeluaran: string
  created_at?: string
  updated_at?: string
}

interface PengeluaranItem {
  id_pengeluaran: string
  jenis_pengeluaran: string | JenisPengeluaran
  // ... other properties
}

interface PengeluaranDetail {
  id_pengeluaran: string
  nama_pengeluaran: string
  total_pengeluaran: number
  sub_pengeluaran: SubPengeluaran[]
}

function DetailPengeluaranInner() {
  const [detail, setDetail] = useState<PengeluaranDetail | null>(null)
  const [jenisPengeluaran, setJenisPengeluaran] = useState<string>('-')
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const id_pengeluaran_query = searchParams.get('id_pengeluaran') || ''
  const [selectedRow, setSelectedRow] = useState<SubPengeluaran | null>(null)
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState<string>('')

  const handleUpdate = async ({ id_sub_pengeluaran, formData }: { id_sub_pengeluaran: string, formData: FormData }) => {
    try {
      const token = localStorage.getItem('token') || ''
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/sub-pengeluaran/update/${id_sub_pengeluaran}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      console.log('Update sukses:', response.data)
      
      if (detail) {
        setDetail(prev => {
          if (!prev) return null
          
          const updatedSub = prev.sub_pengeluaran.map(item => 
            item.id_sub_pengeluaran === id_sub_pengeluaran 
              ? response.data.data 
              : item
          )
          
          return {
            ...prev,
            sub_pengeluaran: updatedSub,
            total_pengeluaran: updatedSub.reduce(
              (sum, item) => sum + (item.nominal * item.jumlah_item), 
              0
            )
          }
        })
      }
      
      setModalOpen(false)
    } catch (err) {
      console.error('Gagal update:', err)
      alert('Terjadi kesalahan saat update')
    }
  }

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || ''
      
      // Fetch detail pengeluaran
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/detail/${id_pengeluaran_query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Set data detail
      const updatedData: PengeluaranDetail = {
        ...response.data,
        total_pengeluaran: response.data.sub_pengeluaran.reduce(
          (sum: number, item: SubPengeluaran) => sum + (item.nominal * item.jumlah_item), 
          0
        )
      }
      
      setDetail(updatedData)

      // Fetch jenis pengeluaran
      const jenisPengeluaranResponse = await axios.get<{data: PengeluaranItem[]}>(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      const pengeluaranList = jenisPengeluaranResponse.data.data || []
      const found = pengeluaranList.find(
        (item) => item.id_pengeluaran === response.data.id_pengeluaran
      )

      // Handle jenis pengeluaran (string or object)
      let jenisPengeluaranValue = '-'
      if (found) {
        if (typeof found.jenis_pengeluaran === 'string') {
          jenisPengeluaranValue = found.jenis_pengeluaran
        } else {
          jenisPengeluaranValue = (found.jenis_pengeluaran as JenisPengeluaran)?.nama_jenis_pengeluaran || '-'
        }
      }
      setJenisPengeluaran(jenisPengeluaranValue)

      // Fetch kategori
      const kategoriRes = await axios.get<{data: Kategori[]}>(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/kategori-pengeluaran?type=${jenisPengeluaranValue}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setKategoriList(kategoriRes.data.data || [])
    } catch (error) {
      console.error('Gagal memuat detail:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get categories filtered by the current jenis pengeluaran
  // const getFilteredKategoriList = () => {
  //   if (!detail) return []
  //   return kategoriList.filter(
  //     k => k.id_jenis_pengeluaran === detail.id_jenis_pengeluaran
  //   )
  // }

  useEffect(() => {
    if (id_pengeluaran_query) {
      fetchDetail()
    }
  }, [id_pengeluaran_query])

  const handleDelete = async (id: string) => {
    setDeleteMessage('') // reset pesan sebelumnya
    if (!confirm('Yakin ingin menghapus sub pengeluaran ini?')) return
    try {
      const token = localStorage.getItem('token') || ''
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/sub-pengeluaran/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setDeleteMessage('Sub pengeluaran berhasil dihapus.')
      fetchDetail()
      setTimeout(() => setDeleteMessage(''), 2500)
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Gagal menghapus sub pengeluaran.'
      setDeleteMessage(msg)
      setTimeout(() => setDeleteMessage(''), 2500)
    }
  }

  const columns: ColumnDef<SubPengeluaran>[] = [
    {
      header: 'Nama',
      accessorKey: 'nama_sub_pengeluaran',
      cell: ({ row }) => row.original.nama_sub_pengeluaran,
    },
    {
      header: 'Kategori',
      accessorKey: 'id_kategori_pengeluaran',
      cell: ({ row }) =>
        row.original.kategori_pengeluaran?.nama_kategori_pengeluaran || '-',
    },
    {
      header: 'Nominal',
      accessorKey: 'nominal',
      cell: ({ row }) => row.original.nominal.toLocaleString('id-ID'),
    },
    {
      header: 'Jumlah Item',
      accessorKey: 'jumlah_item',
      cell: ({ row }) => row.original.jumlah_item,
    },
    {
      header: 'Total',
      cell: ({ row }) =>
        (row.original.nominal * row.original.jumlah_item).toLocaleString('id-ID'),
    },
    {
      header: 'Bukti Nota',
      cell: ({ row }) =>
        row.original.file_nota ? (
          <a
            href={`https://fitrack-production.up.railway.app/${row.original.file_nota}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={18} />
          </a>
        ) : (
          '-'
        ),
    },
    {
      header: 'Tanggal Pengeluaran',
      accessorKey: 'tanggal_pengeluaran',
      cell: ({ row }) =>
        new Date(row.original.tanggal_pengeluaran).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
    },
    {
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => {
              setSelectedRow(row.original)
              setModalOpen(true)
            }}
            className="px-2 py-1 bg-yellow-500 text-white rounded"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.original.id_sub_pengeluaran)}
            className="px-2 py-1 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: detail?.sub_pengeluaran || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading) return <div className="ml-64 p-6">Memuat...</div>
  if (!detail) return <div className="ml-64 p-6">Data tidak ditemukan</div>

  return (
    <div className="ml-64 p-6 min-h-screen bg-white text-black">
      <h2 className="text-3xl font-bold mb-4 text-center">Detail Pengeluaran</h2>

      <div className="bg-gray-100 p-4 rounded-md mb-6 shadow">
        <p>
          <strong>Jenis Pengeluaran:</strong> {jenisPengeluaran}
        </p>
        <p>
          <strong>Nama Pengeluaran:</strong> {detail.nama_pengeluaran}
        </p>
      </div>

      {/* <h3 className="text-xl font-semibold mb-2">Sub Pengeluaran</h3> */}

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">Sub Pengeluaran</h3>
        <button
          onClick={() => {
            setSelectedRow(null)  // kosongkan selectedRow agar form kosong
            setModalOpen(true)    // buka modal
          }}
          className="bg-green-600 text-white px-2 py-1.5 rounded hover:bg-green-700 transition"
        >
          + Add
        </button>
      </div>

      
      {/* Alert Delete Message */}
      {deleteMessage && (
        <div className="text-yellow-700 mb-4 p-3 rounded bg-yellow-100 border border-yellow-500">
          <p className="font-medium">{deleteMessage}</p>
        </div>
      )}
      <div className="overflow-x-auto border rounded">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-900 text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-2 border">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRow && (
        <EditModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          data={selectedRow}
          onSave={handleUpdate}
          jenisPengeluaran={jenisPengeluaran}
        />
      )}
    </div>
  )
}

export default function DetailPengeluaran() {
  return (
    <Suspense fallback={<div className="ml-64 p-6">Memuat...</div>}>
      <DetailPengeluaranInner />
    </Suspense>
  )
}