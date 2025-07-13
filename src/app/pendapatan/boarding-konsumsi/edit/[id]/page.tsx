'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

interface SiswaData {
  id_siswa: string
  nisn: string
  nama_siswa: string
  level: string
  akademik: string
}

interface BoardingData {
  id_boarding_siswa: string | null
  tanggal_mulai: string
  tanggal_selesai: string
  tagihan_boarding: number
  catatan: string
}

interface KonsumsiData {
  id_konsumsi_siswa: string | null
  tanggal_mulai: string
  tanggal_selesai: string
  tagihan_konsumsi: number
  catatan: string
}

export default function EditSiswa() {
  const router = useRouter()
  const params = useParams()
  const idSiswa = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Data siswa
  const [siswa, setSiswa] = useState<SiswaData | null>(null)
  
  // Data tagihan
  const [boarding, setBoarding] = useState<BoardingData>({
    id_boarding_siswa: null,
    tanggal_mulai: '',
    tanggal_selesai: '',
    tagihan_boarding: 0,
    catatan: ''
  })
  
  const [konsumsi, setKonsumsi] = useState<KonsumsiData>({
    id_konsumsi_siswa: null,
    tanggal_mulai: '',
    tanggal_selesai: '',
    tagihan_konsumsi: 0,
    catatan: ''
  })

  // Fetch data siswa saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-bk/detail/${idSiswa}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data.status === 'success') {
          const { siswa, boarding, konsumsi } = response.data.data
          
          // Set data siswa
          setSiswa({
            id_siswa: siswa.id_siswa,
            nisn: siswa.nisn,
            nama_siswa: siswa.nama_siswa,
            level: siswa.level,
            akademik: siswa.akademik
          })
          
          // Set data boarding jika ada
          if (boarding) {
            setBoarding({
              id_boarding_siswa: boarding.id_boarding_siswa,
              tanggal_mulai: boarding.tanggal_mulai,
              tanggal_selesai: boarding.tanggal_selesai,
              tagihan_boarding: boarding.tagihan_boarding,
              catatan: boarding.catatan
            })
          } else {
            // Reset jika tidak ada data
            setBoarding({
              id_boarding_siswa: null,
              tanggal_mulai: '',
              tanggal_selesai: '',
              tagihan_boarding: 0,
              catatan: ''
            })
          }
          
          // Set data konsumsi jika ada
          if (konsumsi) {
            setKonsumsi({
              id_konsumsi_siswa: konsumsi.id_konsumsi_siswa,
              tanggal_mulai: konsumsi.tanggal_mulai,
              tanggal_selesai: konsumsi.tanggal_selesai,
              tagihan_konsumsi: konsumsi.tagihan_konsumsi,
              catatan: konsumsi.catatan
            })
          } else {
            // Reset jika tidak ada data
            setKonsumsi({
              id_konsumsi_siswa: null,
              tanggal_mulai: '',
              tanggal_selesai: '',
              tagihan_konsumsi: 0,
              catatan: ''
            })
          }
        }
      } catch (err) {
        setError('Gagal memuat data siswa')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [idSiswa])

  // Format nominal ke Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  // Handle perubahan input boarding
  const handleBoardingChange = (field: keyof BoardingData, value: string | number) => {
    if (field === 'tagihan_boarding' && typeof value === 'string') {
      // Bersihkan karakter non-digit dan konversi ke number
      const cleanValue = value.replace(/\D/g, '')
      setBoarding(prev => ({ 
        ...prev, 
        [field]: cleanValue ? parseInt(cleanValue) : 0 
      }))
    } else {
      setBoarding(prev => ({ ...prev, [field]: value }))
    }
  }

  // Handle perubahan input konsumsi
  const handleKonsumsiChange = (field: keyof KonsumsiData, value: string | number) => {
    if (field === 'tagihan_konsumsi' && typeof value === 'string') {
      // Bersihkan karakter non-digit dan konversi ke number
      const cleanValue = value.replace(/\D/g, '')
      setKonsumsi(prev => ({ 
        ...prev, 
        [field]: cleanValue ? parseInt(cleanValue) : 0 
      }))
    } else {
      setKonsumsi(prev => ({ ...prev, [field]: value }))
    }
  }

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token') || ''
      
      // Siapkan data untuk dikirim sesuai format controller
      const dataToSend = {
        boarding: {
          tanggal_mulai: boarding.tanggal_mulai,
          tanggal_selesai: boarding.tanggal_selesai,
          tagihan_boarding: boarding.tagihan_boarding,
          catatan: boarding.catatan
        },
        konsumsi: {
          tanggal_mulai: konsumsi.tanggal_mulai,
          tanggal_selesai: konsumsi.tanggal_selesai,
          tagihan_konsumsi: konsumsi.tagihan_konsumsi,
          catatan: konsumsi.catatan
        }
      }

      // Kirim PUT request
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-bk/update/${idSiswa}`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      )

      if (response.data.status === 'success') {
        setSuccess('Data berhasil diperbarui!')
        
        // Redirect setelah 1.5 detik
        setTimeout(() => {
          if (siswa) {
            localStorage.setItem('selectedLevel', siswa.level)
            localStorage.setItem('bk_last_nama', siswa.nama_siswa)
          }
          router.push('/pendapatan/boarding-konsumsi?success=edit')
        }, 1500)
      } else {
        setError(response.data.message || 'Gagal memperbarui data')
      }
    } catch (err: any) {
      console.error(err)
      
      // Format pesan error
      let errorMessage = 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="ml-64 flex-1 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Memuat data siswa...</p>
        </div>
      </div>
    )
  }

  if (!siswa) {
    return (
      <div className="ml-64 flex-1 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl">Data siswa tidak ditemukan</div>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => router.push('/pendapatan/boarding-konsumsi')}
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-4xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">
            EDIT SISWA BOARDING / KONSUMSI
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Perbarui data tagihan boarding dan konsumsi siswa
          </p>
          <hr className="border-t-2 border-blue-900 mb-5" />

          {/* Info Siswa */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <div>
                <p className="text-sm text-gray-600">NISN</p>
                <p className="font-medium">{siswa.nisn}</p>
              </div> */}
              <div>
                <p className="text-sm text-gray-600">Nama Siswa</p>
                <p className="font-medium">{siswa.nama_siswa}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Level & Akademik</p>
                <p className="font-medium">{siswa.level} - {siswa.akademik}</p>
              </div>
            </div>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Boarding */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Boarding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={boarding.tanggal_mulai}
                    onChange={(e) => handleBoardingChange('tanggal_mulai', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={boarding.tanggal_selesai}
                    onChange={(e) => handleBoardingChange('tanggal_selesai', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nominal</label>
                  <div className="flex items-center border rounded px-3 bg-white">
                    <span className="text-gray-500 mr-2">Rp</span>
                    <input
                      type="text"
                      value={boarding.tagihan_boarding || ''}
                      onChange={(e) => handleBoardingChange('tagihan_boarding', e.target.value)}
                      className="w-full py-2 outline-none"
                      placeholder="Masukkan nominal"
                    />
                  </div>
                  {boarding.tagihan_boarding > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {`Rp ${formatRupiah(boarding.tagihan_boarding)}`}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <div className="mt-2">
                    {boarding.id_boarding_siswa ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Aktif
                      </span>
                    ) : (
                      <div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          Belum Ada Data.
                        </span>
                        <p className="mt-2 text-xs text-red-600">
                          Mohon isikan data pada form tambah siswa boarding konsumsi terlebih dahulu.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Catatan</label>
                  <textarea
                    value={boarding.catatan}
                    onChange={(e) => handleBoardingChange('catatan', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Tuliskan catatan tambahan"
                  />
                </div>
              </div>
            </div>

            {/* Form Konsumsi */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Konsumsi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={konsumsi.tanggal_mulai}
                    onChange={(e) => handleKonsumsiChange('tanggal_mulai', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={konsumsi.tanggal_selesai}
                    onChange={(e) => handleKonsumsiChange('tanggal_selesai', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nominal</label>
                  <div className="flex items-center border rounded px-3 bg-white">
                    <span className="text-gray-500 mr-2">Rp</span>
                    <input
                      type="text"
                      value={konsumsi.tagihan_konsumsi || ''}
                      onChange={(e) => handleKonsumsiChange('tagihan_konsumsi', e.target.value)}
                      className="w-full py-2 outline-none"
                      placeholder="Masukkan nominal"
                    />
                  </div>
                  {konsumsi.tagihan_konsumsi > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {`Rp ${formatRupiah(konsumsi.tagihan_konsumsi)}`}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <div className="mt-2">
                    {konsumsi.id_konsumsi_siswa ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Aktif
                      </span>
                    ) : (
                      <div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          Belum Ada Data.
                        </span>
                        <p className="mt-2 text-xs text-red-600">
                          Mohon isikan data pada form tambah siswa boarding konsumsi terlebih dahulu.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Catatan</label>
                  <textarea
                    value={konsumsi.catatan}
                    onChange={(e) => handleKonsumsiChange('catatan', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Tuliskan catatan tambahan"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => router.push('/pendapatan/boarding-konsumsi')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-400"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}