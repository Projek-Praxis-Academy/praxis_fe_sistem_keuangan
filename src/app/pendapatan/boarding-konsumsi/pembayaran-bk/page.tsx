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

export default function PembayaranBk() {
  const searchParams = useSearchParams()
  const id_siswa_query = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        const response = await fetch(`http://127.0.0.1:8000/api/monitoring/bk/pembayaran-siswa/${id_siswa_query}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        const data = await response.json()
        setSiswaDetail(data)
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
      alert('Minimal satu jenis pembayaran harus diisi.')
      return
    }

    if (!tanggalPembayaran) {
      alert('Tanggal pembayaran harus diisi.')
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
      const response = await fetch('http://127.0.0.1:8000/api/pembayaran/bk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.status === 'success') {
        alert(result.message || 'Pembayaran berhasil.')
        setTanggalPembayaran('')
        setBoarding('')
        setKonsumsi('')
        setCatatan('')
        window.location.href = 'http://127.0.0.1:3000/pendapatan/boarding-konsumsi'
      } else {
        alert(result.message || 'Gagal menyimpan pembayaran.')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengirim data.')
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">PEMBAYARAN BOARDING & KONSUMSI</h2>

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

              {/* ID Siswa Hidden */}
              <input
                type="hidden"
                value={siswaDetail.id_siswa}
                readOnly
                name="id_siswa"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
                <input
                  type="date"
                  value={tanggalPembayaran}
                  onChange={(e) => setTanggalPembayaran(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Boarding"
                  value={boarding}
                  onChange={(e) => setBoarding(e.target.value.replace(/\D/g, ''))}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="Konsumsi"
                  value={konsumsi}
                  onChange={(e) => setKonsumsi(e.target.value.replace(/\D/g, ''))}
                  className="border px-3 py-2 rounded"
                />
              </div>

              {/* Total pembayaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Pembayaran</label>
                <input
                  type="text"
                  value={totalPembayaran.toLocaleString('id-ID')}
                  readOnly
                  className="w-full border px-3 py-2 rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Contoh: Pembayaran sebagian untuk boarding."
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
