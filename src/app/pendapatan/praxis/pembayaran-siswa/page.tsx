'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'

interface Kontrak {
  uang_kbm: number | null
  uang_spp: number | null
  uang_pemeliharaan: number | null
  uang_sumbangan: number | null
  file_kontrak: string
  catatan: string
}

interface Siswa {
  id_siswa: string
  nama_siswa: string
  nisn: string
  level: string
  kategori: string
  akademik: string
  nama_wali: string
  no_hp_wali: string
  kontrak?: Kontrak
}

function PembayaranSiswaInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id_siswa_query = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

      setSuccess('')
      setLoading(true)
      setError('')

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-praxis/pembayaran-siswa/${id_siswa_query}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        const data = response.data.data
        setSiswaDetail({
          id_siswa: data.id_siswa.toString(),
          nama_siswa: data.nama_siswa,
          nisn: data.nisn,
          level: data.level,
          kategori: data.kategori,
          akademik: data.akademik,
          nama_wali: data.nama_wali,
          no_hp_wali: data.no_hp_wali,
          kontrak: data.kontrak
        })
        setSuccess(response.data.message || 'Data siswa berhasil dimuat')
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
      setError('Minimal satu jenis pembayaran harus diisi.')
      return
    }

    if (!tanggalPembayaran) {
      setError('Tanggal pembayaran harus diisi.')
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/pembayaran`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.status === 'success') {
        setSuccess('Pembayaran berhasil dilakukan.')
        localStorage.setItem('praxis_last_nama', siswaDetail.nama_siswa)
        setTanggalPembayaran('')
        setKbm('')
        setSpp('')
        setPemeliharaan('')
        setSumbangan('')
        setCatatan('')
        setTimeout(() => {
          setSuccess('')
          router.push('/pendapatan/praxis')
        }, 1200)
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
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-5">PEMBAYARAN PRAXIS ACADEMY</h2>
          <hr className="border-t-2 border-blue-900 mb-5" />

          {loading && <p>Loading...</p>}
          {error && (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{error}</p>
            </div>
          )}
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

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Pembayaran</label>
                <input type="date" value={tanggalPembayaran} onChange={(e) => setTanggalPembayaran(e.target.value)} className="w-full border px-3 py-2 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'KBM', value: kbm, set: setKbm },
                  { label: 'SPP', value: spp, set: setSpp },
                  { label: 'Pemeliharaan', value: pemeliharaan, set: setPemeliharaan },
                  { label: 'Sumbangan', value: sumbangan, set: setSumbangan }
                ].map(({ label, value, set }, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <div className="flex items-center border rounded px-2 bg-white">
                      <span className="text-gray-500 text-sm mr-1">Rp</span>
                      <input
                        id={label.toLowerCase()}
                        type="number"
                        placeholder="0"
                        value={value}
                        onChange={(e) => set(e.target.value.replace(/\D/g, ''))}
                        className="px-2 py-2 w-full focus:outline-none"
                      />
                    </div>
                    {value && (
                      <div className="text-xs text-gray-500 mt-1">
                        {`Rp ${formatRupiah(value)}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Pembayaran</label>
                <div className="flex items-center border rounded px-2 bg-white">
                  <span className="text-gray-500 text-sm mr-1">Rp</span>
                  <input
                    type="text"
                    value={totalPembayaran.toLocaleString('id-ID')}
                    readOnly
                    className="px-2 py-2 w-full bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  id='catatan'
                  placeholder="Masukkan catatan (opsional)"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={2}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-2 px-4 bg-blue-900 text-white rounded hover:bg-blue-800 transition"
              >
                Simpan Pembayaran
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PembayaranSiswaPage() {
  return (
    <Suspense fallback={<div className="ml-64 p-8">Loading...</div>}>
      <PembayaranSiswaInner />
    </Suspense>
  )
}

export default PembayaranSiswaPage

function formatRupiah(angka: string) {
  if (!angka) return ''
  const num = Number(angka.replace(/\D/g, ''))
  if (isNaN(num)) return ''
  return num.toLocaleString('id-ID')
}
