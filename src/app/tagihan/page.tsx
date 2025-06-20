'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import axios from 'axios'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileText, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TagihanSiswa {
  id_hasil_tagihan: string
  nama_siswa: string
  level: string
  created_at: string
  file_tagihan: string
}

const levelOptions = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"
]

export default function RiwayatTagihan() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<TagihanSiswa[]>([])
  const [selectedLevel, setSelectedLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLevel') || 'I'
    }
    return 'I'
  })
  const [highlightNama, setHighlightNama] = useState<string | null>(null)
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Simpan level yang dipilih ke localStorage
  useEffect(() => {
    localStorage.setItem('selectedLevel', selectedLevel)
  }, [selectedLevel])


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tagihan`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const result = response.data.data?.data || []

        setData(result)
      } catch (error) {
        console.error('Gagal mengambil data tagihan:', error)
      }
    }

    fetchData()
  }, [])

  // Highlight data terbaru
  useEffect(() => {
    const lastNama = localStorage.getItem('tagihan_last_nama')
    if (lastNama) {
      setHighlightNama(lastNama)
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightNama(null)
        localStorage.removeItem('tagihan_last_nama')
      }, 3000)
    }
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [data]) // data: array siswa/tagihan yang ditampilkan di tabel

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
      {
        accessorKey: 'created_at',
        header: 'Tanggal Tagihan',
        cell: ({ getValue }: any) => {
          const date = new Date(getValue())
          return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        },
      },
      {
        accessorKey: 'file_tagihan',
        header: 'Detail',
        cell: ({ row }: any) => {
          const url = row.original.file_tagihan
          return (
            <a href={`https://fitrack-production.up.railway.app/${url}`} target="_blank" rel="noopener noreferrer">
              <FileText className="text-blue-600 hover:text-blue-800 cursor-pointer" />
            </a>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Riwayat Tagihan Siswa</h2>
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
              id="search"
              type="text"
              placeholder="Search..."
              className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={14} className="absolute left-2 top-2 text-gray-700" />
          </div>
        </div>

        <button
          className="flex items-center gap-1 bg-blue-900 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
          onClick={() => router.push('/tagihan/add')}
        >
          <Plus size={16} />
          Tambah Tagihan
        </button>
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
              <tr
                key={row.id}
                className={`border transition-colors duration-500 ${
                  highlightNama && row.original.nama_siswa === highlightNama
                    ? 'bg-yellow-200'
                    : ''
                }`}
              >
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
