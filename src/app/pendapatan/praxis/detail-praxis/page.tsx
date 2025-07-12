'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'

interface Siswa {
  nama_siswa: string
  id_siswa: string
  nisn: string
  level: string
  kategori: string
  akademik: string
  nama_wali: string
  no_hp_wali: string
  file_kontrak: string
  tagihan_uang_kbm: number | null
  tagihan_uang_spp: number | null
  tagihan_uang_pemeliharaan: number | null
  tagihan_uang_sumbangan: number | null
}

function DetailPraxisInner() {
  const searchParams = useSearchParams()
  const id_siswa = searchParams.get('id_siswa') || ''
  const router = useRouter()

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id_siswa) return

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Token tidak ditemukan. Anda perlu login ulang.')
      setLoading(false)
      return
    }

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-praxis/detail-kontrak/${id_siswa}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        const siswa = res.data.data
        const kontrak = siswa.kontrak || {}

        const siswaData: Siswa = {
          id_siswa: siswa.id_siswa.toString(),
          nama_siswa: siswa.nama_siswa,
          nisn: siswa.nisn,
          level: siswa.level,
          kategori: siswa.kategori,
          akademik: siswa.akademik,
          nama_wali: siswa.nama_wali,
          no_hp_wali: siswa.no_hp_wali,
          file_kontrak: kontrak.file_kontrak || '',
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
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">KONTRAK SISWA PRAXIS ACADEMY</h2>
          <hr className="border-t-3 border-blue-900 mb-8" />

          {loading && (
            <div className="flex justify-center items-center">
              <div className="spinner"></div>
              <span className="ml-2">Loading...</span>
            </div>
          )}

          {error && (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {siswaDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  id="nama_siswa"
                  value={siswaDetail.nama_siswa}
                  readOnly
                  className="w-full border px-3 py-2 rounded bg-gray-100 "
                />
                <input
                  id="id_siswa"
                  value={`Level${siswaDetail.level}`}
                  readOnly
                  className="w-full border px-3 py-2 rounded bg-gray-100 "
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  id="nisn"
                  value={`NISN: ${siswaDetail.nisn}`}
                  readOnly
                  className="w-full border px-3 py-2 rounded bg-gray-100 "
                />
                <input
                  id="akademik"
                  value={`${siswaDetail.akademik}`}
                  readOnly
                  className="w-full border px-3 py-2 rounded bg-gray-100 "
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">KBM</label>
                  <input
                    id='uang_kbm'
                    value={`Rp${siswaDetail.tagihan_uang_kbm?.toLocaleString('id-ID')}`}
                    readOnly
                    className="w-full border px-3 py-2 rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">SPP</label>
                  <input
                    id='uang_spp'
                    value={`Rp${siswaDetail.tagihan_uang_spp?.toLocaleString('id-ID')}`}
                    readOnly
                    className="w-full border px-3 py-2 rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Pemeliharaan</label>
                  <input
                    id='uang_pemeliharaan'
                    value={`Rp${siswaDetail.tagihan_uang_pemeliharaan?.toLocaleString('id-ID')}`}
                    readOnly
                    className="w-full border px-3 py-2 rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Sumbangan</label>
                  <input
                    id='uang_sumbangan'
                    value={`Rp${siswaDetail.tagihan_uang_sumbangan?.toLocaleString('id-ID')}`}
                    readOnly
                    className="w-full border px-3 py-2 rounded bg-gray-100"
                  />
                </div>
              </div>

              {/* File Kontrak */}
              {siswaDetail.file_kontrak && (
                <div>
                  <label className="block font-bold mb-1">File Kontrak</label>
                  <a
                    id='file_kontrak'
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${siswaDetail.file_kontrak}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Lihat File Kontrak
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => router.push('/pendapatan/praxis')}
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

export default function DetailPraxis() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailPraxisInner />
    </Suspense>
  )
}
