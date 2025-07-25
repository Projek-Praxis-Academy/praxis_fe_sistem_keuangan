'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2 } from 'lucide-react'
import axios from 'axios'

interface Siswa {
  id_siswa: number
  nisn: string
  nama_siswa: string
  level: string
  akademik: string
}

export default function TambahSiswaEkstra() {
  const router = useRouter()

  const [ekstraList, setEkstraList] = useState<any[]>([])
  const [selectedEkstra, setSelectedEkstra] = useState<any[]>([])
  const [nisn, setNisn] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Tambahkan state dan ref di dalam komponen
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Siswa[]>([])
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [namaSiswa, setNamaSiswa] = useState('')
  const [level, setLevel] = useState('')
  const [akademik, setAkademik] = useState('')

  useEffect(() => {
    const fetchEkstraList = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ekstra/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setEkstraList(response.data.data)
      } catch (err) {
        console.error('Error fetching ekstra list', err)
        setError('Terjadi kesalahan saat memuat data ekstra.')
      }
    }
    fetchEkstraList()
  }, [])

  // Fetch data autocomplete
  const fetchSearchResults = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([])
      return
    }
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/cari-siswa?query=${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data.status === 'success') {
        setSearchResults(response.data.data)
        setShowDropdown(true)
      }
    } catch {
      setSearchResults([])
    }
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchResults(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle select siswa dari dropdown
  const handleSelectSiswa = (siswa: Siswa) => {
    setNisn(siswa.nisn)
    setNamaSiswa(siswa.nama_siswa)
    setLevel(siswa.level)
    setAkademik(siswa.akademik)
    setSearchQuery(`${siswa.nisn} - ${siswa.nama_siswa}`)
    setShowDropdown(false)
    // Simpan level ke localStorage agar halaman /ekstra bisa membaca
    localStorage.setItem('selectedLevel', siswa.level)
    localStorage.setItem('selectedNamaSiswa', siswa.nama_siswa)
  }

  const handleAddEkstra = () => {
    setSelectedEkstra((prev) => [...prev, ''])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nisn || selectedEkstra.length === 0 || !tanggalMulai || !tanggalSelesai) {
      setError('Harap lengkapi semua field.')
      return
    }

    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token') || ''
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/create-siswa`,
        {
          nisn,
          id_ekstra: selectedEkstra,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai,
          catatan,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.status === 'success') {
        // setSuccessMessage('Data ekstra siswa berhasil disimpan!')
        localStorage.setItem('ekstra_last_nama', namaSiswa) // simpan nama siswa
        router.push('/ekstra?success=tambah')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="bg-white border rounded-md shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">TAMBAH SISWA EKSTRAKURIKULER</h2>

        {/* Alert Error */}
        {error && (
          <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Alert Success */}
        {successMessage && (
          <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* NISN Input */}
          <div className="mb-4">
            <div className="col-span-2 relative">
              <label className="text-sm font-medium">NISN Siswa</label>
              <input
                type="text"
                value={searchQuery || nisn}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setNisn(e.target.value)
                  setNamaSiswa('')
                  setLevel('')
                  setAkademik('')
                }}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Masukkan NISN atau Nama Siswa"
                autoComplete="off"
              />
              {showDropdown && searchResults.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {searchResults.map((siswa) => (
                    <div
                      key={siswa.id_siswa}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectSiswa(siswa)}
                    >
                      <div className="font-medium">{siswa.nisn} - {siswa.nama_siswa}</div>
                      <div className="text-sm text-gray-500">
                        {siswa.level} - {siswa.akademik}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tampilkan info siswa jika sudah dipilih */}
          {nisn && namaSiswa && (
            <div className="col-span-2">
              <div className="bg-gray-50 p-3 rounded-md mb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">NISN:</span> {nisn}</div>
                  <div><span className="text-gray-500">Nama:</span> {namaSiswa}</div>
                  <div><span className="text-gray-500"></span> {level}</div>
                  <div><span className="text-gray-500">Akademik:</span> {akademik}</div>
                </div>
              </div>
            </div>
          )}

          <hr className="border-t-2 border-blue-800 mb-6" />

          {/* Ekstra Selection */}
          <label className="block mb-2 font-semibold">Ekstra yang Diikuti</label>
          <div className="space-y-3 mb-6">
            {selectedEkstra.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  id={`ekstra-${index}`}
                  value={item}
                  onChange={(e) => {
                    const newSelectedEkstra = [...selectedEkstra]
                    newSelectedEkstra[index] = e.target.value
                    setSelectedEkstra(newSelectedEkstra)
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Pilih Ekstra</option>
                  {ekstraList.map((ekstra) => (
                    <option key={ekstra.id_ekstra} value={ekstra.id_ekstra}>
                      {ekstra.nama_ekstra}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddEkstra}
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mb-6"
          >
            + Tambah Ekstra
          </button>

          {/* Tanggal Mulai */}
          <label className="block mb-2 font-semibold">Tanggal Mulai</label>
          <input
            id='tanggalMulai'
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          />

          {/* Tanggal Selesai */}
          <label className="block mb-2 font-semibold">Tanggal Selesai</label>
          <input
            id='tanggalSelesai'
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          />

          {/* Catatan */}
          <label className="block mb-2 font-semibold">Catatan</label>
          <textarea
            id='catatan'
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
            placeholder="Masukkan catatan (opsional)"
          />

          {/* Submit */}
          <button
            id='submit-tambah-siswa-ekstra'
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 flex justify-center items-center gap-2"
          >
            <FilePlus2 size={18} />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  )
}
