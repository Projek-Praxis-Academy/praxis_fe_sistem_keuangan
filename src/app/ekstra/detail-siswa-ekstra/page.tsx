'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

interface PembayaranEkstra {
  id_pembayaran_ekstra: string
  tanggal_pembayaran: string
  nominal: number
  catatan: string
}

interface DetailSiswaEkstra {
  id_siswa: number
  nama_siswa: string
  nisn: string
  level: string
  akademik: string
  id_ekstra_siswa: string
  id_ekstra: string
  nama_ekstra: string
  tagihan_ekstra: string
  catatan: string
}

export default function DetailSiswaEkstra() {
  const searchParams = useSearchParams()
  const id_ekstra_siswa = searchParams.get('id_ekstra_siswa') || ''

  const [detailSiswa, setDetailSiswa] = useState<DetailSiswaEkstra | null>(null)
  const [pembayaran, setPembayaran] = useState<PembayaranEkstra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''

        const resDetail = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/pembayaran/${id_ekstra_siswa}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setDetailSiswa(resDetail.data.data)

        const resPembayaran = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/detail/${id_ekstra_siswa}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setPembayaran(resPembayaran.data.pembayaran_ekstra)
      } catch (err) {
        console.error(err)
        setError('Gagal mengambil data detail pembayaran ekstra.')
      } finally {
        setLoading(false)
      }
    }

    if (id_ekstra_siswa) fetchData()
  }, [id_ekstra_siswa])

  const formatRupiah = (num: number) =>
    `Rp ${num.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).slice(3)}`

  return (
    <div className="ml-64 p-8 text-black min-h-screen ">
      <h1 className="text-2xl font-bold text-black mb-6 text-center">Riwayat Pembayaran Ekstrakurikuler</h1>

      {loading && <p>Loading...</p>}
      {/* Alert Error */}
          {error && (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{error}</p>
            </div>
          )}


      {!loading && detailSiswa && (
        <>
          {/* Informasi Siswa dan Tagihan */}
          <div className="flex justify-between mb-6">
            {/* Kiri - Informasi Siswa */}
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Nama:</span> {detailSiswa.nama_siswa}</p>
              <p><span className="font-semibold">Level:</span> {detailSiswa.level}</p>
              <p><span className="font-semibold">Akademik:</span> {detailSiswa.akademik}</p>
              <p><span className="font-semibold">Ekstrakurikuler:</span> {detailSiswa.nama_ekstra}</p>
            </div>

            {/* Kanan - Tagihan */}
            <div className="text-sm text-right">
              <p className="font-semibold text-blue-900">Total Tagihan</p>
              <p className="text-lg font-semibold"><span className="font-normal"> Rp {detailSiswa.tagihan_ekstra}</span></p>
            </div>
          </div>

          {/* Tabel Pembayaran */}
          <div className="overflow-x-auto">
            <table className="table-fixed w-full border border-blue-900 text-sm">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="w-1/5 border px-4 py-2">Tanggal Pembayaran</th>
                  <th className="w-1/5 border px-4 py-2">Ekstra</th>
                  <th className="w-1/5 border px-4 py-2">Nominal</th>
                  <th className="w-2/5 border px-4 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {pembayaran.map((item, index) => (
                  <tr key={index} className="text-center border-b">
                    <td className="border px-4 py-2">{item.tanggal_pembayaran}</td>
                    <td className="border px-4 py-2">{detailSiswa.nama_ekstra}</td>
                    <td className="border px-4 py-2">{formatRupiah(item.nominal)}</td>
                    <td className="border px-4 py-2 text-left">{item.catatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
