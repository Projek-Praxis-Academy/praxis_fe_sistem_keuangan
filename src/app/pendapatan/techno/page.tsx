'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileSignature, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Siswa {
  nama_siswa: string
  nisn: string
  level: string
  akademik: string
  id_siswa: number
  tagihan_uang_kbm: number | string
  tagihan_uang_spp: number | string
  tagihan_uang_pemeliharaan: number | string
  tagihan_uang_sumbangan: string | null
  total: number | string
}

export default function PendapatanTechno() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedLevelTechno') || ''
  }
  return ''
})

  const [data, setData] = useState<Siswa[]>([])
  const router = useRouter()

  const [highlightNama, setHighlightNama] = useState<string | null>(null)
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Konversi "1.000.000" ke 1000000
  const parseFormattedNumber = (value: string | null | undefined): number => {
    if (!value || value === 'Lunas') return 0
    return Number(value.replace(/\./g, ''))
  }

  // Simpan level yang dipilih ke localStorage
  useEffect(() => {
    localStorage.setItem('selectedLevelTechno', selectedLevel)
  }, [selectedLevel])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-techno`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const siswaArray = response.data.data?.data || [];

        const fetchedData = siswaArray.map((item: any) => {
          const tagihan = item.tagihan

          const kbm = tagihan ? parseFormattedNumber(tagihan.tagihan_uang_kbm) : 0
          const spp = tagihan ? parseFormattedNumber(tagihan.tagihan_uang_spp) : 0
          const pemeliharaan = tagihan ? parseFormattedNumber(tagihan.tagihan_uang_pemeliharaan) : 0
          const sumbanganVal = tagihan ? parseFormattedNumber(tagihan.tagihan_uang_sumbangan) : 0

          // Helper untuk tampilkan 'Lunas' jika 0, '-' jika tidak ada tagihan
          const displayTagihan = (val: any) => {
            if (val === undefined || val === null) return '-'
            if (val === 0 || val === '0') return 'Lunas'
            return val
          }

          // Total juga 'Lunas' jika semua tagihan 0 dan tagihan ada
          const total = kbm + spp + pemeliharaan + sumbanganVal
          const isAllLunas = tagihan && kbm === 0 && spp === 0 && pemeliharaan === 0 && sumbanganVal === 0

          return {
            nama_siswa: item.nama_siswa,
            nisn: item.nisn,
            level: item.level,
            akademik: item.akademik,
            id_siswa: item.id_siswa,
            tagihan_uang_kbm: tagihan ? displayTagihan(kbm) : '-',
            tagihan_uang_spp: tagihan ? displayTagihan(spp) : '-',
            tagihan_uang_pemeliharaan: tagihan ? displayTagihan(pemeliharaan) : '-',
            tagihan_uang_sumbangan: tagihan
              ? (tagihan.tagihan_uang_sumbangan === '0' || sumbanganVal === 0 ? 'Lunas' : tagihan.tagihan_uang_sumbangan)
              : '-',
            total: tagihan ? (isAllLunas ? 'Lunas' : total) : '-',
          }
        })

        // --- Tambahkan logic ini ---
        const lastNama = localStorage.getItem('techno_last_nama')
        let sortedData = fetchedData
        if (lastNama) {
          const idx = fetchedData.findIndex((d: Siswa) => d.nama_siswa === lastNama)
          if (idx > -1) {
            const [item] = fetchedData.splice(idx, 1)
            sortedData = [item, ...fetchedData]
          }
        }
        setData(sortedData)
        // --- End logic ---

      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        console.error('Error response:', error.response?.data);
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const lastNama = localStorage.getItem('techno_last_nama')
    if (lastNama) {
      setHighlightNama(lastNama)
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightNama(null)
        localStorage.removeItem('techno_last_nama')
      }, 3000)
    }
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [data])

  useEffect(() => {
    if (highlightNama) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [highlightNama])

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
      { accessorKey: 'nama_siswa', header: 'Nama Siswa' },
      { accessorKey: 'nisn', header: 'NISN' },
      {
        accessorKey: 'tagihan_uang_kbm',
        header: 'KBM',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return (
            <span className={
              val === 'Lunas' ? 'text-green-600 font-bold' :
              val === '-' ? 'text-gray-400 italic' : ''
            }>
              {val === '-' ? '-' : val === 'Lunas' ? 'Lunas' : Number(val).toLocaleString('id-ID')}
            </span>
          )
        }
      },
      {
        accessorKey: 'tagihan_uang_spp',
        header: 'SPP',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return (
            <span className={
              val === 'Lunas' ? 'text-green-600 font-bold' :
              val === '-' ? 'text-gray-400 italic' : ''
            }>
              {val === '-' ? '-' : val === 'Lunas' ? 'Lunas' : Number(val).toLocaleString('id-ID')}
            </span>
          )
        }
      },
      {
        accessorKey: 'tagihan_uang_pemeliharaan',
        header: 'Pemeliharaan',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return (
            <span className={
              val === 'Lunas' ? 'text-green-600 font-bold' :
              val === '-' ? 'text-gray-400 italic' : ''
            }>
              {val === '-' ? '-' : val === 'Lunas' ? 'Lunas' : Number(val).toLocaleString('id-ID')}
            </span>
          )
        }
      },
      {
        accessorKey: 'tagihan_uang_sumbangan',
        header: 'Sumbangan',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return (
            <span className={
              val === 'Lunas' ? 'text-green-600 font-bold' :
              val === '-' ? 'text-gray-400 italic' : ''
            }>
              {val === '-' ? '-' : val}
            </span>
          )
        }
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return (
            <span className={
              val === 'Lunas' ? 'text-green-600 font-bold' :
              val === '-' ? 'text-gray-400 italic' : ''
            }>
              {val === '-' ? '-' : val === 'Lunas' ? 'Lunas' : Number(val).toLocaleString('id-ID')}
            </span>
          )
        }
      },
      {
        accessorKey: 'kontrak',
        header: 'Kontrak',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa
          return (
            <CreditCard
              id="kontrak"
              className="text-gray-600 cursor-pointer hover:text-blue-600"
              onClick={() => router.push(`/pendapatan/techno/detail-techno?id_siswa=${id_siswa}`)}
            />
          )
        }
      },
      {
        accessorKey: 'bayar',
        header: 'Bayar',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa
          return (
            <FileSignature
              id="bayar"
              className="text-gray-600 cursor-pointer hover:text-blue-600"
              onClick={() => router.push(`/pendapatan/techno/pembayaran-techno?id_siswa=${id_siswa}`)}
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
        <h2 className="text-3xl font-bold">Monitoring TechnoNatura</h2>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="flex justify-start gap-2 items-center">
          <select
            id="level-select"
            className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="I">Level I</option>
            <option value="II">Level II</option>
            <option value="III">Level III</option>
            <option value="IV">Level IV</option>
            <option value="V">Level V</option>
            <option value="VI">Level VI</option>
            <option value="VII">Level VII</option>
            <option value="VIII">Level VIII</option>
            <option value="IX">Level IX</option>
          </select>
          <div className="relative">
            <input
              id="search-techno"
              type="text"
              placeholder="Search..."
              className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={14} className="absolute left-2 top-2 text-gray-700" />
          </div>
          <button className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm" onClick={() => router.push('/pendapatan/techno/add-kontrak-techno')}> + Tambah Kontrak</button>
          <button className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm" onClick={() => router.push('/pendapatan/techno/siswa-techno')}>Data Siswa</button>
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
