'use client'

import { useRef } from 'react'
import html2pdf from 'html2pdf.js'

export default function HomePage() {
  const pdfRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!pdfRef.current) return

    html2pdf()
      .set({
        margin: 0.5,
        filename: 'contoh_tagihan.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .from(pdfRef.current)
      .save()
  }

  return (
    <div className="p-6 text-black">
      <h1 className="text-xl font-bold mb-4">Contoh Cetak PDF</h1>
      <button
        onClick={handlePrint}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
      >
        Cetak PDF
      </button>

      <div ref={pdfRef} className="bg-white p-6 border rounded shadow w-full max-w-xl text-sm">
        <h2 className="text-lg font-semibold mb-2">Rincian Tagihan</h2>
        <p><strong>Nama Siswa:</strong> Budi Santoso</p>
        <p><strong>NISN:</strong> 1234567890</p>
        <p><strong>Kelas:</strong> 10 IPA</p>
        <p><strong>Tanggal:</strong> 11 Mei 2025</p>

        <table className="w-full mt-4 border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Jenis</th>
              <th className="border px-2 py-1 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">SPP</td>
              <td className="border px-2 py-1 text-right">Rp 500.000</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">KBM</td>
              <td className="border px-2 py-1 text-right">Rp 300.000</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4">Mohon segera melakukan pembayaran sebelum jatuh tempo.</p>
      </div>
    </div>
  )
}
