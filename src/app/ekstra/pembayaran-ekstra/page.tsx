'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'

// Gunakan interface yang sama dengan DetailSiswaEkstra
interface DetailSiswaEkstra {
  id_siswa: number
  nama_siswa: string
  nisn: string
  level: string
  akademik: string
  id_ekstra_siswa: string
  id_ekstra: string
  nama_ekstra: string
  tagihan_ekstra: string
  catatan: string
}

interface PembayaranPayload {
  id_siswa: string
  nama_siswa: string
  id_ekstra_siswa: string
  tanggal_pembayaran: string
  nominal: number
  catatan: string | null
}

function PembayaranEkstraInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id_ekstra_siswa = searchParams.get('id_ekstra_siswa') || ''
  const id_siswa = searchParams.get('id_siswa') || ''

  const [detailSiswa, setDetailSiswa] = useState<DetailSiswaEkstra | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    tanggal_pembayaran: '',
    nominal: '',
    catatan: ''
  })

  // Fetch data menggunakan endpoint yang sama dengan DetailSiswaEkstra
  useEffect(() => {
    const fetchData = async () => {
      if (!id_ekstra_siswa) {
        setError('Parameter ekstra siswa tidak valid')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const token = localStorage.getItem('token') || ''
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/pembayaran/${id_ekstra_siswa}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data.data) {
          setDetailSiswa(response.data.data)
        } else {
          setError('Data siswa tidak ditemukan')
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id_ekstra_siswa])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nominal' ? value.replace(/\D/g, '') : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!detailSiswa) {
      setError('Data siswa belum lengkap')
      return
    }

    // Validasi form
    if (!formData.tanggal_pembayaran) {
      setError('Tanggal pembayaran harus diisi')
      return
    }

    if (!formData.nominal || parseInt(formData.nominal) <= 0) {
      setError('Nominal pembayaran harus diisi dan lebih dari 0')
      return
    }

    const payload: PembayaranPayload = {
      id_siswa: detailSiswa.id_siswa.toString(),
      nama_siswa: detailSiswa.nama_siswa,
      id_ekstra_siswa: id_ekstra_siswa,
      tanggal_pembayaran: formData.tanggal_pembayaran,
      nominal: parseInt(formData.nominal),
      catatan: formData.catatan || null
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/pembayaran`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (response.data.status === 'success') {
        setSuccess('Pembayaran berhasil disimpan')
        setTimeout(() => {
          router.push(`/ekstra`)
        }, 1500)
      } else {
        setError(response.data.message || 'Gagal menyimpan pembayaran')
      }
    } catch (error: any) {
      console.error('Submit error:', error)
      setError(
        error.response?.data?.message || 
        error.message || 
        'Terjadi kesalahan saat menyimpan data'
      )
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">
            PEMBAYARAN EKSTRAKURIKULER
          </h2>
          <hr className="border-t-3 border-blue-900 mb-8" />

          {loading ? (
            <div className="text-center py-10">
              <p>Memuat data...</p>
            </div>
          ) : error ? (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{error}</p>
            </div>
          ) : detailSiswa ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
                  <p className="font-medium">{success}</p>
                </div>
              )}

              {/* Info Siswa - Menggunakan data dari endpoint yang sama */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label>
                  <input 
                    value={detailSiswa.nama_siswa} 
                    readOnly 
                    className="w-full border px-3 py-2 rounded bg-gray-100" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                  <input 
                    value={detailSiswa.nisn} 
                    readOnly 
                    className="w-full border px-3 py-2 rounded bg-gray-100" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <input 
                    value={`Level ${detailSiswa.level}`} 
                    readOnly 
                    className="w-full border px-3 py-2 rounded bg-gray-100" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <input 
                    value={detailSiswa.akademik} 
                    readOnly 
                    className="w-full border px-3 py-2 rounded bg-gray-100" 
                  />
                </div>
              </div>

              {/* Info Ekstra */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ekstrakurikuler</label>
                <input 
                  value={detailSiswa.nama_ekstra} 
                  readOnly 
                  className="w-full border px-3 py-2 rounded bg-gray-100" 
                />
              </div>

              {/* Form Pembayaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pembayaran <span className="text-red-500">*</span>
                </label>
                <input
                  name="tanggal_pembayaran"
                  type="date"
                  required
                  value={formData.tanggal_pembayaran}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominal Pembayaran <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded px-2 bg-white">
                  <span className="text-gray-500 text-sm mr-1">Rp</span>
                  <input
                    name="nominal"
                    type="text"
                    required
                    value={formData.nominal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded"
                    placeholder="Masukkan nominal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Contoh: Bayar ekstra basket"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-10">
              <p>Data tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PembayaranEkstra() {
  return (
    <Suspense fallback={<div className="ml-64 p-6">Memuat halaman...</div>}>
      <PembayaranEkstraInner />
    </Suspense>
  )
}