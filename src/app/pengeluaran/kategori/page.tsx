'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { Search } from 'lucide-react'

interface JenisPengeluaran {
  id_jenis_pengeluaran: string
  nama_jenis_pengeluaran: string
}

interface KategoriPengeluaran {
  id_kategori_pengeluaran: string
  nama_kategori_pengeluaran: string
  jenis_pengeluaran: JenisPengeluaran
}

export default function KategoriPengeluaranPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<KategoriPengeluaran[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await axios.get('http://127.0.0.1:8000/api/monitoring-pengeluaran/kategori-pengeluaran', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setData(res.data)
      } catch (error) {
        console.error('Gagal mengambil data kategori pengeluaran:', error)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.nama_kategori_pengeluaran.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const projectCategories = useMemo(() => {
    return filteredData.filter(item => item.jenis_pengeluaran.nama_jenis_pengeluaran.toLowerCase() === 'project')
  }, [filteredData])

  const nonProjectCategories = useMemo(() => {
    return filteredData.filter(item => item.jenis_pengeluaran.nama_jenis_pengeluaran.toLowerCase() === 'non project')
  }, [filteredData])

  const columns: ColumnDef<KategoriPengeluaran>[] = useMemo(
    () => [
      {
        accessorKey: 'nama_kategori_pengeluaran',
        header: 'Nama Kategori',
      },
    ],
    []
  )

  const projectTable = useReactTable({
    data: projectCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const nonProjectTable = useReactTable({
    data: nonProjectCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const maxRowCount = Math.max(
    projectTable.getRowModel().rows.length,
    nonProjectTable.getRowModel().rows.length
  )

  // Function to navigate to the "Tambah Kategori" page
  const handleAddCategory = () => {
    router.push('/pengeluaran/kategori/tambah-kategori')
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Daftar Kategori Pengeluaran</h2>
      </div>

      <div className="flex justify-between gap-2 items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari kategori..."
            className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute left-2 top-2 text-gray-700" />
        </div>
        <button
          onClick={handleAddCategory}  // Modified to use the function
          className="bg-blue-900 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Tambah Kategori
        </button>
      </div>

      {/* TABEL 2 KOLOM: PROJECT & NON PROJECT */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="p-2 border w-1/2">Project</th>
              <th className="p-2 border w-1/2">Non Project</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRowCount }).map((_, index) => {
              const projectRow = projectTable.getRowModel().rows[index]
              const nonProjectRow = nonProjectTable.getRowModel().rows[index]

              return (
                <tr key={index} className="border">
                  <td className="p-2 border">
                    {projectRow
                      ? flexRender(
                          projectRow.getVisibleCells()[0].column.columnDef.cell,
                          projectRow.getVisibleCells()[0].getContext()
                        )
                      : '-'}
                  </td>
                  <td className="p-2 border">
                    {nonProjectRow
                      ? flexRender(
                          nonProjectRow.getVisibleCells()[0].column.columnDef.cell,
                          nonProjectRow.getVisibleCells()[0].getContext()
                        )
                      : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
