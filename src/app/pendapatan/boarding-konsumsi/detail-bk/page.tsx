'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

interface Pembayaran {
  id_pembayaran: string
  tanggal_pembayaran: string
  jenis_pembayaran: string
  nominal: number
  catatan: string
}

interface SiswaDetail {
  id_siswa: number
  nama_siswa: string
  nisn: string
  level: string
  kategori: string
  akademik: string
  nama_wali: string
  no_hp_wali: string
  pembayaran: Pembayaran[]
}

interface Rekap {
  tanggal: string
  boarding: number
  konsumsi: number
  catatan: string[]
}

export default function DetailPembayaranBk() {
  const searchParams = useSearchParams()
  const id_siswa_query = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<SiswaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/monitoring/bk/detail-pembayaran/${id_siswa_query}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        setSiswaDetail(response.data)
      } catch (err) {
        setError('Gagal mengambil detail pembayaran.')
      } finally {
        setLoading(false)
      }
    }

    if (id_siswa_query) fetchDetail()
  }, [id_siswa_query])

  const generateRekap = (): Rekap[] => {
    if (!siswaDetail) return []

    const grouped: Record<string, Rekap> = {}

    siswaDetail.pembayaran.forEach((item) => {
      if (!grouped[item.tanggal_pembayaran]) {
        grouped[item.tanggal_pembayaran] = {
          tanggal: item.tanggal_pembayaran,
          boarding: 0,
          konsumsi: 0,
          catatan: [],
        }
      }

      const jenis = item.jenis_pembayaran.toLowerCase()
      if (jenis === 'boarding') {
        grouped[item.tanggal_pembayaran].boarding += item.nominal
      } else if (jenis === 'konsumsi') {
        grouped[item.tanggal_pembayaran].konsumsi += item.nominal
      }

      if (item.catatan) {
        grouped[item.tanggal_pembayaran].catatan.push(item.catatan)
      }
    })

    return Object.values(grouped).sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  }

  const rekapPembayaran = generateRekap()

  const formatRupiah = (num: number) =>
    num.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })

  const totalSaldo = siswaDetail?.pembayaran.reduce((acc, curr) => acc + curr.nominal, 0) ?? 0

  return (
    <div className="ml-64 p-8 text-black min-h-screen">
      <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
        Detail Pembayaran Siswa Boarding & Konsumsi
      </h1>

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-lg font-semibold">
            Nama: <span className="font-normal">{siswaDetail?.nama_siswa}</span>
          </p>
          <p className="text-lg font-semibold">
            Level: <span className="font-normal">{siswaDetail?.level}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Saldo Total</p>
          <p className="text-xl text-blue-800 font-bold">{formatRupiah(totalSaldo)}</p>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-x-auto">
        <table className="table-fixed w-full border border-blue-900 text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="w-1/5 border px-4 py-2">Tanggal</th>
              <th className="w-1/5 border px-4 py-2">Konsumsi</th>
              <th className="w-1/5 border px-4 py-2">Boarding</th>
              <th className="w-2/5 border px-4 py-2">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {rekapPembayaran.map((rekap, index) => (
              <tr key={index} className="text-center border-b hover:bg-gray-50">
                <td className="border px-4 py-2">{rekap.tanggal}</td>
                <td className="border px-4 py-2">
                  {rekap.konsumsi > 0 ? formatRupiah(rekap.konsumsi) : ''}
                </td>
                <td className="border px-4 py-2">
                  {rekap.boarding > 0 ? formatRupiah(rekap.boarding) : ''}
                </td>
                <td className="border px-4 py-2 text-left">
                  {rekap.catatan.length > 0 ? rekap.catatan.join(', ') : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
