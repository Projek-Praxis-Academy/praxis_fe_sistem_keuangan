'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link';
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

export default function TambahKontrakTechno() {
  const router = useRouter()

  const [nisn, setNisn] = useState('')
  const [namaSiswa, setNamaSiswa] = useState<string>('')
  const [level, setLevel] = useState<string>('')
  const [akademik, setAkademik] = useState<string>('')
  const [uangKBM, setUangKBM] = useState('')
  const [uangSPP, setUangSPP] = useState('')
  const [uangPemeliharaan, setUangPemeliharaan] = useState('')
  const [uangSumbangan, setUangSumbangan] = useState('')
  const [catatan, setCatatan] = useState('')
  const [fileKontrak, setFileKontrak] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  // State untuk autocomplete
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Siswa[]>([])
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      if (response.data.status === 'success') {
        setSearchResults(response.data.data)
        setShowDropdown(true)
      }
    } catch (error) {
      console.error('Error fetching search results:', error)
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
    if (!nisn || !uangKBM || !uangSPP || !uangPemeliharaan || !uangSumbangan || !fileKontrak) {
      setError('Semua field wajib diisi dan file kontrak harus diunggah!')
      return
    }

    if (fileKontrak.type !== 'application/pdf') {
      setError('File kontrak harus berupa PDF')
      return
    }

    if (fileKontrak.size > 10 * 1024 * 1024) {
      setError('Ukuran file kontrak maksimal 10MB')
      return
    }
    
    setSuccess('')
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('nisn', nisn)
      formData.append('uang_kbm', uangKBM)
      formData.append('uang_spp', uangSPP)
      formData.append('uang_pemeliharaan', uangPemeliharaan)
      formData.append('uang_sumbangan', uangSumbangan)
      formData.append('catatan', catatan)
      formData.append('file_kontrak', fileKontrak)

      // Ambil token dari localStorage
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Token tidak ditemukan, harap login terlebih dahulu.')
        setLoading(false)
        return
      }

      const config = {
        method: 'post',
        url: `${process.env.NEXT_PUBLIC_API_URL}/kontrak`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      }

      const response = await axios(config)
      if (response.data.status === 'success') {
        setSuccess('Kontrak berhasil ditambahkan.')
        setTimeout(() => {
          router.push('/pendapatan/techno')
        }, 1500)
      }
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
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">TAMBAH KONTRAK SISWA TECHNO</h2>
          <p className="text-sm text-gray-500 mb-4">Lengkapi data kontrak pembayaran siswa berikut ini.</p>
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

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2 relative">
              <label className="text-sm font-medium">Cari Siswa (NISN/Nama)</label>
              <input
                id='cari_siswa'
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value === '') {
                    setNisn('')
                    setNamaSiswa('')
                    setLevel('')
                    setAkademik('')
                  }
                }}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Masukkan NISN atau Nama Siswa"
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

            <div className="col-span-2">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-1">Informasi Siswa</h4>
                {nisn ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">NISN:</span> {nisn}
                    </div>
                    <div>
                      <span className="text-gray-500">Nama:</span> {namaSiswa}
                    </div>
                    <div>
                      <span className="text-gray-500">Level:</span> {level}
                    </div>
                    <div>
                      <span className="text-gray-500">Akademik:</span> {akademik}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Silakan cari dan pilih siswa</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">KBM</label>
              <div className="flex items-center border rounded px-2 bg-white">
                <span className="text-gray-500 text-sm mr-1">Rp</span>
                <input
                  id='uang_kbm'
                  type="number"
                  value={uangKBM}
                  onChange={(e) => setUangKBM(e.target.value)}
                  className="mt-1 w-full rounded-md px-3 py-2"
                  placeholder="Jumlah KBM"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">SPP</label>
              <div className="flex items-center border rounded px-2 bg-white">
                <span className="text-gray-500 text-sm mr-1">Rp</span>
                <input
                  id='uang_spp'
                  type="number"
                  value={uangSPP}
                  onChange={(e) => setUangSPP(e.target.value)}
                  className="mt-1 w-full rounded-md px-3 py-2"
                  placeholder="Jumlah SPP"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Pemeliharaan</label>
              <div className="flex items-center border rounded px-2 bg-white">
                <span className="text-gray-500 text-sm mr-1">Rp</span>
                <input
                  id='uang_pemeliharaan'
                  type="number"
                  value={uangPemeliharaan}
                  onChange={(e) => setUangPemeliharaan(e.target.value)}
                  className="mt-1 w-full rounded-md px-3 py-2"
                  placeholder="Jumlah Pemeliharaan"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Sumbangan</label>
              <div className="flex items-center border rounded px-2 bg-white">
                <span className="text-gray-500 text-sm mr-1">Rp</span>
                <input
                  id='uang_sumbangan'
                  type="number"
                  value={uangSumbangan}
                  onChange={(e) => setUangSumbangan(e.target.value)}
                  className="mt-1 w-full rounded-md px-3 py-2"
                  placeholder="Jumlah Sumbangan"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Catatan</label>
              <textarea
                id='catatan'
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Tuliskan catatan tambahan"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Kontrak (PDF)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                * Maksimal ukuran 10 MB, hanya format PDF
              </p>

              <div className="flex items-center gap-4">
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-700">
                  Pilih File
                  <input
                    id="file_kontrak"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFileKontrak(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                {fileKontrak && (
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {fileKontrak.name}
                  </span>
                )}
              </div>
            </div>

            <div className="col-span-2 mt-4">
              <div className="flex justify-between gap-4">
                <Link
                  id='kembali-kontrak'
                  href="/pendapatan/techno"
                  className="flex flex-1 items-center justify-center gap-2 bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Kembali
                </Link>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700"
                  disabled={loading || !nisn}
                >
                  <FilePlus2 className="w-5 h-5" />
                  {loading ? 'Menyimpan...' : 'Simpan Kontrak'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}