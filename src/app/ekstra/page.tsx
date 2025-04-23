'use client'

import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileText } from 'lucide-react'

export default function Ekstra() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('1')
  const [darkMode] = useState(false)

  // Data Dummy berdasarkan Level
  const allData = useMemo(() => {
    const levels = {}
    for (let i = 1; i <= 12; i++) {
      levels[i] = Array.from({ length: i + 5 }, (_, j) => ({
        no: j + 1,
        nama: `Siswa L${i}-${j + 1}`,
        ekstra: 'Basket',
        tagihan: '300.000'
      }))
    }
    return levels[selectedLevel] || []
  }, [selectedLevel])

  // Filter data berdasarkan pencarian
  const filteredData = useMemo(() => {
    return allData.filter((row) => row.nama.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm, allData])

  // Definisi Kolom
  const columns = useMemo(
    () => [
      { accessorKey: 'no', header: 'No' },
      { accessorKey: 'nama', header: 'Nama Siswa' },
      { accessorKey: 'ekstra', header: 'Ekstra' },
      { accessorKey: 'tagihan', header: 'Tagihan' },
      {
        accessorKey: 'catatan',
        header: 'Catatan',
        cell: () => (
          <FileText className="text-gray-600 cursor-pointer" onClick={() => alert('Catatan akan segera hadir')} />
        )
      },
      {
        accessorKey: 'tagihan_icon',
        header: 'Tagihan',
        cell: () => (
          <FileText className="text-gray-600 cursor-pointer" onClick={() => alert('Tagihan akan segera hadir')} />
        )
      },
      {
        accessorKey: 'kontrak',
        header: 'Kontrak',
        cell: () => (
          <FileText className="text-gray-600 cursor-pointer" onClick={() => alert('Kontrak akan segera hadir')} />
        )
      }
    ],
    []
  )

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Ekstrakurikuler</h2>
      </div>
      {/* Filter & Search */}
      <div className="flex justify-start gap-2 items-center mb-4">
        <select
          className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
        >
          {[...Array(9)].map((_, i) => (
            <option key={i + 1} value={i + 1}>Level {i + 1}</option>
          ))}
          <option value="10">Level 10-12</option>
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
        <div className="flex-1 flex justify-end">
          <button className="px-3 py-1 bg-gray-300 text-black rounded-md text-sm" onClick={() => alert('Fitur akan segera hadir')}>Kontrak</button>
        </div>
      </div>
      {/* Table Ekstrakurikuler */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-blue-900 text-white">
              {table.getHeaderGroups().map(headerGroup => (
                headerGroup.headers.map(header => (
                  <th key={header.id} className="p-2 border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))
              ))}
            </tr>
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
