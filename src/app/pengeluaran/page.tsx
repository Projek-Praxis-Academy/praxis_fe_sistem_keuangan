'use client'

import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { FileText, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Pengeluaran {
  id_pengeluaran: number
  nama_pengeluaran: string
  total_pengeluaran: number
  updated_at: string
  jenis_pengeluaran: {
  nama_jenis_pengeluaran: string
  }
}

export default function PengeluaranTable() {
  const [data, setData] = useState<Pengeluaran[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const pengeluaranList = response.data.data || []
        const formattedData = pengeluaranList.map((item: any) => ({
          id_pengeluaran: item.id_pengeluaran,
          nama_pengeluaran: item.nama_pengeluaran,
          total_pengeluaran: item.total_pengeluaran,
          updated_at: item.updated_at,
          jenis_pengeluaran: {
            nama_jenis_pengeluaran: item.jenis_pengeluaran?.nama_jenis_pengeluaran || '-',
          },
        }))

        setData(formattedData)
      } catch (error) {
        console.error('Gagal memuat data pengeluaran:', error)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.nama_pengeluaran.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, data])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'jenis_pengeluaran.nama_jenis_pengeluaran',
        header: 'Jenis Pengeluaran',
        cell: ({ row }: any) => row.original.jenis_pengeluaran?.nama_jenis_pengeluaran || '-',
      },
      {
        accessorKey: 'nama_pengeluaran',
        header: 'Nama Pengeluaran',
      },
      {
        accessorKey: 'total_pengeluaran',
        header: 'Total Pengeluaran',
        cell: (info) => `${info.getValue() || 0}`,
      },
      {
        accessorKey: 'updated_at',
        header: 'Terakhir di Update',
        cell: ({ getValue }: any) => {
          const date = new Date(getValue())
          return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        },
      },
      {
        accessorKey: 'detail',
        header: 'Detail',
        cell: ({ row }: any) => (
          <FileText
            className="text-gray-700 hover:text-blue-600 cursor-pointer"
            onClick={() =>
              router.push(`/pengeluaran/detail?id_pengeluaran=${row.original.id_pengeluaran}`)
            }
          />
        ),
      },
    ],
    [router]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Pengeluaran</h2>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute left-2 top-2 text-gray-700" />
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-900 hover:bg-blue-700 text-white rounded-md text-sm"
            onClick={() => router.push('/pengeluaran/kategori')}
          >
            Kategori
          </button>
          <button
            className="px-4 py-2 bg-blue-900 hover:bg-blue-700 text-white rounded-md text-sm"
            onClick={() => router.push('/pengeluaran/tambah')}
          >
            + Tambah Pengeluaran
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left text-sm text-black">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-blue-900 text-white">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-2 border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
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
