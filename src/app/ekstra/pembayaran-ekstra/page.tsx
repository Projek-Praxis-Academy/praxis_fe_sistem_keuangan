'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

interface Siswa {
  id_siswa: number
  nama_siswa: string
  nisn: string
  level: string
  kategori: string
  akademik: string
  nama_wali: string
  no_hp_wali: string
}

export default function PembayaranEkstra() {
  const searchParams = useSearchParams()
  const id_siswa_query = searchParams.get('id_siswa') || ''
  const id_ekstra_siswa_query = searchParams.get('id_ekstra_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [tanggalPembayaran, setTanggalPembayaran] = useState('')
  const [nominal, setNominal] = useState('')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    const fetchSiswaDetail = async () => {
      if (!id_siswa_query) return

      setLoading(true)
      setError('')

      try {
        const response = await axios.get(
          `https://fitrack-production.up.railway.app/api/monitoring-praxis/pembayaran-siswa/${id_siswa_query}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        setSiswaDetail(response.data)
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data siswa.')
      } finally {
        setLoading(false)
      }
    }

    fetchSiswaDetail()
  }, [id_siswa_query])

  const handleSubmit = async () => {
    if (!siswaDetail || !id_ekstra_siswa_query) return

    if (!tanggalPembayaran || nominal.trim() === '') {
      setError('Tanggal dan nominal pembayaran harus diisi.')
      return
    }

    const nominalInt = parseInt(nominal)
    if (isNaN(nominalInt) || nominalInt <= 0) {
      setError('Nominal pembayaran harus berupa angka positif.')
      return
    }

    const data = {
      id_siswa: siswaDetail.id_siswa.toString(),
      nama_siswa: siswaDetail.nama_siswa,
      id_ekstra_siswa: id_ekstra_siswa_query,
      tanggal_pembayaran: tanggalPembayaran,
      nominal: nominalInt,
      catatan: catatan.trim() !== '' ? catatan : null,
    }

    try {
      const response = await axios.post(
        'https://fitrack-production.up.railway.app/api/monitoring-ekstra/pembayaran',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (response.data.status === 'success') {
        setSuccess(response.data.message || 'Pembayaran ekstra berhasil disimpan.')

        // Reset form
        setTanggalPembayaran('')
        setNominal('')
        setCatatan('')

        // Redirect
        window.location.href = `http://127.0.0.1:3000/ekstra?id_siswa=${id_siswa_query}`
      } else {
        setError(response.data.message || 'Gagal menyimpan pembayaran.')
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Gagal menyimpan pembayaran.')
      } else {
        setError('Terjadi kesalahan saat mengirim data.')
      }
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">PEMBAYARAN EKSTRAKURIKULER</h2>
          <hr className="border-t-3 border-blue-900 mb-8" />

          {loading && <p>Loading...</p>}

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

          {siswaDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <input value={siswaDetail.nama_siswa} readOnly className="border px-3 py-2 rounded bg-gray-100" />
                <input value={`Level ${siswaDetail.level}`} readOnly className="border px-3 py-2 rounded bg-gray-100" />
                <input value={siswaDetail.akademik} readOnly className="border px-3 py-2 rounded bg-gray-100" />
              </div>

              <input value={`NISN: ${siswaDetail.nisn}`} readOnly className="w-full border px-3 py-2 rounded bg-gray-100" />
              <input type="hidden" value={siswaDetail.id_siswa} readOnly name="id_siswa" />
              <input type="hidden" value={id_ekstra_siswa_query} readOnly name="id_ekstra_siswa" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
                <input
                  type="date"
                  value={tanggalPembayaran}
                  onChange={(e) => setTanggalPembayaran(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal</label>
                <div className="flex items-center border rounded px-2 bg-white">
                    <span className="text-gray-500 text-sm mr-1">Rp</span>
                    <input
                      placeholder="Nominal pembayaran"
                      value={nominal}
                      onChange={(e) => setNominal(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Contoh: Bayar ekstra basket."
                />
              </div>

              <button
                onClick={handleSubmit}
                className="mt-6 w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition font-semibold"
              >
                Simpan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
