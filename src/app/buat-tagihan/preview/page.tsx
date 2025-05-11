'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import LogoPraxis from '@/app/assets/logo.png'

export default function PreviewTagihan() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('preview_tagihan')
    if (stored) {
      setData(JSON.parse(stored))
    }
  }, [])

  const formatRupiah = (angka: number) => `Rp ${angka.toLocaleString('id-ID')}`

  if (!data) return <p className="text-center mt-10">Memuat data...</p>

  const tunggakan = [
    { tahun: '2023/2024', jumlah: parseInt(data.tunggakan || '0') }
  ]

  const tagihanPokok = [
    { label: 'KBM', jumlah: parseInt(data.inputTagihan.kbm || '0') },
    { label: 'SPP', jumlah: parseInt(data.inputTagihan.spp || '0') },
    { label: 'Pemeliharaan', jumlah: parseInt(data.inputTagihan.pemeliharaan || '0') },
    { label: 'Sumbangan', jumlah: parseInt(data.inputTagihan.sumbangan || '0') },
  ]

  const tagihanBulanan = [
    { label: 'Konsumsi', jumlah: parseInt(data.inputTagihan.konsumsi || '0') },
    { label: 'Boarding', jumlah: parseInt(data.inputTagihan.boarding || '0') },
    { label: 'Ekstra Kurikuler', jumlah: parseInt(data.inputTagihan.ekstra || '0') },
    { label: 'Uang Belanja', jumlah: parseInt(data.inputTagihan.uang_belanja || '0') }
  ]

  const sisaTagihan = [...tagihanPokok, ...tagihanBulanan].map((item) => ({
    label: item.label,
    jumlah: (data.totalTagihan[item.label.toLowerCase().replace(/ /g, '_')] || 0) - item.jumlah
  }))

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 text-black">
      <div className="flex items-center justify-between mb-4">
        <Image src={LogoPraxis} alt="Logo Praxis" width={60} height={60} />
        <h1 className="text-2xl font-bold text-center flex-1 -ml-12">Praxis Academy</h1>
      </div>
      <hr className="border-black mb-4" />

      <p className="text-sm mb-4">
        Yth. Bapak/Ibu Wali Murid,<br />
        Dengan hormat,<br />
        Mohon untuk melakukan pembayaran sesuai dengan nominal yang tertera dalam rincian tagihan di bawah ini. Kami mengimbau agar pembayaran dapat dilakukan sebelum tanggal jatuh tempo guna menghindari keterlambatan dan memastikan kelancaran administrasi keuangan sekolah. Pembayaran ini ditujukan untuk siswa dengan nama berikut:
      </p>

      <div className="grid grid-cols-2 gap-2 text-sm mb-6">
        <p><strong>Nama:</strong> {data.namaSiswa}</p>
        <p><strong>NISN:</strong> {data.nisn}</p>
        <p><strong>Kelas:</strong> {data.level}</p>
        <p><strong>Semester:</strong> {data.semester}</p>
        <p><strong>Periode:</strong> {data.periode}</p>
        <p><strong>Akademik:</strong> {data.akademik}</p>
        <p><strong>Tanggal Tagihan:</strong> {data.tanggal}</p>
        <p><strong>Jatuh Tempo:</strong> {data.jatuhTempo}</p>
      </div>

      <h2 className="font-semibold mb-2">Tunggakan Tahun Ajaran Sebelumnya</h2>
      <table className="w-full mb-6 text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left border px-2 py-1">Tahun Ajaran</th>
            <th className="text-right border px-2 py-1">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {tunggakan.map((item, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{item.tahun}</td>
              <td className="border px-2 py-1 text-right">{formatRupiah(item.jumlah)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="font-semibold mb-2">Tagihan Pokok</h2>
      <table className="w-full mb-6 text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left border px-2 py-1">Jenis</th>
            <th className="text-right border px-2 py-1">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {tagihanPokok.map((item, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{item.label}</td>
              <td className="border px-2 py-1 text-right">{formatRupiah(item.jumlah)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="font-semibold mb-2">Tagihan Bulanan</h2>
      <table className="w-full mb-6 text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left border px-2 py-1">Jenis</th>
            <th className="text-right border px-2 py-1">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {tagihanBulanan.map((item, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{item.label}</td>
              <td className="border px-2 py-1 text-right">{formatRupiah(item.jumlah)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="font-semibold mb-2">Sisa Tagihan</h2>
      <table className="w-full mb-6 text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left border px-2 py-1">Jenis</th>
            <th className="text-right border px-2 py-1">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {sisaTagihan.map((item, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{item.label}</td>
              <td className="border px-2 py-1 text-right">{formatRupiah(item.jumlah)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.catatan && <p className="text-sm mb-6"><strong>Catatan:</strong> {data.catatan}</p>}

      <p className="text-sm">Demikian bukti tagihan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
    </div>
  )
}
