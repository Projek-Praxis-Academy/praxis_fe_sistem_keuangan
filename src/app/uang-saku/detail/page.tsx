'use client'

import { useState, useMemo } from 'react'
import { StickyNote } from 'lucide-react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

export default function DetailUangSaku() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('1')

  // Data Dummy berdasarkan Level
  const allData = useMemo(() => {
    const levels = {}
    for (let i = 1; i <= 12; i++) {
      levels[i] = Array.from({ length: i + 5 }, (_, j) => ({
        no: j + 1,
        tanggal: `2025-04-${(j + 10).toString().padStart(2, '0')}`,
        pengeluaran: 500000 + j * 10000,
        topup: 600000 + j * 15000,
        catatan: `Top up bulanan ${j + 1}`
      }))
    }
    return levels[selectedLevel] || []
  }, [selectedLevel])

  // Filter data berdasarkan pencarian
  const filteredData = useMemo(() => {
    return allData.filter((row) => row.tanggal.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm, allData])

  // Definisi Kolom
  const columns = useMemo(
     () => [
       { accessorKey: 'no', header: 'No' },
       { accessorKey: 'tanggal', header: 'Tanggal' },
       { accessorKey: 'pengeluaran', header: 'Pengeluaran' },
       { accessorKey: 'topup', header: 'TopUp' },
       {
         accessorKey: 'catatan',
         header: 'Catatan',
         cell: () => <StickyNote className="text-blue-600 w-5 h-5 mx-auto" />
       },
     ],
    []
  )

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Detail Uang Saku</h2>
      </div>

      {/* Informasi Siswa */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-lg font-semibold">Nama: John Doe</div>
          <div className="text-sm text-gray-600">Level: {selectedLevel}</div>
        </div>
        <div className="text-lg font-semibold text-right">
          Saldo: <span className="text-green-600">Rp 5.000.000</span>
        </div>
      </div>

      {/* Table Uang Saku */}
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
