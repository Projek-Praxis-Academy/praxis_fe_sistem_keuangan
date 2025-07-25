'use client'

import { useState, useMemo, useEffect, useRef, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileSignature, CreditCard, X, Pencil } from 'lucide-react'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'

function SuccessAlertEkstra() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(true)

  const successParam = searchParams.get('success')
  const isTambah = successParam && successParam.toLowerCase().includes('tambah')
  const isBayar = successParam && successParam.toLowerCase().includes('pembayar')

  let alertMsg = ''
  if (isTambah) alertMsg = 'Data siswa berhasil ditambahkan!'
  if (isBayar) alertMsg = 'Pembayaran siswa berhasil dilakukan!'

  useEffect(() => {
    if (alertMsg) {
      setShow(true)
      const timeout = setTimeout(() => {
        setShow(false)
        router.replace('/ekstra')
      }, 25000)
      return () => clearTimeout(timeout)
    }
  }, [alertMsg, router])

  if (!alertMsg || !show) return null

  return (
    <div className="relative text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500 flex items-center">
      <p className="font-medium flex-1">{alertMsg}</p>
      <button
        onClick={() => {
          setShow(false)
          router.replace('/ekstra')
        }}
        className="absolute right-3 top-3 text-green-700 hover:text-green-900"
        aria-label="Tutup"
        type="button"
      >
        <X size={18} />
      </button>
    </div>
  )
}

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
  const [highlightNama, setHighlightNama] = useState<string | null>(null)
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isCreatingTunggakan, setIsCreatingTunggakan] = useState(false)
  const [tunggakanSuccess, setTunggakanSuccess] = useState('')
  const [tunggakanError, setTunggakanError] = useState('')

  // Simpan level yang dipilih ke localStorage
  useEffect(() => {
    localStorage.setItem('selectedLevel', selectedLevel)
  }, [selectedLevel])

  const fetchData = useCallback(async () => {
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

        // Cek localStorage, jika belum ada baru set ke level pertama yang tersedia
        const storedLevel = localStorage.getItem('selectedLevel')
        if (!storedLevel) {
          const firstAvailableLevel = levels.find(level =>
            formattedData.some((item: { level: string }) => item.level === level)
          ) || "I"
          setSelectedLevel(firstAvailableLevel)
        }

        // Urutkan berdasarkan siswa terbaru di atas
        const lastNama = localStorage.getItem('ekstra_last_nama')
        let sortedData = formattedData
        if (lastNama) {
          const idx = formattedData.findIndex((d: any) => d.nama_siswa === lastNama)
          if (idx > -1) {
            const [item] = formattedData.splice(idx, 1)
            sortedData = [item, ...formattedData]
          }
        }
        setData(sortedData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fungsi untuk membuat tunggakan ekstra per siswa (semua ekstra sekaligus)
  const handleCreateTunggakanEkstra = useCallback(async (siswa: any) => {
    // Filter hanya ekstra yang belum lunas
    const unpaidEkstra = siswa.ekstra.filter((e: any) => {
      const isLunas = e.tagihan_ekstra === 'Lunas'
      const isEmpty = e.tagihan_ekstra === '0' || e.tagihan_ekstra === '-' || e.tagihan_ekstra === ''
      return !isLunas && !isEmpty
    })

    // Jika tidak ada ekstra yang belum lunas, berhenti
    if (unpaidEkstra.length === 0) {
      setTunggakanError(`Tidak ada ekstra yang belum lunas untuk ${siswa.nama_siswa}`)
      setTimeout(() => setTunggakanError(''), 3000)
      return
    }

    // Konfirmasi dengan pengguna
    if (!confirm(`Buat tunggakan untuk semua ekstra ${siswa.nama_siswa}?`)) {
      return
    }

    setIsCreatingTunggakan(true)
    setTunggakanError('')
    setTunggakanSuccess('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setTunggakanError('Token tidak ditemukan, harap login ulang')
        return
      }

      // Dapatkan tahun periode
      const currentYear = new Date().getFullYear()
      const periode = `${currentYear}/${currentYear + 1}`

      // Format tagihan sesuai dengan yang diharapkan controller
      const tagihanItems = unpaidEkstra.map((e: any) => ({
        nama_tagihan: e.nama_ekstra,
        nominal: parseInt((e.tagihan_ekstra || '0').replace(/\D/g, ''))
      }))

      // Siapkan data untuk dikirim sesuai format controller
      const dataToSend = {
        id_siswa: siswa.id_siswa.toString(),
        nama_siswa: siswa.nama_siswa,
        jenis_tagihan: 'Ekstra',
        periode: periode,
        tagihan: tagihanItems
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tunggakan/create`,
        dataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.status === 'success') {
        setTunggakanSuccess(`Tunggakan ekstra berhasil dibuat untuk ${siswa.nama_siswa} (${unpaidEkstra.length} ekstra)!`)
        setTimeout(() => {
          fetchData()
          setTunggakanSuccess('')
        }, 2000)
      } else {
        setTunggakanError(response.data.message || 'Gagal membuat tunggakan ekstra')
      }
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.response?.data?.message ||
        err.response?.data?.errors?.join('\n') ||
        'Terjadi kesalahan saat membuat tunggakan ekstra'
      setTunggakanError(errorMsg)
    } finally {
      setIsCreatingTunggakan(false)
    }
  }, [fetchData])

  // Highlight data terbaru
  useEffect(() => {
    const lastNama = localStorage.getItem('ekstra_last_nama')
    if (lastNama) {
      setHighlightNama(lastNama)
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightNama(null)
        localStorage.removeItem('ekstra_last_nama')
      }, 3000)
    }
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [data])

  // Scroll otomatis ke atas saat highlightNama aktif
  useEffect(() => {
    if (highlightNama) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [highlightNama])

  const filteredData = useMemo(() => {
    return data
      .filter(row => row.level === selectedLevel)
      .filter(row =>
        row.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [searchTerm, selectedLevel, data])

  const columns = useMemo(
    () => [
      { accessorKey: 'nama_siswa', header: 'Nama Siswa' },
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
                ekstraList.map((e: any, index: number) => {
                  const isLunas = e.tagihan_ekstra === 'Lunas'
                  const isEmpty = e.tagihan_ekstra === '0' || e.tagihan_ekstra === '0' || e.tagihan_ekstra === '-'
                  const nominal = parseInt((e.tagihan_ekstra || '0').replace(/\D/g, ''))
                  
                  return (
                    <div key={index} className="border-b last:border-b-0 py-1">
                      {isLunas ? (
                        <span className="text-green-600 font-bold">Lunas</span>
                      ) : isEmpty ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <span>
                          Rp{nominal.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  )
                })
              ) : (
                <span className="text-gray-500 italic">-</span>
              )}
            </div>
          )
        }
      },
      {
        accessorKey: 'edit',
        header: 'Edit',
        cell: ({ row }: any) => {
          const router = useRouter()
          const ekstraList = row.original.ekstra || []

          return (
            <div className="flex flex-col pl-2 justify-center">
              {ekstraList.length > 0 ? (
                ekstraList.map((e: any, index: number) => (
                  <div key={index} className="border-b last:border-b-0 py-1">
                    <button
                      onClick={() => router.push(`/ekstra/edit/${e.id_ekstra_siswa}`)}
                      className="text-blue-600 hover:text-blue-800"
                      title={`Edit ${e.nama_ekstra}`}
                    >
                      <Pencil size={20}></Pencil>
                    </button>
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
      },
      {
        accessorKey: 'tunggakan',
        header: 'Tunggakan',
        cell: ({ row }: any) => {
          const siswa = row.original
          const ekstraList = row.original.ekstra || []
          
          // Cek apakah ada ekstra yang belum lunas
          const hasUnpaidEkstra = ekstraList.some((e: any) => {
            const isLunas = e.tagihan_ekstra === 'Lunas'
            const isEmpty = e.tagihan_ekstra === '0' || e.tagihan_ekstra === '0' || e.tagihan_ekstra === '-'
            return !isLunas && !isEmpty
          })
          
          return (
            <div className="flex justify-center pl-2">
              {hasUnpaidEkstra ? (
                <span
                  id="tunggakan-ekstra"
                  title={`Buat tunggakan untuk semua ekstra ${siswa.nama_siswa}`}
                  className={`text-gray-600 cursor-pointer ${
                    isCreatingTunggakan ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (!isCreatingTunggakan) handleCreateTunggakanEkstra(siswa)
                  }}
                >
                  <FileSignature />
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          )
        }
      }
    ],
    [router, isCreatingTunggakan, handleCreateTunggakanEkstra]
  )

  const table = useReactTable({ 
    data: filteredData, 
    columns, 
    getCoreRowModel: getCoreRowModel() 
  })

  if (isLoading) {
    return (
      <div className="ml-64 flex-1 bg-white min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-blue-900 font-semibold">Memuat data ekstrakurikuler...</p>
          <p className="text-sm text-gray-500 mt-2">Mohon tunggu, sedang mengambil data dari server.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Ekstrakurikuler</h2>
      </div>

      {/* ALERT SUCCESS */}
      <Suspense fallback={null}>
        <SuccessAlertEkstra />
      </Suspense>

      {/* Alert untuk tunggakan */}
      {tunggakanSuccess && (
        <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
          <p className="font-medium">{tunggakanSuccess}</p>
        </div>
      )}
      {tunggakanError && (
        <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
          <p className="font-medium">{tunggakanError}</p>
        </div>
      )}

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
            Tambah Kontrak
          </Link>
          <Link
            id='biaya-ekstra'
            href="/ekstra/daftar-ekstra"
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm"
          >
            Biaya Ekstra
          </Link>
          <Link
            id='tambah-tunggakan'
            href="/tunggakan/tambah-tunggakan"
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm"
          >
            + Tambah Tunggakan
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
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
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                  Tidak ada data yang ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}