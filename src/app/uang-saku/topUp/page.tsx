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

export default function TopUpUangSaku() {
  const searchParams = useSearchParams()
  const id_siswa_query = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          `http://127.0.0.1:8000/api/monitoring-uang-saku/topup/${id_siswa_query}`,
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
    if (!siswaDetail) return

    if (!tanggalPembayaran || nominal.trim() === '') {
      alert('Tanggal dan nominal harus diisi.')
      return
    }

    const data = {
      id_siswa: siswaDetail.id_siswa.toString(),
      nama_siswa: siswaDetail.nama_siswa,
      tanggal_pembayaran: tanggalPembayaran,
      nominal: parseInt(nominal),
      catatan: catatan.trim() !== '' ? catatan : null,
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/monitoring-uang-saku/topup',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (response.data.status === 'success') {
        alert(response.data.message || 'Top up berhasil disimpan.')
        setTanggalPembayaran('')
        setNominal('')
        setCatatan('')
        window.location.href = 'http://127.0.0.1:3000/uang-saku'
      } else {
        alert(response.data.message || 'Gagal menyimpan top up.')
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        alert(error.response.data.message || 'Gagal menyimpan top up.')
      } else {
        alert('Terjadi kesalahan saat mengirim data.')
      }
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">TOP UP UANG SAKU</h2>
          <hr className="border-t-3 border-blue-900 mb-8" />

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

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

              {/* Hidden ID */}
              <input type="hidden" value={siswaDetail.id_siswa} name="id_siswa" readOnly />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pembayaran
                </label>
                <input
                  type="date"
                  value={tanggalPembayaran}
                  onChange={(e) => setTanggalPembayaran(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal</label>
                <input
                  type="text"
                  placeholder="Rp"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value.replace(/\D/g, ''))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Contoh: Uang saku bulan Mei."
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
