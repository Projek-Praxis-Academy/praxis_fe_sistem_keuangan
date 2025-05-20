'use client'

import { useState } from 'react'
import { FilePlus2 } from 'lucide-react'
import axios from 'axios'
// import html2pdf from 'html2pdf.js'
import { pdf } from '@react-pdf/renderer'
import PDFTagihan from '@/components/PDFTagihan'
import Image from 'next/image'

export default function BuatTagihan() {
  const [nisn, setNisn] = useState('')
  const [namaSiswa, setNamaSiswa] = useState('')
  const [level, setLevel] = useState('')
  const [akademik, setAkademik] = useState('')
  const [semester, setSemester] = useState('')
  const [periode, setPeriode] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [jatuhTempo, setJatuhTempo] = useState('')
  const [tunggakan, setTunggakan] = useState('')
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [inputTagihan, setInputTagihan] = useState({
    kbm: '',
    spp: '',
    pemeliharaan: '',
    sumbangan: '',
    konsumsi: '',
    boarding: '',
    ekstra: '',
    uang_belanja: ''
  })

  const [totalTagihan, setTotalTagihan] = useState({
    kbm: 0,
    spp: 0,
    pemeliharaan: 0,
    sumbangan: 0,
    konsumsi: 0,
    boarding: 0,
    ekstra: 0,
    uang_belanja: 0
  })

  const fetchTagihanByNisn = async (nisn: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`http://127.0.0.1:8000/api/tagihan/${nisn}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data
      setNamaSiswa(data.nama_siswa)
      setLevel(data.level)
      setAkademik(data.akademik)
      setTotalTagihan({
        kbm: parseInt(data.tagihan_uang_kbm.replace(/\./g, '')) || 0,
        spp: parseInt(data.tagihan_uang_spp.replace(/\./g, '')) || 0,
        pemeliharaan: parseInt(data.tagihan_uang_pemeliharaan.replace(/\./g, '')) || 0,
        sumbangan: parseInt(data.tagihan_uang_sumbangan.replace(/\./g, '')) || 0,
        konsumsi: parseInt(data.tagihan_konsumsi.replace(/\./g, '')) || 0,
        boarding: parseInt(data.tagihan_boarding.replace(/\./g, '')) || 0,
        ekstra: parseInt(data.tagihan_ekstra.replace(/\./g, '')) || 0,
        uang_belanja: parseInt(data.tagihan_uang_saku.replace(/\./g, '')) || 0
      })
    } catch (err) {
      console.error(err)
      setError('Gagal mengambil data tagihan. Pastikan NISN valid.')
    }
  }

    const formatRupiah = (val: number | string) => 'Rp ' + (parseInt(val as string) || 0).toLocaleString('id-ID')
    


    const handlePrintPDF = async () => {
    const blob = await pdf(
     <PDFTagihan
          data={{
          namaSiswa,
          nisn,
          level,
          akademik,
          semester,
          periode,
          tanggal,
          jatuhTempo,
          tunggakan,
          catatan,
          inputTagihan,
          totalTagihan
          }}
     />
     ).toBlob()

     const url = URL.createObjectURL(blob)
     const a = document.createElement('a')
     a.href = url
     a.download = `tagihan_${namaSiswa}.pdf`
     a.click()
     }


  const renderInputField = (label: string, key: keyof typeof inputTagihan) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <p className="text-xs text-gray-500 mb-1">
        Total Tagihan: {formatRupiah(totalTagihan[key])}
      </p>
      <input
        type="number"
        value={inputTagihan[key]}
        onChange={(e) => setInputTagihan({ ...inputTagihan, [key]: e.target.value })}
        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
        placeholder={`Jumlah ${label}`}
      />
    </div>
  )

  const tagihanPokok = [
    { label: 'KBM', key: 'kbm' },
    { label: 'SPP', key: 'spp' },
    { label: 'Pemeliharaan', key: 'pemeliharaan' },
    { label: 'Sumbangan', key: 'sumbangan' }
  ]

  const tagihanBulanan = [
    { label: 'Konsumsi', key: 'konsumsi' },
    { label: 'Boarding', key: 'boarding' },
    { label: 'Ekstra Kurikuler', key: 'ekstra' },
    { label: 'Uang Belanja', key: 'uang_belanja' }
  ]

  const sisaTagihan = [...tagihanPokok, ...tagihanBulanan].map(item => ({
    label: item.label,
    jumlah: totalTagihan[item.key as keyof typeof totalTagihan] - parseInt(inputTagihan[item.key as keyof typeof inputTagihan] || '0')
  }))

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-3xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">BUAT TAGIHAN SISWA</h2>
          <p className="text-sm text-gray-500 mb-4">Lengkapi form tagihan siswa berikut ini.</p>
          <hr className="border-t-3 border-blue-900 mb-5" />

          {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

          <form onSubmit={(e) => { e.preventDefault(); handlePrintPDF() }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">NISN Siswa</label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                onBlur={() => nisn && fetchTagihanByNisn(nisn)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Masukkan NISN"
              />
            </div>

            <div><label>Nama Siswa</label><p className="mt-1 bg-gray-100 px-3 py-2 rounded">{namaSiswa}</p></div>
            <div><label>Level</label><p className="mt-1 bg-gray-100 px-3 py-2 rounded">{level}</p></div>
            <div><label>Akademik</label><p className="mt-1 bg-gray-100 px-3 py-2 rounded">{akademik}</p></div>
            <div><label>Semester</label><input value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" /></div>
            <div><label>Periode</label><input value={periode} onChange={(e) => setPeriode(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" /></div>
            <div><label>Tanggal Tagihan</label><input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" /></div>
            <div><label>Jatuh Tempo</label><input type="date" value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" /></div>

            <h3 className="col-span-2 mt-4 font-bold border-b pb-1">Tagihan Pokok</h3>
            {tagihanPokok.map(item => renderInputField(item.label, item.key as keyof typeof inputTagihan))}

            <h3 className="col-span-2 mt-4 font-bold border-b pb-1">Tagihan Bulanan</h3>
            {tagihanBulanan.map(item => renderInputField(item.label, item.key as keyof typeof inputTagihan))}

            <div className="col-span-2">
              <label className="text-sm font-medium">Tunggakan Tahun Ajaran Sebelumnya</label>
              <input
                type="number"
                value={tunggakan}
                onChange={(e) => setTunggakan(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Catatan</label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
              />
            </div>

            <div className="col-span-2 mt-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-medium px-4 py-2 rounded-md hover:bg-green-700"
              >
                <FilePlus2 className="w-5 h-5" /> Cetak Tagihan
              </button>
            </div>
          </form>

          {/* <div id="preview-area" className="mt-10 bg-white p-8 text-black">
            <div className="flex items-center justify-between mb-4">
              <Image src="/logo.png" alt="Praxis Academy" width={80} height={80} />
              <h1 className="text-2xl font-bold text-center flex-1 -ml-12">Praxis Academy</h1>
            </div>
            <hr className="border-black mb-4" />

            <p className="text-sm mb-4">
              Yth. Bapak/Ibu Wali Murid,<br />Dengan hormat,<br />Mohon untuk melakukan pembayaran sesuai dengan rincian berikut:
            </p>

            <div className="grid grid-cols-2 gap-2 text-sm mb-6">
              <p><strong>Nama:</strong> {namaSiswa}</p>
              <p><strong>NISN:</strong> {nisn}</p>
              <p><strong>Kelas:</strong> {level}</p>
              <p><strong>Semester:</strong> {semester}</p>
              <p><strong>Periode:</strong> {periode}</p>
              <p><strong>Akademik:</strong> {akademik}</p>
              <p><strong>Tanggal Tagihan:</strong> {tanggal}</p>
              <p><strong>Jatuh Tempo:</strong> {jatuhTempo}</p>
            </div>

            <h2 className="font-semibold mb-2">Tunggakan Tahun Ajaran Sebelumnya</h2>
            <table className="w-full mb-6 text-sm border">
              <thead><tr className="bg-gray-100"><th className="text-left border px-2 py-1">Tahun Ajaran</th><th className="text-right border px-2 py-1">Jumlah</th></tr></thead>
              <tbody><tr><td className="border px-2 py-1">2023/2024</td><td className="border px-2 py-1 text-right">{formatRupiah(tunggakan)}</td></tr></tbody>
            </table>

            <h2 className="font-semibold mb-2">Tagihan Pokok</h2>
            <table className="w-full mb-6 text-sm border">
              <thead><tr className="bg-gray-100"><th className="text-left border px-2 py-1">Jenis</th><th className="text-right border px-2 py-1">Jumlah</th></tr></thead>
              <tbody>
                {tagihanPokok.map(({ label, key }, i) => (
                  <tr key={i}><td className="border px-2 py-1">{label}</td><td className="border px-2 py-1 text-right">{formatRupiah(inputTagihan[key as keyof typeof inputTagihan])}</td></tr>
                ))}
              </tbody>
            </table>

            <h2 className="font-semibold mb-2">Tagihan Bulanan</h2>
            <table className="w-full mb-6 text-sm border">
              <thead><tr className="bg-gray-100"><th className="text-left border px-2 py-1">Jenis</th><th className="text-right border px-2 py-1">Jumlah</th></tr></thead>
              <tbody>
                {tagihanBulanan.map(({ label, key }, i) => (
                  <tr key={i}><td className="border px-2 py-1">{label}</td><td className="border px-2 py-1 text-right">{formatRupiah(inputTagihan[key as keyof typeof inputTagihan])}</td></tr>
                ))}
              </tbody>
            </table>

            <h2 className="font-semibold mb-2">Sisa Tagihan</h2>
            <table className="w-full mb-6 text-sm border">
              <thead><tr className="bg-gray-100"><th className="text-left border px-2 py-1">Jenis</th><th className="text-right border px-2 py-1">Jumlah</th></tr></thead>
              <tbody>
                {sisaTagihan.map((item, i) => (
                  <tr key={i}><td className="border px-2 py-1">{item.label}</td><td className="border px-2 py-1 text-right">{formatRupiah(item.jumlah)}</td></tr>
                ))}
              </tbody>
            </table>

            {catatan && <p className="text-sm mb-6"><strong>Catatan:</strong> {catatan}</p>}
            <p className="text-sm">Demikian bukti tagihan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
          </div> */}
        </div>
      </div>
    </div>
  )
}

