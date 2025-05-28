'use client'

import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileText, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SiswaUangSaku {
  no: number
  id_siswa: number
  nama_siswa: string
  saldo: string // Perubahan: saldo disimpan sebagai string yang sudah diformat
  level: string
}

const levelOptions = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"
]

export default function MonitoringUangSaku() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<SiswaUangSaku[]>([])
  const [selectedLevel, setSelectedLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLevel') || 'I'
    }
    return 'I'
  });

  useEffect(() => {
        localStorage.setItem('selectedLevel', selectedLevel)
      }, [selectedLevel])


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const response = await axios.get('https://fitrack-production.up.railway.app/api/monitoring-uang-saku', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const siswaList = response.data.data || []

        const formattedData = siswaList.map((item: any, index: number) => {
          return {
            no: index + 1,
            id_siswa: item.id_siswa,
            nama_siswa: item.nama_siswa,
            saldo: item.uang_saku?.saldo || "0",  // Menyimpan saldo sebagai string yang sudah diformat
            level: item.level
          }
        })

        setData(formattedData)
      } catch (error) {
        console.error('Gagal mengambil data:', error)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data
      .filter(item => item.level === selectedLevel)
      .filter(item =>
        item.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [searchTerm, selectedLevel, data])

  const columns = useMemo(
    () => [
      { accessorKey: 'nama_siswa', header: 'Nama Siswa' },
      { accessorKey: 'saldo', header: 'Saldo',
        cell: ({ getValue }: any) => <span>Rp {getValue()}</span>  // Menampilkan saldo tanpa perubahan format
      },
      {
        accessorKey: 'topup',
        header: 'TopUp',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa
          return (
            <button
              className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
              onClick={() => router.push(`/uang-saku/topUp?id_siswa=${id_siswa}`)}
            >
              TopUp
            </button>
          )
        },
      },
      {
        accessorKey: 'pengeluaran',
        header: 'Pengeluaran',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa
          return (
            <button
              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
              onClick={() => router.push(`/uang-saku/pengeluaran?id_siswa=${id_siswa}`)}
            >
              Pengeluaran
            </button>
          )
        },
      },
      {
        accessorKey: 'riwayat',
        header: 'Riwayat',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa
          return (
            <CreditCard
              className="text-gray-600 cursor-pointer hover:text-blue-600"
              onClick={() => router.push(`/uang-saku/detail?id_siswa=${id_siswa}`)}
            />
          )
        },
      },
    ],
    [router]
  )

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Uang Saku</h2>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <select
            className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {levelOptions.map(level => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={14} className="absolute left-2 top-2 text-gray-700" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left text-sm text-black">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-blue-900 text-white">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-2 border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border">
                {row.getVisibleCells().map(cell => (
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
