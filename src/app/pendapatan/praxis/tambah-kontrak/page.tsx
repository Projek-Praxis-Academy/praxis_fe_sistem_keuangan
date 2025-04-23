'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2 } from 'lucide-react'

export default function KontrakPraxis() {
  const router = useRouter()

  const [idSiswa, setIdSiswa] = useState('')
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

    if (!idSiswa || !uangKBM || !uangSPP || !uangPemeliharaan || !uangSumbangan) {
      setError('Semua field harus diisi!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('id_siswa', idSiswa)
      formData.append('uang_kbm', uangKBM)
      formData.append('uang_spp', uangSPP)
      formData.append('uang_pemeliharaan', uangPemeliharaan)
      formData.append('uang_sumbangan', uangSumbangan)
      formData.append('catatan', catatan)
      if (fileKontrak) formData.append('file_kontrak', fileKontrak)

      const response = await fetch('http://127.0.0.1:8000/api/kontrak', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 4|osACJZuD070U2LqNSkRqP7GhgIwv0OumsOqcXmQl35a58ada'
        },
        body: formData
      })

      const data = await response.json()

      if (data.status === 'error') {
        setError(data.errors ? Object.values(data.errors).join(', ') : 'Terjadi kesalahan')
      } else {
        alert('Kontrak berhasil ditambahkan!')
        router.push('/pendapatan/praxis')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim data. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-2xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">TAMBAH KONTRAK SISWA</h2>
          <p className="text-sm text-gray-500 mb-4">Lengkapi data kontrak pembayaran siswa berikut ini.</p>

          {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">ID Siswa</label>
              <input
                type="text"
                value={idSiswa}
                onChange={(e) => setIdSiswa(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Masukkan ID Siswa"
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Kontrak Siswa</label>
              <p className="text-xs text-gray-500">* Maksimal ukuran 10 MB, hanya format PDF</p>
              <input
                type="file"
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
    </div>
  )
}
