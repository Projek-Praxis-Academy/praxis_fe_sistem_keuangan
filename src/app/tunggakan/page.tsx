'use client'

import { useEffect, useMemo, useState, useRef, Suspense } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileSignature, CreditCard, X, Pencil, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

interface Tunggakan {
  id_tunggakan: string
  nisn: string
  nama_siswa: string
  jenis_tagihan: string
  nama_tagihan: string
  nominal: number
  periode: string
  status: string
  catatan: string | null
}

function TunggakanSiswaInner() {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<Tunggakan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTunggakan, setCurrentTunggakan] = useState<Tunggakan | null>(null)
  const [formData, setFormData] = useState({
    nominal: 0,
    status: 'Belum Lunas',
    catatan: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
  const [notif, setNotif] = useState<{ type: 'success' | 'error', message: string, open: boolean }>({ type: 'success', message: '', open: false });

  // Move fetchData outside useEffect so it can be called elsewhere
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token') || ''
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/tunggakan`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setData(response.data.data.data)
    } catch (error: any) {
      console.error('Failed to fetch data:', error)
      setError('Gagal memuat data tunggakan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Group data by student name
  const groupedData = useMemo(() => {
    const groups: Record<string, Tunggakan[]> = {}
    
    data.forEach(item => {
      if (!groups[item.nama_siswa]) {
        groups[item.nama_siswa] = []
      }
      groups[item.nama_siswa].push(item)
    })

    return groups
  }, [data])

  const filteredData = useMemo(() => {
    const filteredGroups: Record<string, Tunggakan[]> = {}
    
    Object.keys(groupedData).forEach(name => {
      if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
        filteredGroups[name] = groupedData[name]
      }
    })

    return filteredGroups
  }, [searchTerm, groupedData])

  // MODAL: buka modal edit
  const handleUpdateClick = (tunggakan: Tunggakan) => {
    setCurrentTunggakan(tunggakan)
    setFormData({
      nominal: tunggakan.nominal,
      status: tunggakan.status,
      catatan: tunggakan.catatan || ''
    })
    setIsModalOpen(true)
  }

  // MODAL: submit perubahan
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTunggakan) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token') || '';
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/tunggakan/update/${currentTunggakan.id_tunggakan}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
      setIsModalOpen(false);
      setNotif({ type: 'success', message: 'Data tunggakan berhasil diperbarui!', open: true });
    } catch (error) {
      console.error('Failed to update tunggakan:', error);
      setNotif({ type: 'error', message: 'Gagal memperbarui data tunggakan', open: true });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotif({ ...notif, open: false }), 2500);
    }
  }

  // Fungsi delete baru
  const handleDelete = async (id: string) => {
    setShowConfirm({ open: true, id });
  };

  // Fungsi untuk benar-benar menghapus
  const confirmDelete = async () => {
    if (!showConfirm.id) return;
    try {
      const token = localStorage.getItem('token') || '';
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        redirect: "follow" as RequestRedirect
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tunggakan/delete/${showConfirm.id}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          setNotif({ type: 'success', message: 'Data tunggakan berhasil dihapus!', open: true });
          fetchData();
        })
        .catch((error) => {
          setNotif({ type: 'error', message: 'Gagal menghapus data tunggakan', open: true });
        });
    } catch (error) {
      setNotif({ type: 'error', message: 'Gagal menghapus data tunggakan', open: true });
    } finally {
      setShowConfirm({ open: false, id: null });
      setTimeout(() => setNotif({ ...notif, open: false }), 2500);
    }
  };

  const columns = useMemo(
    () => [
      { 
        accessorKey: 'nama_siswa', 
        header: 'NAMA SISWA',
        cell: ({ row }: any) => row.original.nama_siswa
      },
      { 
        accessorKey: 'jenis_tagihan', 
        header: 'JENIS TAGIHAN',
        cell: ({ row }: any) => row.original.jenis_tagihan
      },
      { 
        accessorKey: 'nama_tagihan', 
        header: 'NAMA TAGIHAN',
        cell: ({ row }: any) => row.original.nama_tagihan
      },
      { 
        accessorKey: 'nominal', 
        header: 'NOMINAL',
        cell: ({ row }: any) => (
          <span>{Number(row.original.nominal).toLocaleString('id-ID')}</span>
        )
      },
      { 
        accessorKey: 'periode', 
        header: 'PERIODE',
        cell: ({ row }: any) => row.original.periode
      },
      { 
        accessorKey: 'status', 
        header: 'STATUS',
        cell: ({ row }: any) => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.original.status === 'Lunas' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {row.original.status}
          </span>
        )
      },
      { 
        accessorKey: 'aksi', 
        header: 'AKSI',
        cell: ({ row }: any) => (
          <div className="flex gap-2">
            <button 
              onClick={() => handleUpdateClick(row.original)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Pencil size={16} />
            </button>
            <button 
              onClick={() => handleDelete(row.original.id_tunggakan)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    ],
    []
  )

  const tableData = useMemo(() => {
    const flatData: any[] = []
    
    Object.values(filteredData).forEach(items => {
      items.forEach((item, index) => {
        flatData.push({
          ...item,
          // Only show name for the first row of each student
          nama_siswa: index === 0 ? item.nama_siswa : ''
        })
      })
    })

    return flatData
  }, [filteredData])

  const table = useReactTable({ 
    data: tableData, 
    columns, 
    getCoreRowModel: getCoreRowModel() 
  })

  if (isLoading) {
    return (
      <div className="ml-64 flex-1 bg-white min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-blue-900 font-semibold">Memuat data tunggakan...</p>
          <p className="text-sm text-gray-500 mt-2">Mohon tunggu, sedang mengambil data dari server.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ml-64 flex-1 bg-white min-h-screen p-6 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      {/* Modal Update Tunggakan */}
      {isModalOpen && currentTunggakan && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Update Tunggakan</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Siswa</label>
                <input
                  type="text"
                  value={currentTunggakan.nama_siswa}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jenis Tagihan</label>
                <input
                  type="text"
                  value={currentTunggakan.jenis_tagihan}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nominal</label>
                <input
                  type="number"
                  value={formData.nominal}
                  onChange={(e) => setFormData({
                    ...formData,
                    nominal: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({
                    ...formData,
                    status: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({
                    ...formData,
                    catatan: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Tunggakan Siswa</h2>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Cari nama siswa..."
            className="px-4 py-2 pl-10 w-full bg-gray-100 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-500" />
        </div>
      </div>

      {/* Konfirmasi Hapus */}
      {showConfirm.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 border w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2 text-red-700">Konfirmasi Hapus</h3>
            <p className="mb-4 text-sm text-gray-700">Apakah Anda yakin ingin menghapus data tunggakan ini?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowConfirm({ open: false, id: null })}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi */}
      {notif.open && notif.type === 'success' && (
        <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
          <p className="font-medium">{notif.message}</p>
        </div>
      )}
      {notif.open && notif.type === 'error' && (
        <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
          <p className="font-medium">{notif.message}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-black">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-blue-900 text-white">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="p-3 border border-blue-800 font-semibold"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-50"
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className={`p-3 border ${
                        !cell.row.original.nama_siswa ? 'text-gray-500' : ''
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                  Tidak ada data tunggakan yang ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function TunggakanSiswa() {
  return (
    <Suspense fallback={<div className="ml-64 p-8">Loading...</div>}>
      <TunggakanSiswaInner />
    </Suspense>
  )
}