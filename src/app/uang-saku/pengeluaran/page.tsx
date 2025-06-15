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

function formatRupiah(angka: string) {
  if (!angka) return ''
  const num = Number(angka.replace(/\D/g, ''))
  if (isNaN(num)) return ''
  return num.toLocaleString('id-ID')
}

function PengeluaranUangSakuInner() {
  const searchParams = useSearchParams()
  const id_siswa_query = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [tanggalPengeluaran, setTanggalPengeluaran] = useState('')
  const [nominal, setNominal] = useState('')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    const fetchSiswaDetail = async () => {
      if (!id_siswa_query) return

      setLoading(true)
      setError('')

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-uang-saku/pengeluaran/${id_siswa_query}`,
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

    if (!tanggalPengeluaran || nominal.trim() === '') {
      setError('Tanggal dan nominal harus diisi.')
      return
    }

    const data = {
      id_siswa: siswaDetail.id_siswa.toString(),
      nama_siswa: siswaDetail.nama_siswa,
      tanggal_pengeluaran: tanggalPengeluaran,
      nominal: parseInt(nominal),
      catatan: catatan.trim() !== '' ? catatan : null,
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-uang-saku/pengeluaran`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (response.data.status === 'success') {
        setSuccess(response.data.message || 'Pengeluaran berhasil disimpan.')
        setTanggalPengeluaran('')
        setNominal('')
        setCatatan('')
        window.location.href = `/uang-saku`
      } else {
        setError(response.data.message || 'Gagal menyimpan pengeluaran.')
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Gagal menyimpan pengeluaran.')
      } else {
        setError('Terjadi kesalahan saat mengirim data.')
      }
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">PENGELUARAN UANG SAKU</h2>
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

              <input type="hidden" value={siswaDetail.id_siswa} name="id_siswa" readOnly />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pengeluaran
                </label>
                <input
                  id='tanggalPembayaran'
                  type="date"
                  value={tanggalPengeluaran}
                  onChange={(e) => setTanggalPengeluaran(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal</label>
                <div className="flex items-center border rounded px-2 bg-white">
                    <span className="text-gray-500 text-sm mr-1">Rp</span>
                      <input
                        id='nominal'
                        type="text"
                        placeholder="1000000"
                        value={nominal}
                        onChange={(e) => setNominal(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 rounded"
                      />
                </div>
                {nominal && (
                  <div className="text-xs text-gray-500 mt-1">
                    {`Rp ${formatRupiah(nominal)}`}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  id='catatan'
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Wajib diisi. Contoh: Uang transportasi ke rumah."
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

export default function PengeluaranUangSaku() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PengeluaranUangSakuInner />
    </Suspense>
  )
}
