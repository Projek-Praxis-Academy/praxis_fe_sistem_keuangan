'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

interface Transaksi {
  id: string
  tanggal: string
  nominal: number
  catatan: string
  jenis: 'TOPUP' | 'PENGELUARAN'
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
  pembayaran_uang_saku: {
    id_pembayaran_uang_saku: string
    nominal: number
    tanggal_pembayaran: string
    catatan: string
  }[]
  pengeluaran_uang_saku: {
    id_pengeluaran_uang_saku: string
    nominal: number
    tanggal_pengeluaran: string
    catatan: string
  }[]
}

export default function DetailUangSaku() {
  const searchParams = useSearchParams()
  const id_siswa_query = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<SiswaDetail | null>(null)
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])
  const [saldo, setSaldo] = useState<string>('Rp 0')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token') || ''

        // Ambil data detail transaksi
        const detailRes = await axios.get(
          `https://fitrack-production.up.railway.app/api/monitoring-uang-saku/detail/${id_siswa_query}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = detailRes.data

        // Gabungkan transaksi topup dan pengeluaran
        const topup = data.pembayaran_uang_saku.map((item: any) => ({
          id: item.id_pembayaran_uang_saku,
          tanggal: item.tanggal_pembayaran,
          nominal: item.nominal,
          catatan: item.catatan,
          jenis: 'TOPUP' as const,
        }))

        const pengeluaran = data.pengeluaran_uang_saku.map((item: any) => ({
          id: item.id_pengeluaran_uang_saku,
          tanggal: item.tanggal_pengeluaran,
          nominal: item.nominal,
          catatan: item.catatan,
          jenis: 'PENGELUARAN' as const,
        }))

        setSiswaDetail(data)
        setTransaksi([...topup, ...pengeluaran])

        // Ambil saldo dari endpoint monitoring uang saku
        const listRes = await axios.get(
          'https://fitrack-production.up.railway.app/api/monitoring-uang-saku',
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const siswaMonitoring = listRes.data.data.find(
          (item: any) => item.id_siswa === Number(id_siswa_query)
        )

        if (siswaMonitoring && siswaMonitoring.uang_saku?.saldo !== undefined) {
          setSaldo(`Rp ${siswaMonitoring.uang_saku.saldo.toLocaleString('id-ID')}`)
        }

      } catch (err) {
        console.error(err)
        setError('Gagal mengambil data detail.')
      } finally {
        setLoading(false)
      }
    }

    if (id_siswa_query) fetchDetail()

  }, [id_siswa_query])

  const formatRupiah = (num: number) =>
    `Rp ${num.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).slice(3)}` // Menghapus 'Rp' yang sudah ditambahkan di atas

  return (
    <div className="ml-64 p-8 text-black min-h-screen">
      <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">Transaksi Uang Saku Siswa</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && siswaDetail && (
        <>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-lg font-semibold">Nama: <span className="font-normal">{siswaDetail.nama_siswa}</span></p>
              <p className="text-lg font-semibold">Level: <span className="font-normal">{siswaDetail.level}</span></p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Saldo Total</p>
              <p className="text-xl font-bold text-green-700">{saldo}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table-fixed w-full border border-blue-900 text-sm">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="w-1/5 border px-4 py-2">Tanggal</th>
                  <th className="w-1/5 border px-4 py-2">Aksi</th>
                  <th className="w-1/5 border px-4 py-2">Nominal</th>
                  <th className="w-2/5 border px-4 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.map((item, index) => (
                  <tr key={index} className="text-center border-b">
                    <td className="border px-4 py-2">{item.tanggal}</td>
                    <td className="border px-4 py-2">
                      <span className={`text-white px-2 py-1 rounded text-xs font-semibold ${
                        item.jenis === 'TOPUP' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {item.jenis}
                      </span>
                    </td>
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
