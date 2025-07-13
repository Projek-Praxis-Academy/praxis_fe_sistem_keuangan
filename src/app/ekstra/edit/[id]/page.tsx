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

interface EkstraData {
  id_ekstra_siswa: string
  id_ekstra: string
  nama_ekstra: string
  tanggal_mulai: string
  tanggal_selesai: string | null
  tagihan_ekstra: number
  catatan: string
}

export default function EditEkstra() {
  const router = useRouter()
  const params = useParams()
  const idEkstraSiswa = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Data siswa
  const [siswa, setSiswa] = useState<SiswaData | null>(null)
  
  // Data ekstrakurikuler
  const [ekstra, setEkstra] = useState<EkstraData>({
    id_ekstra_siswa: '',
    id_ekstra: '',
    nama_ekstra: '',
    tanggal_mulai: '',
    tanggal_selesai: null,
    tagihan_ekstra: 0,
    catatan: ''
  })

  // Fetch data ekstra saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token') || ''
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/detail/ekstra-siswa/${idEkstraSiswa}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data.status === 'success') {
          const ekstraData = response.data.data
          
          // Set data siswa
          setSiswa({
            id_siswa: ekstraData.id_siswa,
            nisn: ekstraData.nisn || '',
            nama_siswa: ekstraData.nama_siswa,
            level: ekstraData.level || '',
            akademik: ekstraData.akademik || ''
          })
          
          // Set data ekstra (handle null untuk tanggal_selesai)
          setEkstra({
            id_ekstra_siswa: ekstraData.id_ekstra_siswa,
            id_ekstra: ekstraData.id_ekstra,
            nama_ekstra: ekstraData.nama_ekstra,
            tanggal_mulai: ekstraData.tanggal_mulai,
            tanggal_selesai: ekstraData.tanggal_selesai || null,
            tagihan_ekstra: ekstraData.tagihan_ekstra,
            catatan: ekstraData.catatan || ''
          })
        }
      } catch (err) {
        setError('Gagal memuat data ekstrakurikuler')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [idEkstraSiswa])

  // Format nominal ke Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  // Handle perubahan input ekstra
  const handleEkstraChange = (field: keyof EkstraData, value: string | number | null) => {
    if (field === 'tagihan_ekstra' && typeof value === 'string') {
      // Bersihkan karakter non-digit dan konversi ke number
      const cleanValue = value.replace(/\D/g, '')
      setEkstra(prev => ({ 
        ...prev, 
        [field]: cleanValue ? parseInt(cleanValue) : 0 
      }))
    } else {
      setEkstra(prev => ({ ...prev, [field]: value }))
    }
  }

  // Validasi form sebelum submit
  const validateForm = () => {
    // Validasi tanggal: mulai harus sebelum selesai
    if (ekstra.tanggal_selesai && new Date(ekstra.tanggal_mulai) > new Date(ekstra.tanggal_selesai)) {
      setError('Tanggal selesai harus setelah tanggal mulai')
      return false
    }
    
    // Validasi nominal tidak negatif
    if (ekstra.tagihan_ekstra < 0) {
      setError('Nominal tidak boleh negatif')
      return false
    }
    
    return true
  }

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token') || ''
      
      // Siapkan data untuk dikirim sesuai format controller
      const dataToSend = {
        tanggal_mulai: ekstra.tanggal_mulai,
        tanggal_selesai: ekstra.tanggal_selesai,
        tagihan_ekstra: ekstra.tagihan_ekstra,
        catatan: ekstra.catatan
      }

      // Kirim PUT request
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/update/${ekstra.id_ekstra_siswa}`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      )

      if (response.data.status === 'success') {
        setSuccess('Data ekstrakurikuler berhasil diperbarui!')
        
        // Redirect setelah 1.5 detik
        setTimeout(() => {
          router.push('/ekstra?success=Data berhasil diperbarui')
        }, 1500)
      } else {
        setError(response.data.message || 'Gagal memperbarui data')
      }
    } catch (err: any) {
      console.error('Update error:', err)
      
      // Format pesan error
      let errorMessage = 'Terjadi kesalahan saat mengirim data'
      
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
          <p className="mt-4 text-gray-600">Memuat data ekstrakurikuler...</p>
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
            onClick={() => router.push('/ekstra')}
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
            EDIT EKSTRAKURIKULER SISWA
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Perbarui data tagihan ekstrakurikuler siswa
          </p>
          <hr className="border-t-2 border-blue-900 mb-5" />

          {/* Info Siswa */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Siswa</p>
                <p className="font-medium">{siswa.nama_siswa}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Level & Akademik</p>
                <p className="font-medium">{siswa.level} - {siswa.akademik}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ekstrakurikuler</p>
                <p className="font-medium">{ekstra.nama_ekstra}</p>
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
            {/* Form Ekstrakurikuler */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Ekstrakurikuler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={ekstra.tanggal_mulai}
                    onChange={(e) => handleEkstraChange('tanggal_mulai', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={ekstra.tanggal_selesai || ''}
                    onChange={(e) => handleEkstraChange(
                      'tanggal_selesai', 
                      e.target.value || null
                    )}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kosongkan jika masih berlangsung
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nominal <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border rounded px-3 bg-white">
                    <span className="text-gray-500 mr-2">Rp</span>
                    <input
                      type="text"
                      value={ekstra.tagihan_ekstra ? formatRupiah(ekstra.tagihan_ekstra) : ''}
                      onChange={(e) => handleEkstraChange('tagihan_ekstra', e.target.value)}
                      className="w-full py-2 outline-none"
                      placeholder="Masukkan nominal"
                      required
                    />
                  </div>
                  {ekstra.tagihan_ekstra > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {`Rp ${formatRupiah(ekstra.tagihan_ekstra)}`}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Catatan</label>
                  <textarea
                    value={ekstra.catatan}
                    onChange={(e) => handleEkstraChange('catatan', e.target.value)}
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
                onClick={() => router.push('/ekstra')}
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