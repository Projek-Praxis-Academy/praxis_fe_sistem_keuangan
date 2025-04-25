'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2 } from 'lucide-react'

export default function TambahKontrakSiswa() {
  const router = useRouter()

  const [nisn, setNisn] = useState('')
  const [uangKBM, setUangKBM] = useState('')
  const [uangSPP, setUangSPP] = useState('')
  const [uangPemeliharaan, setUangPemeliharaan] = useState('')
  const [uangSumbangan, setUangSumbangan] = useState('')
  const [catatan, setCatatan] = useState('')
  const [fileKontrak, setFileKontrak] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nisn || !uangKBM || !uangSPP || !uangPemeliharaan || !uangSumbangan || !fileKontrak) {
      setError('Semua field wajib diisi, termasuk file PDF kontrak.')
      return
    }

    if (fileKontrak.type !== 'application/pdf') {
      setError('File kontrak harus berupa PDF.')
      return
    }

    if (fileKontrak.size > 10 * 1024 * 1024) {
      setError('Ukuran file tidak boleh lebih dari 10 MB.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('nisn', nisn)
      formData.append('uang_kbm', uangKBM)
      formData.append('uang_spp', uangSPP)
      formData.append('uang_pemeliharaan', uangPemeliharaan)
      formData.append('uang_sumbangan', uangSumbangan)
      formData.append('catatan', catatan)
      formData.append('file_kontrak', fileKontrak)

      const response = await fetch('http://127.0.0.1:8000/api/kontrak', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 4|osACJZuD070U2LqNSkRqP7GhgIwv0OumsOqcXmQl35a58ada'
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok || data.status === 'error') {
        setError(data.message || 'Terjadi kesalahan saat menyimpan kontrak.')
      } else {
        alert('Kontrak berhasil disimpan.')
        router.push('/pendapatan/praxis')
      }
    } catch (err) {
      setError('Gagal menyimpan data. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-2xl mx-auto border">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">TAMBAH KONTRAK SISWA</h2>
        <p className="text-sm text-gray-500 mb-4">Lengkapi data kontrak berdasarkan NISN siswa.</p>

        {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium">NISN</label>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Masukkan NISN"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Uang KBM</label>
            <input
              type="number"
              value={uangKBM}
              onChange={(e) => setUangKBM(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Jumlah KBM"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Uang SPP</label>
            <input
              type="number"
              value={uangSPP}
              onChange={(e) => setUangSPP(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Jumlah SPP"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Uang Pemeliharaan</label>
            <input
              type="number"
              value={uangPemeliharaan}
              onChange={(e) => setUangPemeliharaan(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Jumlah Pemeliharaan"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Uang Sumbangan</label>
            <input
              type="number"
              value={uangSumbangan}
              onChange={(e) => setUangSumbangan(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Jumlah Sumbangan"
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium">Catatan</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              placeholder="Tuliskan catatan tambahan"
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium">File Kontrak (PDF)</label>
            <p className="text-xs text-gray-500">* Wajib diunggah, maksimal 10 MB</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFileKontrak(e.target.files?.[0] || null)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="col-span-2 mt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              <FilePlus2 className="w-5 h-5" />
              {loading ? 'Menyimpan...' : 'Simpan Kontrak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
