'use client'

import { useEffect, useMemo, useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileSignature, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Siswa {
  no: number
  nama_siswa: string
  nisn: string
  level: string
  akademik: string
  tagihan_uang_kbm: number | null
  tagihan_uang_spp: number | null
  tagihan_uang_pemeliharaan: number | null
  tagihan_uang_sumbangan: string | null
}

export default function PendapatanPraxis() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('X')
  const [data, setData] = useState<Siswa[]>([])
  const router = useRouter()

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/monitoring', {
      headers: {
        Authorization: 'Bearer 4|osACJZuD070U2LqNSkRqP7GhgIwv0OumsOqcXmQl35a58ada'
      }
    })
    .then(res => {
      const fetchedData = res.data.data.map((item: any, index: number) => ({
        no: index + 1,
        ...item
      }))
      setData(fetchedData)
    })
    .catch(error => {
      console.error('Failed to fetch data:', error)
    })
  }, [])

  const filteredData = useMemo(() => {
    return data
      .filter((item) => item.level === selectedLevel)
      .filter((item) =>
        item.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nisn.includes(searchTerm) ||
        item.akademik.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [searchTerm, selectedLevel, data])

  const columns = useMemo(
    () => [
      { accessorKey: 'no', header: 'No' },
      { accessorKey: 'nama_siswa', header: 'Nama Siswa' },
      { accessorKey: 'tagihan_uang_kbm', header: 'KBM' },
      { accessorKey: 'tagihan_uang_spp', header: 'SPP' },
      { accessorKey: 'tagihan_uang_pemeliharaan', header: 'Pemeliharaan' },
      {
        accessorKey: 'tagihan_uang_sumbangan',
        header: 'Sumbangan',
        cell: ({ getValue }: any) => (
          <span className={getValue() === 'Lunas' ? 'text-green-600 font-bold' : ''}>{getValue()}</span>
        )
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }: any) => {
          const { tagihan_uang_kbm, tagihan_uang_spp, tagihan_uang_pemeliharaan, tagihan_uang_sumbangan } = row.original
          const sumbanganValue = isNaN(Number(tagihan_uang_sumbangan)) ? 0 : Number(tagihan_uang_sumbangan)
          const total =
            (tagihan_uang_kbm || 0) +
            (tagihan_uang_spp || 0) +
            (tagihan_uang_pemeliharaan || 0) +
            sumbanganValue
          return <span>{total.toLocaleString('id-ID')}</span>
        }
      },
      {
        accessorKey: 'kontrak',
        header: 'Kontrak',
        cell: ({ row }: any) => {
          const nisn = row.original.nisn
          return (
            <CreditCard
              className="text-gray-600 cursor-pointer"
              onClick={() => router.push(`/pendapatan/praxis/kontrak-siswa?nisn=${nisn}`)}
            />
          )
        }
      },
      {
        accessorKey: 'bayar',
        header: 'Bayar',
        cell: ({ row }: any) => {
          const nisn = row.original.nisn
          return (
            <FileSignature
              className="text-gray-600 cursor-pointer"
              onClick={() => router.push(`/pendapatan/praxis/pembayaran-siswa?nisn=${nisn}`)}
            />
          )
        }
      }
    ],
    [router]
  )

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Praxis Academy</h2>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="flex justify-start gap-2 items-center">
          <select
            className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="X">Level X</option>
            <option value="XI">Level XI</option>
            <option value="XII">Level XII</option>
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
          <button className="px-2 py-1 bg-gray-300 rounded-md text-sm text-black" onClick={() => router.push('/pendapatan/praxis/tambah-kontrak')}>Tambah Kontrak</button>
        </div>
        <button className="px-2 py-1 bg-gray-300 rounded-md text-sm text-black" onClick={() => alert('Fitur segera hadir')}>Cetak Tagihan</button>
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
