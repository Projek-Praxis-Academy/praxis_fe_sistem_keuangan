'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilePlus2 } from 'lucide-react'
import axios from 'axios'

interface Kategori {
  id_kategori_pengeluaran: string;
  nama_kategori_pengeluaran: string;
}

// Komponen utama yang dibungkus Suspense
export default function TambahSubPengeluaran() {
  return (
    <Suspense fallback={<div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">Memuat...</div>}>
      <TambahSubPengeluaranContent />
    </Suspense>
  )
}

// Komponen konten yang menggunakan useSearchParams
function TambahSubPengeluaranContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idPengeluaran = searchParams.get('id_pengeluaran') || ''
  
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [subPengeluaran, setSubPengeluaran] = useState({
    id_kategori_pengeluaran: '',
    nama_sub_pengeluaran: '',
    nominal: '',
    jumlah_item: '',
    tanggal_pengeluaran: '',
    file_nota: null as File | null
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoadingKategori, setIsLoadingKategori] = useState(false)
  const [jenisPengeluaran, setJenisPengeluaran] = useState('')
  const [pengeluaranData, setPengeluaranData] = useState<any>(null)

  // Fetch data pengeluaran untuk mendapatkan jenis pengeluaran
  useEffect(() => {
    if (!idPengeluaran) return
    
    const fetchPengeluaran = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token') || ''
        
        // Fetch detail pengeluaran
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/detail/${idPengeluaran}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        
        setPengeluaranData(response.data)
        
        // Fetch jenis pengeluaran
        const jenisResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        
        const pengeluaranList = jenisResponse.data.data || []
        const found = pengeluaranList.find(
          (item: any) => item.id_pengeluaran === idPengeluaran
        )

        // Handle jenis pengeluaran (string or object)
        let jenisValue = ''
        if (found) {
          if (typeof found.jenis_pengeluaran === 'string') {
            jenisValue = found.jenis_pengeluaran
          } else {
            jenisValue = found.jenis_pengeluaran?.nama_jenis_pengeluaran || ''
          }
        }
        setJenisPengeluaran(jenisValue)
      } catch (err) {
        console.error('Gagal memuat data pengeluaran:', err)
        setError('Gagal memuat data pengeluaran.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPengeluaran()
  }, [idPengeluaran])

  // Fetch kategori berdasarkan jenis pengeluaran
  useEffect(() => {
    if (jenisPengeluaran) {
      const fetchKategori = async () => {
        try {
          setIsLoadingKategori(true)
          const token = localStorage.getItem('token') || ''
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/kategori-pengeluaran?type=${jenisPengeluaran}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          
          // Penanganan struktur respons yang sesuai dengan halaman Detail
          let data = response.data;
          
          // Jika respons memiliki properti data dan itu adalah array
          if (data.data && Array.isArray(data.data)) {
            setKategoriList(data.data)
          } 
          // Jika respons langsung berupa array
          else if (Array.isArray(data)) {
            setKategoriList(data)
          }
          // Struktur alternatif
          else if (data.result && Array.isArray(data.result)) {
            setKategoriList(data.result)
          } 
          else {
            console.error('Struktur respons tidak valid:', data)
            setError('Struktur respons tidak valid')
          }
        } catch (err) {
          console.error('Gagal memuat kategori:', err)
          setError('Gagal memuat kategori.')
        } finally {
          setIsLoadingKategori(false)
        }
      }
      
      fetchKategori()
    }
  }, [jenisPengeluaran])

  const handleSubChange = (field: string, value: any) => {
    setSubPengeluaran(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi input
    const validations = [
      { condition: !subPengeluaran.id_kategori_pengeluaran, message: 'Kategori pengeluaran wajib diisi.' },
      { condition: !subPengeluaran.nama_sub_pengeluaran, message: 'Nama sub pengeluaran wajib diisi.' },
      { condition: !subPengeluaran.nominal, message: 'Nominal wajib diisi.' },
      { condition: !subPengeluaran.jumlah_item, message: 'Jumlah item wajib diisi.' },
      { condition: !subPengeluaran.tanggal_pengeluaran, message: 'Tanggal pengeluaran wajib diisi.' },
    ];

    for (const validation of validations) {
      if (validation.condition) {
        setError(validation.message);
        return;
      }
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('id_kategori_pengeluaran', subPengeluaran.id_kategori_pengeluaran)
      formData.append('nama_sub_pengeluaran', subPengeluaran.nama_sub_pengeluaran)
      formData.append('nominal', subPengeluaran.nominal)
      formData.append('jumlah_item', subPengeluaran.jumlah_item)
      formData.append('tanggal_pengeluaran', subPengeluaran.tanggal_pengeluaran)
      
      if (subPengeluaran.file_nota) {
        formData.append('file_nota', subPengeluaran.file_nota)
      }

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Token tidak ditemukan, harap login terlebih dahulu.')
        setLoading(false)
        return
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/pengeluaran/${idPengeluaran}/sub-pengeluaran`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      setSuccess('Sub pengeluaran berhasil ditambahkan!')
      
      // Redirect ke detail pengeluaran setelah 1.5 detik
      setTimeout(() => {
        router.push(`/pengeluaran/detail?id_pengeluaran=${idPengeluaran}`)
      }, 1500)
    } catch (err: any) {
      console.error(err)
      let msg = 'Terjadi kesalahan saat menambahkan sub pengeluaran.'
      
      if (err.response) {
        if (err.response.data?.message) {
          msg = err.response.data.message
        } else if (err.response.data?.errors) {
          // Format error validasi
          const errors = Object.values(err.response.data.errors).flat()
          msg = errors.join(', ')
        }
      }
      
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-3xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-5">
            TAMBAH SUB PENGELUARAN
          </h2>
          
          {pengeluaranData && jenisPengeluaran && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="font-bold text-blue-900">
                Menambahkan sub pengeluaran untuk: {pengeluaranData.nama_pengeluaran} (Jenis: {jenisPengeluaran})
              </p>
            </div>
          )}
          
          <hr className="border-t-3 border-blue-900 mb-8" />

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

          {!idPengeluaran ? (
            <div className="text-center py-10">
              <div className="text-red-600 mb-4">
                ID Pengeluaran tidak ditemukan. Pastikan Anda mengakses halaman ini melalui halaman detail pengeluaran.
              </div>
              <button
                onClick={() => router.push('/pengeluaran')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Kembali ke Daftar Pengeluaran
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-blue-800">Memuat data pengeluaran...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Kategori Pengeluaran</label>
                {isLoadingKategori ? (
                  <div className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 animate-pulse">
                    Memuat kategori...
                  </div>
                ) : (
                  <>
                    {kategoriList.length > 0 ? (
                      <select
                        id="kategori_pengeluaran"
                        value={subPengeluaran.id_kategori_pengeluaran}
                        onChange={(e) => handleSubChange('id_kategori_pengeluaran', e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Pilih Kategori</option>
                        {kategoriList.map((kategori) => (
                          <option key={kategori.id_kategori_pengeluaran} value={kategori.id_kategori_pengeluaran}>
                            {kategori.nama_kategori_pengeluaran}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-red-500 mt-1">
                        Tidak ada kategori tersedia. Pastikan jenis pengeluaran valid.
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Nama Sub Pengeluaran</label>
                <input
                  id="nama_sub_pengeluaran"
                  type="text"
                  value={subPengeluaran.nama_sub_pengeluaran}
                  onChange={(e) => handleSubChange('nama_sub_pengeluaran', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Masukkan nama sub pengeluaran"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nominal</label>
                <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 mt-1">
                  <span className="text-gray-500 mr-2">Rp</span>
                  <input
                    id="nominal"
                    type="number"
                    value={subPengeluaran.nominal}
                    onChange={(e) => handleSubChange('nominal', e.target.value)}
                    className="w-full focus:outline-none"
                    placeholder="Masukkan nominal"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Jumlah Item</label>
                <input
                  id="jumlah_item"
                  type="number"
                  value={subPengeluaran.jumlah_item}
                  onChange={(e) => handleSubChange('jumlah_item', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Masukkan jumlah item"
                  min="1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tanggal Pengeluaran</label>
                <input
                  id="tanggal_pengeluaran"
                  type="date"
                  value={subPengeluaran.tanggal_pengeluaran}
                  onChange={(e) => handleSubChange('tanggal_pengeluaran', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Bukti Nota
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  * Maksimal ukuran 10 MB, hanya format PDF, JPG, JPEG, PNG
                </p>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-700">
                    Pilih File
                    <input
                      id="file_nota"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleSubChange('file_nota', e.target.files?.[0] || null)}
                    />
                  </label>
                  {subPengeluaran.file_nota && (
                    <span className="text-sm text-gray-700">
                      {subPengeluaran.file_nota.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => router.push(`/pengeluaran/detail?id_pengeluaran=${idPengeluaran}`)}
                  className="flex-1 bg-gray-500 text-white font-medium px-4 py-2 rounded-md hover:bg-gray-600"
                  disabled={loading}
                >
                  Batal
                </button>
                
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700"
                  disabled={loading || isLoadingKategori}
                >
                  <FilePlus2 className="w-5 h-5" />
                  {loading ? 'Menyimpan...' : 'Simpan Sub Pengeluaran'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}