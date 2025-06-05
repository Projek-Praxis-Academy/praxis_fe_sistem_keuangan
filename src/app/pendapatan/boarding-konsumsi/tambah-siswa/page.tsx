'use client'

import { useState, useRef, useEffect } from 'react'
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

function formatRupiah(angka: string) {
  if (!angka) return ''
  const num = Number(angka.replace(/\D/g, ''))
  if (isNaN(num)) return ''
  return num.toLocaleString('id-ID')
}

export default function TambahSiswa() {
  const router = useRouter()

  const [nisn, setNisn] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [nominal, setNominal] = useState('')
  const [catatan, setCatatan] = useState('')
  const [jenisTagihan, setJenisTagihan] = useState('boarding') // default to boarding
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Tambahkan state dan logic autocomplete NISN
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Siswa[]>([])
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Tambahkan state untuk menyimpan informasi siswa yang dipilih
  const [namaSiswa, setNamaSiswa] = useState('')
  const [level, setLevel] = useState('')
  const [akademik, setAkademik] = useState('')

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi input
    if (!nisn || !tanggalMulai || !tanggalSelesai || !nominal || !catatan) {
      setError('Semua field wajib diisi!')
      return
    }

    const nominalInt = parseInt(nominal)
    if (isNaN(nominalInt)) {
      setError('Nominal harus berupa angka!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url =
        jenisTagihan === 'boarding'
          ? `${process.env.NEXT_PUBLIC_API_URL}/monitoring-bk/create-siswa/boarding`
          : `${process.env.NEXT_PUBLIC_API_URL}/monitoring-bk/create-siswa/konsumsi`

      const token = localStorage.getItem('token') || ''

      const data = {
        nisn,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        tagihan: nominalInt,
        catatan,
      }

      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      setSuccess('Data Siswa berhasil ditambahkan!')
      router.push('/pendapatan/boarding-konsumsi')
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-2xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">TAMBAH SISWA BOARDING / KONSUMSI</h2>
          <p className="text-sm text-gray-500 mb-5">Lengkapi data siswa untuk tagihan boarding atau konsumsi berikut ini.</p>
          <hr className="border-t-2 border-blue-900 mb-5" />

          {/* Alert Error */}
          {error && (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Alert Success */}
          {success && (
            <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
              <p className="font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Tampilkan info siswa jika sudah dipilih */}
            {nisn && namaSiswa && (
              <div className="col-span-2">
                <div className="bg-gray-50 p-3 rounded-md mb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">NISN:</span> {nisn}</div>
                    <div><span className="text-gray-500">Nama:</span> {namaSiswa}</div>
                    <div><span className="text-gray-500">Level:</span> {level}</div>
                    <div><span className="text-gray-500">Akademik:</span> {akademik}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tanggal Selesai</label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Nominal</label>
              <div className="flex items-center border rounded px-2 bg-white">
                <span className="text-gray-500 text-sm mr-1">Rp</span>
                <input
                  type="number"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="mt-1 w-full rounded-md px-3 py-2"
                  placeholder="Nominal Tagihan"
                />
              </div>
              {nominal && (
                <div className="text-xs text-gray-500 mt-1">
                  {`Rp ${formatRupiah(nominal)}`}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Jenis Tagihan</label>
              <select
                value={jenisTagihan}
                onChange={(e) => setJenisTagihan(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="boarding">Boarding</option>
                <option value="konsumsi">Konsumsi</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Catatan</label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Tuliskan catatan tambahan"
              />
            </div>

            <div className="col-span-2 mt-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                <FilePlus2 className="w-5 h-5" />
                {loading ? 'Menyimpan...' : 'Simpan Siswa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}