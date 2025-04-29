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

export default function PembayaranTechno() {
  const searchParams = useSearchParams()
  const id_siswa_query = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [tanggalPembayaran, setTanggalPembayaran] = useState('')
  const [kbm, setKbm] = useState('')
  const [spp, setSpp] = useState('')
  const [pemeliharaan, setPemeliharaan] = useState('')
  const [sumbangan, setSumbangan] = useState('')
  const [catatan, setCatatan] = useState('')
  const [totalPembayaran, setTotalPembayaran] = useState(0)

  useEffect(() => {
    const fetchSiswaDetail = async () => {
      if (!id_siswa_query) return

      setLoading(true)
      setError('')

      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/monitoring-techno/pembayaran-siswa/${id_siswa_query}`, {
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

  // Update total pembayaran setiap field berubah
  useEffect(() => {
    const total =
      (parseInt(kbm || '0') || 0) +
      (parseInt(spp || '0') || 0) +
      (parseInt(pemeliharaan || '0') || 0) +
      (parseInt(sumbangan || '0') || 0)
    setTotalPembayaran(total)
  }, [kbm, spp, pemeliharaan, sumbangan])

  const handleSubmit = async () => {
    if (!siswaDetail) return

    const uang_kbm = kbm.trim() !== '' ? parseInt(kbm) : null
    const uang_spp = spp.trim() !== '' ? parseInt(spp) : null
    const uang_pemeliharaan = pemeliharaan.trim() !== '' ? parseInt(pemeliharaan) : null
    const uang_sumbangan = sumbangan.trim() !== '' ? parseInt(sumbangan) : null

    if (uang_kbm === null && uang_spp === null && uang_pemeliharaan === null && uang_sumbangan === null) {
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
      uang_kbm,
      uang_pemeliharaan,
      uang_spp,
      uang_sumbangan,
      catatan: catatan.trim() !== '' ? catatan : null
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/pembayaran', data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.status === 'success') {
        alert(response.data.message || 'Pembayaran berhasil.')
        setTanggalPembayaran('')
        setKbm('')
        setSpp('')
        setPemeliharaan('')
        setSumbangan('')
        setCatatan('')
        window.location.href = 'http://127.0.0.1:3000/pendapatan/techno'
      } else {
        alert(response.data.message || 'Gagal menyimpan pembayaran.')
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        alert(error.response.data.message || 'Gagal menyimpan pembayaran.')
      } else {
        alert('Terjadi kesalahan saat mengirim data.')
      }
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">PEMBAYARAN</h2>

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
                  placeholder="KBM"
                  value={kbm}
                  onChange={(e) => setKbm(e.target.value.replace(/\D/g, ''))}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="SPP"
                  value={spp}
                  onChange={(e) => setSpp(e.target.value.replace(/\D/g, ''))}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="Pemeliharaan"
                  value={pemeliharaan}
                  onChange={(e) => setPemeliharaan(e.target.value.replace(/\D/g, ''))}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="Sumbangan"
                  value={sumbangan}
                  onChange={(e) => setSumbangan(e.target.value.replace(/\D/g, ''))}
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
                  placeholder="Contoh: Pembayaran sebagian untuk KBM dan Pemeliharaan."
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
