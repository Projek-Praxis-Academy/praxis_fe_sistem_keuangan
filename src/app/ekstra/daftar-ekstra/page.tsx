'use client'

import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search } from 'lucide-react'

export default function DaftarEkstra() {
  const [searchTerm, setSearchTerm] = useState('')

  // Data Dummy Ekstrakurikuler
  const allData = useMemo(() => [
    { nama: 'Basket', harga: '300.000' },
    { nama: 'Futsal', harga: '250.000' },
    { nama: 'Pramuka', harga: '200.000' },
    { nama: 'Paskibra', harga: '220.000' },
    { nama: 'English Club', harga: '280.000' },
    { nama: 'Musik', harga: '350.000' },
    { nama: 'Robotik', harga: '400.000' },
    { nama: 'Jurnalistik', harga: '230.000' },
    { nama: 'Tari Tradisional', harga: '270.000' },
  ], [])

  // Filter data berdasarkan pencarian
  const filteredData = useMemo(() => {
    return allData.filter((row) =>
      row.nama.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, allData])

  // Definisi Kolom
  const columns = useMemo(
     () => [
       { accessorKey: 'nama', header: 'Nama Ekstra' },
       {
         accessorKey: 'harga',
         header: 'Harga Ekstra',
         cell: ({ getValue }) => `Rp ${getValue()}`
       },
     ],
     []
   )
   

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Daftar Ekstrakurikuler</h2>
      </div>

      {/* Search */}
      <div className="flex justify-start gap-2 items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama ekstra..."
            className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute left-2 top-2 text-gray-700" />
        </div>
      </div>

      {/* Tabel Ekstra */}
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
