'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'

interface SubPengeluaran {
  id_sub_pengeluaran: string
  nama_sub_pengeluaran: string
  nominal: number
  jumlah_item: number
  file_nota: string
  tanggal_pengeluaran: string
  id_kategori_pengeluaran?: string
}

interface PengeluaranDetail {
  id_pengeluaran: string
  nama_pengeluaran: string
  total_pengeluaran: number
  sub_pengeluaran: SubPengeluaran[]
}

export default function DetailPengeluaran() {
  const [detail, setDetail] = useState<PengeluaranDetail | null>(null)
  const [jenisPengeluaran, setJenisPengeluaran] = useState<string>('-')
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const id_pengeluaran_query = searchParams.get('id_pengeluaran') || ''
  const [editedRow, setEditedRow] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<SubPengeluaran>>({})

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem('token') || ''
      const response = await axios.get(
        `http://127.0.0.1:8000/api/monitoring-pengeluaran/detail/${id_pengeluaran_query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setDetail(response.data)

      const jenisPengeluaranResponse = await axios.get(
        'http://127.0.0.1:8000/api/monitoring-pengeluaran',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const pengeluaranList = jenisPengeluaranResponse.data.data || []
      const found = pengeluaranList.find(
        (item: any) =>
          item.id_pengeluaran === response.data.id_pengeluaran
      )
      const namaJenis =
        found?.jenis_pengeluaran?.nama_jenis_pengeluaran || '-'
      setJenisPengeluaran(namaJenis)
    } catch (error) {
      console.error('Gagal memuat detail pengeluaran:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id_pengeluaran_query) fetchDetail()
  }, [id_pengeluaran_query])

  const handleEdit = (row: SubPengeluaran) => {
    setEditedRow(row.id_sub_pengeluaran)
    setEditingData(row)
  }

  const handleChange = (
    field: keyof SubPengeluaran,
    value: any
  ) => {
    setEditingData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (id: string) => {
  try {
    const token = localStorage.getItem('token') || ''
    
    // Membuat instance FormData
    const formData = new FormData()
    
    // Menambahkan data ke FormData (sesuaikan dengan field yang diedit)
    formData.append("id_kategori_pengeluaran", editingData.id_kategori_pengeluaran || "")
    formData.append("nama_sub_pengeluaran", editingData.nama_sub_pengeluaran || "")
    formData.append("nominal", String(editingData.nominal || 0))
    formData.append("jumlah_item", String(editingData.jumlah_item || 0))
    formData.append("tanggal_pengeluaran", editingData.tanggal_pengeluaran || "")
    
    // Menambahkan file nota jika ada
    if (editingData.file_nota && typeof editingData.file_nota !== 'string') {
      formData.append("file_nota", editingData.file_nota)
    }
    
    // Mengirimkan data menggunakan axios dan FormData
    await axios.post(
      `http://127.0.0.1:8000/api/monitoring-pengeluaran/sub-pengeluaran/update/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Pastikan header ini ada untuk mendukung FormData
        },
      }
    )

    // Reset state setelah berhasil
    setEditedRow(null)
    setEditingData({})
    fetchDetail() // Memuat ulang detail setelah update
  } catch (error) {
    console.error('Gagal menyimpan:', error)
  }
}


  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus sub pengeluaran ini?')) return
    try {
      const token = localStorage.getItem('token') || ''
      await axios.delete(
        `http://127.0.0.1:8000/api/monitoring-pengeluaran/sub-pengeluaran/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      fetchDetail()
    } catch (error) {
      console.error('Gagal menghapus:', error)
    }
  }

  const columns: ColumnDef<SubPengeluaran>[] = [
    {
      header: 'Nama',
      accessorKey: 'nama_sub_pengeluaran',
      cell: ({ row }) =>
        editedRow === row.original.id_sub_pengeluaran ? (
          <input
            type="text"
            value={editingData.nama_sub_pengeluaran || ''}
            onChange={(e) =>
              handleChange('nama_sub_pengeluaran', e.target.value)
            }
            className="border p-1 rounded w-full"
          />
        ) : (
          row.original.nama_sub_pengeluaran
        ),
    },
    {
      header: 'Kategori',
      accessorKey: 'id_kategori_pengeluaran',
      cell: ({ row }) =>
        `Kategori ${row.original.id_kategori_pengeluaran || '-'}`,
    },
    {
      header: 'Nominal',
      accessorKey: 'nominal',
      cell: ({ row }) =>
        editedRow === row.original.id_sub_pengeluaran ? (
          <input
            type="number"
            value={editingData.nominal || ''}
            onChange={(e) =>
              handleChange('nominal', parseInt(e.target.value))
            }
            className="border p-1 rounded w-full"
          />
        ) : (
          row.original.nominal.toLocaleString('id-ID')
        ),
    },
    {
      header: 'Jumlah Item',
      accessorKey: 'jumlah_item',
      cell: ({ row }) =>
        editedRow === row.original.id_sub_pengeluaran ? (
          <input
            type="number"
            value={editingData.jumlah_item || ''}
            onChange={(e) =>
              handleChange('jumlah_item', parseInt(e.target.value))
            }
            className="border p-1 rounded w-full"
          />
        ) : (
          row.original.jumlah_item
        ),
    },
    {
      header: 'Total',
      cell: ({ row }) =>
        (
          row.original.nominal * row.original.jumlah_item
        ).toLocaleString('id-ID'),
    },
    {
      header: 'Bukti Nota',
      cell: ({ row }) => (
        <a
          href={`http://127.0.0.1:8000/${row.original.file_nota}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {row.original.file_nota}
        </a>
      ),
    },
    {
      header: 'Tanggal Pengeluaran',
      accessorKey: 'tanggal_pengeluaran',
      cell: ({ row }) =>
        new Date(
          row.original.tanggal_pengeluaran
        ).toLocaleDateString('id-ID'),
    },
    {
      header: 'Aksi',
      cell: ({ row }) => {
        const id = row.original.id_sub_pengeluaran
        const isEditing = editedRow === id

        return isEditing ? (
          <div className="flex gap-1">
            <button
              onClick={() => handleSave(id)}
              className="px-2 py-1 bg-green-500 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditedRow(null)}
              className="px-2 py-1 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => handleEdit(row.original)}
              className="px-2 py-1 bg-yellow-500 text-white rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(id)}
              className="px-2 py-1 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        )
      },
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

      <h3 className="text-xl font-semibold mb-2">Sub Pengeluaran</h3>
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
    </div>
  )
}
