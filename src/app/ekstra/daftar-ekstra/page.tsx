'use client'

import { useState, useMemo, useEffect } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Ekstra {
  id_ekstra: string
  nama_ekstra: string
  harga_ekstra: string
  created_at: string
  updated_at: string
}

export default function DaftarEkstra() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<Ekstra[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/ekstra/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setData(res.data.data)
      } catch (error) {
        console.error('Gagal mengambil data ekstra:', error)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.nama_ekstra?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'nama_ekstra',
        header: 'Nama Ekstra',
      },
      {
        accessorKey: 'harga_ekstra',
        header: 'Harga Ekstra',
        cell: ({ getValue }: { getValue: () => string }) => {
          const rawValue = getValue()
          const numericValue = Number(rawValue.replace(/\./g, '').replace(',', '.'))
          return `Rp ${numericValue.toLocaleString('id-ID')}`
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Daftar Ekstrakurikuler</h2>
      </div>

      <div className="flex justify-between gap-2 items-center mb-4">
        <div className="relative">
          <input
            id='search-ekstra'
            type="text"
            placeholder="Cari nama ekstra..."
            className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute left-2 top-2 text-gray-700" />
        </div>
        <button
          onClick={() => router.push('/ekstra/daftar-ekstra/tambah-ekstra')}
          className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Tambah Ekstra
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-blue-900 text-white">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-2 border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border">
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
