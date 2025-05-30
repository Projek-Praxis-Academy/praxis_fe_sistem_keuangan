'use client'

import { useState, useEffect, Suspense } from 'react'
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

function PembayaranBoardingKonsumsiInner() {
  const searchParams = useSearchParams()
  const id_siswa_query = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [tanggalPembayaran, setTanggalPembayaran] = useState('')
  const [boarding, setBoarding] = useState('')
  const [konsumsi, setKonsumsi] = useState('')
  const [catatan, setCatatan] = useState('')
  const [totalPembayaran, setTotalPembayaran] = useState(0)

  useEffect(() => {
    const fetchSiswaDetail = async () => {
      if (!id_siswa_query) return
      setLoading(true)
      setError('')

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-bk/pembayaran-siswa/${id_siswa_query}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        setSiswaDetail(response.data)
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data siswa.')
      } finally {
        setLoading(false)
      }
    }

    fetchSiswaDetail()
  }, [id_siswa_query])

  useEffect(() => {
    const total =
      (parseInt(boarding || '0') || 0) +
      (parseInt(konsumsi || '0') || 0)
    setTotalPembayaran(total)
  }, [boarding, konsumsi])

  const handleSubmit = async () => {
    if (!siswaDetail) return

    const uang_boarding = boarding.trim() !== '' ? parseInt(boarding) : null
    const uang_konsumsi = konsumsi.trim() !== '' ? parseInt(konsumsi) : null

    if (uang_boarding === null && uang_konsumsi === null) {
      setError('Minimal isi salah satu pembayaran (boarding/konsumsi).')
      return
    }

    if (!tanggalPembayaran) {
      setError('Tanggal pembayaran wajib diisi.')
      return
    }

    const data = {
      id_siswa: siswaDetail.id_siswa.toString(),
      tanggal_pembayaran: tanggalPembayaran,
      uang_boarding,
      uang_konsumsi,
      catatan: catatan.trim() !== '' ? catatan : null
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-bk/pembayaran`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.status === 'success') {
        setSuccess(response.data.message || 'Pembayaran berhasil.')
        setTanggalPembayaran('')
        setBoarding('')
        setKonsumsi('')
        setCatatan('')
        window.location.href = '/pendapatan/boarding-konsumsi'
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
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-5">PEMBAYARAN BOARDING & KONSUMSI</h2>
          <hr className="border-t-2 border-blue-900 mb-5" />

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
                <input
                  value={siswaDetail.nama_siswa}
                  readOnly
                  className="border px-3 py-2 rounded bg-gray-100"
                />
                <input
                  value={`Level ${siswaDetail.level}`}
                  readOnly
                  className="border px-3 py-2 rounded bg-gray-100"
                />
                <input
                  value={siswaDetail.akademik}
                  readOnly
                  className="border px-3 py-2 rounded bg-gray-100"
                />
              </div>

              <input
                value={`NISN: ${siswaDetail.nisn}`}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />

              {/* Hidden ID Siswa */}
              <input
                type="hidden"
                value={siswaDetail.id_siswa}
                name="id_siswa"
                readOnly
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
                <input
                  id='tanggal_pembayaran'
                  type="date"
                  value={tanggalPembayaran}
                  onChange={(e) => setTanggalPembayaran(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Boarding</label>
                  <div className="flex items-center border rounded px-2 bg-white">
                    <span className="text-gray-500 text-sm mr-1">Rp</span>
                    <input
                      id='boarding'
                      placeholder="1000000"
                      value={boarding}
                      onChange={(e) => setBoarding(e.target.value.replace(/\D/g, ''))}
                      className="px-3 py-2 rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Konsumsi</label>
                  <div className="flex items-center border rounded px-2 bg-white">
                    <span className="text-gray-500 text-sm mr-1">Rp</span>
                    <input
                      id='konsumsi'
                      placeholder="1000000"
                      value={konsumsi}
                      onChange={(e) => setKonsumsi(e.target.value.replace(/\D/g, ''))}
                      className="px-3 py-2 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Total pembayaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Pembayaran</label>
                <div className="flex items-center border rounded px-2 bg-white">
                  <span className="text-gray-500 text-sm mr-1">Rp</span>
                  {/* Format totalPembayaran to Indonesian currency format */}
                  <input
                    id='total_pembayaran'
                    type="text"
                    value={totalPembayaran.toLocaleString('id-ID')}
                    readOnly
                    className="w-full px-3 py-2 rounded"
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  id='catatan'
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Contoh: Bayar konsumsi bulan April."
                />
              </div>

              <button
                type='button'
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

export default function PembayaranBoardingKonsumsi() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PembayaranBoardingKonsumsiInner />
    </Suspense>
  )
}
