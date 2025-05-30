'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileSignature, CreditCard } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function Ekstra() {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [levelOptions, setLevelOptions] = useState<string[]>([])
  const router = useRouter()
  const [selectedLevel, setSelectedLevel] = useState(() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('selectedLevel') || 'I'
      }
      return 'I'
    });
  

  // Simpan level yang dipilih ke localStorage
  useEffect(() => {
        localStorage.setItem('selectedLevel', selectedLevel)
      }, [selectedLevel])

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem('token') || ''
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
  
        if (response.data.status === 'success') {
          const siswaList = response.data.data.data
  
          const formattedData = siswaList.map((item: any, index: number) => ({
            no: index + 1,
            id_siswa: item.id_siswa,
            nama_siswa: item.nama_siswa,
            nisn: item.nisn,
            akademik: item.akademik,
            level: item.level ?? '',
            ekstra: item.ekstra || []
          }))
  
          // Tetapkan level I hingga XII secara manual
          const levels = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
          setLevelOptions(levels)
  
          // Cari level pertama yang ada dalam data, fallback ke "I"
          const firstAvailableLevel = levels.find(level =>
            formattedData.some((item: { level: string }) => item.level === level)
          ) || "I"
          setSelectedLevel(firstAvailableLevel) // Setel level pertama
  
          setData(formattedData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data
      .filter(row => row.level === selectedLevel)
      .filter(row =>
        row.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [searchTerm, selectedLevel, data])

  const columns = useMemo(
    () => [
      { accessorKey: 'nama_siswa', header: 'Nama Siswa' }, // Hanya tampilkan Nama Siswa
      {
        accessorKey: 'ekstra',
        header: 'Ekstra',
        cell: ({ row }: any) => {
          const ekstraList = row.original.ekstra || []
          return (
            <div className="flex flex-col pl-2">
              {ekstraList.length > 0 ? (
                ekstraList.map((e: any, index: number) => (
                  <div key={index} className="border-b last:border-b-0 py-1">
                    {e.nama_ekstra}
                  </div>
                ))
              ) : (
                <span className="text-gray-500 italic">Tidak ada ekstra</span>
              )}
            </div>
          )
        }
      },
      {
        accessorKey: 'tagihan',
        header: 'Tagihan',
        cell: ({ row }: any) => {
          const ekstraList = row.original.ekstra || []
          return (
            <div className="flex flex-col pl-2">
              {ekstraList.length > 0 ? (
                ekstraList.map((e: any, index: number) => (
                  <div key={index} className="border-b last:border-b-0 py-1">
                  <span key={index}>
                    Rp{parseInt((e.tagihan_ekstra || '0').replace(/\D/g, '')).toLocaleString('id-ID')}
                  </span>
                  </div>
                ))
              ) : (
                <span className="text-gray-500 italic">-</span>
              )}
            </div>
          )
        }
      },
      {
        accessorKey: 'bayar',
        header: 'Bayar',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa
          const ekstraList = row.original.ekstra || []
      
          return (
            <div className="flex flex-col pl-2">
              {ekstraList.length > 0 ? (
                ekstraList.map((e: any, index: number) => (
                  <div key={index} className="border-b last:border-b-0 py-1">
                    <span
                      id="bayar-ekstra"
                      title={`Bayar ${e.nama_ekstra}`}
                      className="text-gray-600 cursor-pointer"
                      onClick={() => {
                        // Simpan data siswa ke localStorage
                        localStorage.setItem('ekstra_siswa_detail', JSON.stringify({
                          id_siswa,
                          nama_siswa: row.original.nama_siswa,
                          nisn: row.original.nisn,
                          level: row.original.level,
                          akademik: row.original.akademik,
                        }))
                        router.push(`/ekstra/pembayaran-ekstra?id_siswa=${id_siswa}&id_ekstra_siswa=${e.id_ekstra_siswa}`)
                      }}
                    >
                      <FileSignature />
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 italic">-</span>
              )}
            </div>
          )
        }
      },
      {
        accessorKey: 'riwayat',
        header: 'Riwayat',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa
          const ekstraList = row.original.ekstra || []
      
          return (
            <div className="flex flex-col pl-2">
              {ekstraList.length > 0 ? (
                ekstraList.map((e: any, index: number) => (
                  <div key={index} className="border-b last:border-b-0 py-1">
                    <span
                      id='riwayat-ekstra'
                      className="text-gray-600 cursor-pointer"
                      title={`Riwayat ${e.nama_ekstra}`}
                      onClick={() =>
                        router.push(`/ekstra/detail-siswa-ekstra?id_siswa=${id_siswa}&id_ekstra_siswa=${e.id_ekstra_siswa}`)
                      }
                    >
                    <CreditCard />
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 italic">-</span>
              )}
            </div>
          )
        }
      }            
    ],
    []
  )

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Ekstrakurikuler</h2>
      </div>

      <div className="flex justify-start gap-2 items-center mb-4">
        <select
          id="level-ekstra"
          className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
        >
          {levelOptions.map(level => (
            <option key={level} value={level}>Level {level}</option>
          ))}
        </select>

        <div className="relative">
          <input
            id='search-ekstra'
            type="text"
            placeholder="Search..."
            className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute left-2 top-2 text-gray-700" />
        </div>

        <div className="flex-1 flex justify-end gap-2">
          <Link
            id='tambah-kontrak-ekstra'
            href="/ekstra/tambah-siswa"
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm"
          >
           + Tambah Kontrak
          </Link>
          <Link
            id='biaya-ekstra'
            href="/ekstra/daftar-ekstra"
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm"
          >
            Biaya Ekstra
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-blue-900 text-white">
              {table.getHeaderGroups().map(headerGroup =>
                headerGroup.headers.map(header => (
                  <th key={header.id} className="p-2 border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">Loading...</td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-2 border">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
