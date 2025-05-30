'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'

interface SiswaUangSaku {
  id_siswa: string
  nama_siswa: string
  nisn: string
  level: string
  akademik: string
  total_uang_saku: number
  saku_terpakai: number
  saku_tersisa: number
}

function DetailUangSakuInner() {
  const searchParams = useSearchParams()
  const id_siswa = searchParams.get('id_siswa') || ''
  const router = useRouter()

  const [siswaDetail, setSiswaDetail] = useState<SiswaUangSaku | null>(null)
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

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-uang-saku/detail/${id_siswa}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        setSiswaDetail(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Gagal mengambil data siswa.')
        setLoading(false)
      })
  }, [id_siswa])

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">DETAIL UANG SAKU SISWA</h2>
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
                  <label className="block text-base font-medium font-bold mb-1">Total Uang Saku</label>
                  <input
                    type="text"
                    value={`Rp${siswaDetail.total_uang_saku.toLocaleString('id-ID')}`}
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium font-bold mb-1">Saku Terpakai</label>
                  <input
                    type="text"
                    value={`Rp${siswaDetail.saku_terpakai.toLocaleString('id-ID')}`}
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium font-bold mb-1">Saku Tersisa</label>
                  <input
                    type="text"
                    value={`Rp${siswaDetail.saku_tersisa.toLocaleString('id-ID')}`}
                    readOnly
                    className="border px-3 py-2 rounded w-full bg-gray-100"
                  />
                </div>
              </div>

              <button
                onClick={() => router.push('/uang-saku')}
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

export default function DetailUangSaku() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailUangSakuInner />
    </Suspense>
  )
}
