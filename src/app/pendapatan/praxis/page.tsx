'use client'

import { useEffect, useMemo, useState, useRef, Suspense, useCallback } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Search, FileSignature, CreditCard, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

interface Siswa {
  nama_siswa: string
  level: string
  id_siswa: number
  tagihan_uang_kbm: number
  tagihan_uang_spp: number
  tagihan_uang_pemeliharaan: number
  tagihan_uang_sumbangan: number
  total: number
  nisn: string // Tambahkan nisn untuk kebutuhan tunggakan
}

function PendapatanPraxisInner() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLevel') || ''
    }
    return ''
  })
  const [data, setData] = useState<Siswa[]>([])
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null)
  const [highlightNama, setHighlightNama] = useState<string | null>(null)
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingTunggakan, setIsCreatingTunggakan] = useState(false)
  const [tunggakanSuccess, setTunggakanSuccess] = useState('')
  const [tunggakanError, setTunggakanError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Simpan level yang dipilih ke localStorage
  useEffect(() => {
    localStorage.setItem('selectedLevel', selectedLevel)
  }, [selectedLevel])

  // Fungsi untuk mengambil semua data dari semua halaman
  const fetchAllData = async (token: string) => {
    let allData: any[] = []
    let currentPage = 1
    let lastPage = 1

    try {
      // Request pertama untuk mendapatkan metadata pagination
      const firstResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-praxis?page=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      const firstData = firstResponse.data.data
      lastPage = firstData.last_page
      allData = [...firstData.data]

      // Jika ada halaman tambahan, ambil semua
      if (lastPage > 1) {
        const requests = []
        for (let page = 2; page <= lastPage; page++) {
          requests.push(
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/monitoring-praxis?page=${page}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        }

        // Eksekusi semua request secara paralel
        const responses = await Promise.all(requests)
        responses.forEach(response => {
          const pageData = response.data.data.data
          allData = [...allData, ...pageData]
        })
      }

      return allData
    } catch (error) {
      console.error('Error fetching all pages:', error)
      throw error
    }
  }

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token') || ''
      
      // Ambil semua data dari semua halaman
      const siswaArray = await fetchAllData(token)

      const fetchedData = siswaArray.map((item: any) => {
        // Inisialisasi nilai default
        let kbm = 0
        let spp = 0
        let pemeliharaan = 0
        let sumbanganVal = 0

        // Proses tagihan jika ada
        if (Array.isArray(item.tagihan) && item.tagihan.length > 0) {
          item.tagihan.forEach((tagih: any) => {
            const nominal = tagih.nominal || 0
            const nama = tagih.nama_tagihan?.toLowerCase()
            
            if (nama === 'kbm') kbm = nominal
            if (nama === 'spp') spp = nominal
            if (nama === 'pemeliharaan') pemeliharaan = nominal
            if (nama === 'sumbangan') sumbanganVal = nominal
          })
        }

        // Hitung total tagihan
        const total = kbm + spp + pemeliharaan + sumbanganVal

        return {
          nama_siswa: item.nama_siswa,
          level: item.level || '-',
          id_siswa: item.id_siswa,
          nisn: item.nisn, // Pastikan nisn disertakan
          tagihan_uang_kbm: kbm,
          tagihan_uang_spp: spp,
          tagihan_uang_pemeliharaan: pemeliharaan,
          tagihan_uang_sumbangan: sumbanganVal,
          total: total,
        }
      })

      // Urutkan berdasarkan siswa terbaru di atas
      const lastNama = localStorage.getItem('praxis_last_nama')
      let sortedData = fetchedData
      if (lastNama) {
        const idx = fetchedData.findIndex((d: Siswa) => d.nama_siswa === lastNama)
        if (idx > -1) {
          const [item] = fetchedData.splice(idx, 1)
          sortedData = [item, ...fetchedData]
        }
      }

      setData(sortedData)
    } catch (error: any) {
      console.error('Failed to fetch data:', error)
      console.error('Error response:', error.response?.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fungsi untuk membuat tunggakan dengan satu klik
  const handleCreateTunggakan = useCallback(async (siswa: Siswa) => {
    // Konfirmasi dengan pengguna
    if (!confirm(`Buat tunggakan untuk ${siswa.nama_siswa}?`)) {
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

      // Siapkan data tagihan
      const tagihanItems = []
      if (siswa.tagihan_uang_spp > 0) {
        tagihanItems.push({
          nama_tagihan: 'SPP',
          nominal: siswa.tagihan_uang_spp
        })
      }
      if (siswa.tagihan_uang_kbm > 0) {
        tagihanItems.push({
          nama_tagihan: 'KBM',
          nominal: siswa.tagihan_uang_kbm
        })
      }
      if (siswa.tagihan_uang_pemeliharaan > 0) {
        tagihanItems.push({
          nama_tagihan: 'Pemeliharaan',
          nominal: siswa.tagihan_uang_pemeliharaan
        })
      }
      if (siswa.tagihan_uang_sumbangan > 0) {
        tagihanItems.push({
          nama_tagihan: 'Sumbangan',
          nominal: siswa.tagihan_uang_sumbangan
        })
      }

      // Jika tidak ada tagihan, berhenti
      if (tagihanItems.length === 0) {
        setTunggakanError('Tidak ada tagihan untuk dibuatkan tunggakan')
        return
      }

      // Dapatkan tahun periode
      const currentYear = new Date().getFullYear()
      const periode = `${currentYear}/${currentYear + 1}`

      // Siapkan data untuk dikirim
      const dataToSend = {
        id_siswa: siswa.id_siswa.toString(),
        nama_siswa: siswa.nama_siswa,
        jenis_tagihan: 'Umum',
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
        setTunggakanSuccess(`Tunggakan berhasil dibuat untuk ${siswa.nama_siswa}!`)
        
        // Refresh data setelah beberapa detik
        setTimeout(() => {
          fetchData()
          setTunggakanSuccess('')
        }, 2000)
      } else {
        setTunggakanError(response.data.message || 'Gagal membuat tunggakan')
      }
    } catch (err: any) {
      console.error(err)
      setTunggakanError(err.response?.data?.message || 'Terjadi kesalahan saat membuat tunggakan')
    } finally {
      setIsCreatingTunggakan(false)
    }
  }, [fetchData])

  const filteredData = useMemo(() => {
    return data
      .filter((item) => selectedLevel === '' || item.level === selectedLevel)
      .filter((item) =>
        item.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [searchTerm, selectedLevel, data])

  const columns = useMemo(
    () => [
      { accessorKey: 'nama_siswa', header: 'Nama Siswa' },
      {
        accessorKey: 'tagihan_uang_kbm',
        header: 'KBM',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return val ? (
            <span>{Number(val).toLocaleString('id-ID')}</span>
          ) : (
            <span>-</span>
          )
        }
      },
      {
        accessorKey: 'tagihan_uang_spp',
        header: 'SPP',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return val ? (
            <span>{Number(val).toLocaleString('id-ID')}</span>
          ) : (
            <span>-</span>
          )
        }
      },
      {
        accessorKey: 'tagihan_uang_pemeliharaan',
        header: 'Pemeliharaan',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return val ? (
            <span>{Number(val).toLocaleString('id-ID')}</span>
          ) : (
            <span>-</span>
          )
        }
      },
      {
        accessorKey: 'tagihan_uang_sumbangan',
        header: 'Sumbangan',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return val ? (
            <span>{Number(val).toLocaleString('id-ID')}</span>
          ) : (
            <span>-</span>
          )
        }
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue }: any) => {
          const val = getValue()
          return val ? (
            <span className="font-semibold">
              {Number(val).toLocaleString('id-ID')}
            </span>
          ) : (
            <span>-</span>
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
              onClick={() => router.push(`/pendapatan/praxis/detail-praxis?id_siswa=${id_siswa}`)}
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
              onClick={() => router.push(`/pendapatan/praxis/pembayaran-siswa?id_siswa=${id_siswa}`)}
            />
          )
        }
      },
      {
        accessorKey: 'tunggakan',
        header: 'Tunggakan',
        cell: ({ row }: any) => {
          const siswa = row.original
          return (
            <FileSignature
              id="tunggakan"
              className={`text-gray-600 cursor-pointer hover:text-blue-600 ${
                isCreatingTunggakan ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => {
                if (!isCreatingTunggakan) handleCreateTunggakan(siswa)
              }}
            />
          )
        }
      }
    ],
    [router, isCreatingTunggakan, handleCreateTunggakan]
  )

  const table = useReactTable({ 
    data: filteredData, 
    columns, 
    getCoreRowModel: getCoreRowModel() 
  })

  // Highlight dan scroll ke nama siswa yang baru ditambahkan kontrak
  useEffect(() => {
    const lastNama = localStorage.getItem('praxis_last_nama')
    if (lastNama) {
      setHighlightNama(lastNama)
      setTimeout(() => {
        if (highlightRowRef.current) {
          highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 400)
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightNama(null)
        localStorage.removeItem('praxis_last_nama')
      }, 3000)
    }
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="ml-64 flex-1 bg-white min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-blue-900 font-semibold">Memuat data siswa Praxis...</p>
          <p className="text-sm text-gray-500 mt-2">Mohon tunggu, sedang mengambil data dari server.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Praxis Academy</h2>
      </div>

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

      <div className="flex justify-between items-center mb-2">
        <div className="flex justify-start gap-2 items-center">
          <select
            id="level-select"
            className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">Semua Level</option>
            <option value="X">Level X</option>
            <option value="XI">Level XI</option>
            <option value="XII">Level XII</option>
          </select>
          <div className="relative">
            <input
              id="search-praxis"
              type="text"
              placeholder="Cari nama siswa..."
              className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={14} className="absolute left-2 top-2 text-gray-700" />
          </div>
          <button 
            id='tambah-kontrak-praxis'
            type='button'
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm"
            onClick={() => router.push('/pendapatan/praxis/tambah-kontrak')}
          >
            + Tambah Kontrak
          </button>
          {/* <button
            id='tambah-tunggakan'
            type='button'
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm"
            onClick={() => router.push('/tunggakan/tambah-tunggakan')}
          >
            + Tambah Tunggakan
          </button> */}
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => {
                const isHighlight = highlightNama && row.original.nama_siswa === highlightNama
                return (
                  <tr
                    key={row.id}
                    ref={highlightNama && row.original.nama_siswa === highlightNama ? highlightRowRef : null}
                      className={`border transition-colors duration-500 ${
                        highlightNama && row.original.nama_siswa === highlightNama ? 'bg-yellow-200' : ''
                      }`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-2 border">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })
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

// Suspense wrapper
export default function PendapatanPraxis() {
  return (
    <Suspense fallback={<div className="ml-64 p-8">Loading...</div>}>
      <PendapatanPraxisInner />
    </Suspense>
  )
}