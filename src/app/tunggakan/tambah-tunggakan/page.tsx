'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { FilePlus2, Plus, Trash2 } from 'lucide-react'
import axios from 'axios'

interface Siswa {
  id_siswa: number
  nisn: string
  nama_siswa: string
  level: string
  akademik: string
}

interface TagihanItem {
  nama_tagihan: string
  nominal: string
}

function formatRupiah(angka: string) {
  if (!angka) return '';
  const num = Number(angka.replace(/\D/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('id-ID');
}

export default function TambahTunggakan() {
  const router = useRouter()

  const [idSiswa, setIdSiswa] = useState<number | null>(null)
  const [nisn, setNisn] = useState('')
  const [namaSiswa, setNamaSiswa] = useState<string>('')
  const [level, setLevel] = useState<string>('')
  const [akademik, setAkademik] = useState<string>('')
  const [jenisTagihan, setJenisTagihan] = useState('Umum')
  const [periode, setPeriode] = useState('')
  const [tagihan, setTagihan] = useState<TagihanItem[]>([
    { nama_tagihan: '', nominal: '' }
  ])
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
    setIdSiswa(siswa.id_siswa)
    setNisn(siswa.nisn)
    setNamaSiswa(siswa.nama_siswa)
    setLevel(siswa.level)
    setAkademik(siswa.akademik)
    setSearchQuery(`${siswa.nisn} - ${siswa.nama_siswa}`)
    setShowDropdown(false)
  }

  // Tambah item tagihan baru
  const addTagihanItem = () => {
    setTagihan([...tagihan, { nama_tagihan: '', nominal: '' }])
  }

  // Hapus item tagihan
  const removeTagihanItem = (index: number) => {
    if (tagihan.length <= 1) return
    const newTagihan = [...tagihan]
    newTagihan.splice(index, 1)
    setTagihan(newTagihan)
  }

  // Update nilai item tagihan
  const updateTagihanItem = (index: number, field: keyof TagihanItem, value: string) => {
    const newTagihan = [...tagihan]
    newTagihan[index][field] = value
    setTagihan(newTagihan)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi input
    if (!idSiswa || !nisn || !namaSiswa || !jenisTagihan || !periode) {
      setError('Semua field wajib diisi kecuali catatan!')
      return
    }

    // Validasi tagihan
    const hasEmptyTagihan = tagihan.some(item => 
      !item.nama_tagihan || !item.nominal || Number(item.nominal) <= 0
    )
    
    if (hasEmptyTagihan) {
      setError('Semua item tagihan harus memiliki nama dan nominal yang valid!')
      return
    }
    
    setSuccess('')
    setError('')
    setLoading(true)

    try {
      // Format data untuk dikirim
      const dataToSend = {
        id_siswa: idSiswa.toString(),
        nama_siswa: namaSiswa,
        jenis_tagihan: jenisTagihan,
        periode: periode,
        tagihan: tagihan.map(item => ({
          nama_tagihan: item.nama_tagihan,
          nominal: Number(item.nominal.replace(/\D/g, ''))
        }))
      }

      // Ambil token dari localStorage
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Token tidak ditemukan, harap login terlebih dahulu.')
        setLoading(false)
        return
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
        setSuccess('Tunggakan berhasil ditambahkan.')
        localStorage.setItem('selectedLevel', level)
        localStorage.setItem('tunggakan_last_nama', namaSiswa)
        // Redirect ke monitoring tunggakan setelah sukses
        setTimeout(() => {
          router.push('/pendapatan/tunggakan')
        }, 1200)
      }
    } catch (err: any) {
      console.error(err)
      let errorMessage = 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.errors) {
        // Format validation errors
        const errors = err.response.data.errors
        errorMessage = Object.values(errors).flat().join(', ')
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Mendapatkan tahun periode otomatis
  useEffect(() => {
    const currentYear = new Date().getFullYear()
    setPeriode(`${currentYear}/${currentYear + 1}`)
  }, [])

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-3xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">TAMBAH TUNGGAKAN SISWA</h2>
          <p className="text-sm text-gray-500 mb-4">Lengkapi data tunggakan pembayaran siswa berikut ini.</p>
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div className="col-span-2 relative">
              <label className="text-sm font-medium">Cari Siswa (NISN/Nama)</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value === '') {
                    setIdSiswa(null)
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Jenis Tagihan</label>
                <select
                  value={jenisTagihan}
                  onChange={(e) => setJenisTagihan(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Umum">Umum</option>
                  <option value="Boarding & Konsumsi">Boarding & Konsumsi</option>
                  <option value="Ekstra">Ekstra</option>
                  <option value="Uang Saku">Uang Saku</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Periode</label>
                <input
                  type="text"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Contoh: 2024/2025"
                />
              </div>
            </div>

            <div className="col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Daftar Tagihan</label>
                <button
                  type="button"
                  onClick={addTagihanItem}
                  className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  <Plus className="w-4 h-4 mr-1" /> Tambah
                </button>
              </div>

              <div className="space-y-3">
                {tagihan.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                    <div className="md:col-span-5">
                      <label className="text-xs text-gray-500">Nama Tagihan</label>
                      <input
                        type="text"
                        value={item.nama_tagihan}
                        onChange={(e) => updateTagihanItem(index, 'nama_tagihan', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Contoh: SPP, KBM, dll"
                      />
                    </div>
                    
                    <div className="md:col-span-5">
                      <label className="text-xs text-gray-500">Nominal</label>
                      <div className="flex items-center border rounded px-2 bg-white">
                        <span className="text-gray-500 text-sm mr-1">Rp</span>
                        <input
                          type="text"
                          value={item.nominal}
                          onChange={(e) => {
                            const value = e.target.value
                            // Hanya izinkan angka
                            if (value === '' || /^\d+$/.test(value.replace(/\./g, ''))) {
                              updateTagihanItem(index, 'nominal', value)
                            }
                          }}
                          className="w-full py-2 outline-none"
                          placeholder="Nominal"
                        />
                      </div>
                      {item.nominal && (
                        <div className="text-xs text-gray-500 mt-1">
                          {`Rp ${formatRupiah(item.nominal)}`}
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeTagihanItem(index)}
                        disabled={tagihan.length <= 1}
                        className={`flex items-center justify-center p-2 rounded ${
                          tagihan.length <= 1 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 mt-4">
              <div className="flex justify-between gap-4">
                <Link
                  href="/pendapatan/tunggakan"
                  className="flex flex-1 items-center justify-center gap-2 bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Kembali
                </Link>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700"
                  disabled={loading || !idSiswa}
                >
                  <FilePlus2 className="w-5 h-5" />
                  {loading ? 'Menyimpan...' : 'Simpan Tunggakan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}