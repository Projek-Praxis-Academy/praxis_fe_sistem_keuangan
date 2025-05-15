'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'

interface Siswa {
  nama_siswa: string
  id_siswa: string
  nisn: string
  level: string
  akademik: string
  tagihan_uang_kbm: number | null
  tagihan_uang_spp: number | null
  tagihan_uang_pemeliharaan: number | null
  tagihan_uang_sumbangan: number | null
}

export default function DetailTechno() {
  const searchParams = useSearchParams()
  const id_siswa = searchParams.get('id_siswa') || ''
  const router = useRouter()

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id_siswa) return

    // Ambil token dari localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Token tidak ditemukan. Anda perlu login ulang.')
      setLoading(false)
      return
    }

    // Request API untuk mengambil data siswa
    axios.get(`http://127.0.0.1:8000/api/monitoring-techno/detail-kontrak/${id_siswa}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then(res => {
      const siswa = res.data
      const kontrak = siswa.kontrak || {}

      const siswaData: Siswa = {
        id_siswa: siswa.id_siswa,
        nama_siswa: siswa.nama_siswa,
        nisn: siswa.nisn,
        level: siswa.level,
        akademik: siswa.akademik,
        tagihan_uang_kbm: Number(kontrak.uang_kbm ?? 0),
        tagihan_uang_spp: Number(kontrak.uang_spp ?? 0),
        tagihan_uang_pemeliharaan: Number(kontrak.uang_pemeliharaan ?? 0),
        tagihan_uang_sumbangan: Number(kontrak.uang_sumbangan ?? 0),
      }

      setSiswaDetail(siswaData)
      setLoading(false)
    })
    .catch(err => {
      console.error('Gagal ambil data:', err)
      setError('Gagal mengambil data siswa.')
      setLoading(false)
    })
  }, [id_siswa])

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">KONTRAK SISWA TECHNONATURA</h2>
          <hr className="border-t-3 border-blue-900 mb-8" />

          {loading && (
            <div className="flex justify-center items-center">
              <div className="spinner"></div>
              <span className="ml-2">Loading...</span>
            </div>
          )}

          {/* Alert Error */}
          {error && (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {siswaDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <input
                  value={siswaDetail.nama_siswa}
                  readOnly
                  className="w-70 border px-3 py-2 rounded bg-gray-100 text-center"
                />
                <input
                  value={`Level ${siswaDetail.level}`}
                  readOnly
                  className="ml-20 w-30 border px-3 py-2 rounded bg-gray-100 text-center"
                />
                <input
                  value={siswaDetail.akademik}
                  readOnly
                  className="w-30 border px-3 py-2 rounded bg-gray-100 text-center"
                />
              </div>

              <input
                value={`NISN: ${siswaDetail.nisn}`}
                readOnly
                className="text-center w-100 border px-3 py-2 rounded bg-gray-100"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium font-bold mb-1">KBM</label>
                  <input
                    type="text" // ubah dari 'number' ke 'text'
                    value={
                      siswaDetail.tagihan_uang_kbm != null
                        ? `Rp${siswaDetail.tagihan_uang_kbm.toLocaleString('id-ID')}`
                        : '-'
                    }
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium font-bold mb-1">SPP</label>
                  <input
                    type="text" // ubah dari 'number' ke 'text'
                    value={
                      siswaDetail.tagihan_uang_spp != null
                        ? `Rp${siswaDetail.tagihan_uang_spp.toLocaleString('id-ID')}`
                        : '-'
                    }
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium font-bold mb-1">Pemeliharaan</label>
                  <input
                    type="text" // ubah dari 'number' ke 'text'
                    value={
                      siswaDetail.tagihan_uang_pemeliharaan != null
                        ? `Rp${siswaDetail.tagihan_uang_pemeliharaan.toLocaleString('id-ID')}`
                        : '-'
                    }
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium font-bold mb-1">Sumbangan</label>
                    <input
                      type="text" // ubah dari 'number' ke 'text'
                      value={
                        siswaDetail.tagihan_uang_sumbangan != null
                          ? `Rp${siswaDetail.tagihan_uang_sumbangan.toLocaleString('id-ID')}`
                          : '-'
                      }
                      readOnly
                      className="border px-3 py-2 rounded w-full bg-gray-100"
                    />
                </div>
              </div>

              <button
                onClick={() => router.push('/pendapatan/techno')}
                className="mt-6 w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-500 transition font-semibold"
              >
                Kembali
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
