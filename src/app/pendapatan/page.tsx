'use client'

import { useState, useMemo } from 'react'

import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileText, StickyNote } from 'lucide-react'

export default function PendapatanTechno() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('10')
  const router = useRouter()

  // Data Dummy berdasarkan Level
  const allData = useMemo(() => {
    const levels = {
      '1': Array.from({ length: 10 }, (_, i) => ({ no: i + 1, nama: `Siswa L1-${i + 1}`, KBM: 2500000, SPP: 1000000, Pemeliharaan: 500000, Sumbangan: 'Lunas', Total: 6700000, Notes: '-' })),
      '2': Array.from({ length: 12 }, (_, i) => ({ no: i + 1, nama: `Siswa L2-${i + 1}`, KBM: 2600000, SPP: 1100000, Pemeliharaan: 520000, Sumbangan: 'Lunas', Total: 6990000, Notes: '-' })),
      '3': Array.from({ length: 15 }, (_, i) => ({ no: i + 1, nama: `Siswa L3-${i + 1}`, KBM: 2700000, SPP: 1200000, Pemeliharaan: 530000, Sumbangan: 'Lunas', Total: 7160000, Notes: '-' })),
      '4': Array.from({ length: 10 }, (_, i) => ({ no: i + 1, nama: `Siswa L4-${i + 1}`, KBM: 2500000, SPP: 1000000, Pemeliharaan: 500000, Sumbangan: 'Lunas', Total: 6700000, Notes: '-' })),
      '5': Array.from({ length: 12 }, (_, i) => ({ no: i + 1, nama: `Siswa L5-${i + 1}`, KBM: 2600000, SPP: 1100000, Pemeliharaan: 520000, Sumbangan: 'Lunas', Total: 6990000, Notes: '-' })),
      '6': Array.from({ length: 15 }, (_, i) => ({ no: i + 1, nama: `Siswa L6-${i + 1}`, KBM: 2700000, SPP: 1200000, Pemeliharaan: 530000, Sumbangan: 'Lunas', Total: 7160000, Notes: '-' })),
      '7': Array.from({ length: 10 }, (_, i) => ({ no: i + 1, nama: `Siswa L7-${i + 1}`, KBM: 2500000, SPP: 1000000, Pemeliharaan: 500000, Sumbangan: 'Lunas', Total: 6700000, Notes: '-' })),
      '8': Array.from({ length: 12 }, (_, i) => ({ no: i + 1, nama: `Siswa L8-${i + 1}`, KBM: 2600000, SPP: 1100000, Pemeliharaan: 520000, Sumbangan: 'Lunas', Total: 6990000, Notes: '-' })),
      '9': Array.from({ length: 15 }, (_, i) => ({ no: i + 1, nama: `Siswa L9-${i + 1}`, KBM: 2700000, SPP: 1200000, Pemeliharaan: 530000, Sumbangan: 'Lunas', Total: 7160000, Notes: '-' }))
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
      { accessorKey: 'KBM', header: 'KBM' },
      { accessorKey: 'SPP', header: 'SPP' },
      { accessorKey: 'Pemeliharaan', header: 'Pemeliharaan' },
      {
        accessorKey: 'Sumbangan',
        header: 'Sumbangan',
        cell: ({ getValue }) => (
          <span className={getValue() === 'Lunas' ? 'text-green-600 font-bold' : ''}>{getValue()}</span>
        )
      },
      { accessorKey: 'Total', header: 'Total' },
      {
        accessorKey: 'Notes',
        header: 'Notes',
        cell: () => (
          <StickyNote
            className="text-blue-600 cursor-pointer"
            onClick={() => alert('Fitur akan segera hadir')}
          />
        )
      },
      {
        accessorKey: 'Detail',
        header: 'Detail',
        cell: () => (
          <FileText
            className="text-gray-600 cursor-pointer"
            onClick={() => alert('Fitur akan segera hadir')}
          />
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
        <h2 className="text-3xl font-bold">Techno Nature</h2>
      </div>

      {/* Filter & Search */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex justify-start gap-2 items-center">
          <select
            className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {Array.from({ length: 3 }, (_, i) => (
              <option key={i + 10} value={i + 10}>Level {i + 10}</option>
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
          <button className="px-2 py-1 bg-gray-300 rounded-md text-sm text-black" onClick={() => router.push('http://127.0.0.1:3000/pendapatan/techno/tambah-kontrak')}>Tambah Kontrak</button>
        </div>
        <button className="px-2 py-1 bg-gray-300 rounded-md text-sm text-black" onClick={() => alert('Fitur segera hadir')}>Cetak Tagihan</button>
      </div>

      {/* Table Pendapatan */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left text-sm text-black">
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
