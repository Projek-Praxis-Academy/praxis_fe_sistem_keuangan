'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2 } from 'lucide-react'
import axios from 'axios'

export default function TambahSiswa() {
  const router = useRouter()

  const [nisn, setNisn] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [nominal, setNominal] = useState('')
  const [tagihan, setTagihan] = useState('')
  const [catatan, setCatatan] = useState('')
  const [jenisTagihan, setJenisTagihan] = useState('boarding') // default to boarding
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
   
     // Validasi input
     if (!nisn || !tanggalMulai || !tanggalSelesai || !nominal || !catatan) {
       setError('Semua field wajib diisi!')
       return
     }
   
     const nominalInt = parseInt(nominal)
     if (isNaN(nominalInt)) {
       setError('Nominal harus berupa angka!')
       return
     }
   
     setLoading(true)
     setError('')
   
     try {
       const url =
         jenisTagihan === 'boarding'
           ? 'http://127.0.0.1:8000/api/create/siswa/boarding'
           : 'http://127.0.0.1:8000/api/create/siswa/konsumsi'
   
       const data = {
         nisn,
         tanggal_mulai: tanggalMulai,
         tanggal_selesai: tanggalSelesai,
         tagihan: nominalInt,
         catatan,
       }
   
       const response = await axios.post(url, data, {
         headers: {
           'Content-Type': 'application/json',
           Authorization: 'Bearer 4|osACJZuD070U2LqNSkRqP7GhgIwv0OumsOqcXmQl35a58ada',
         },
       })
   
       alert('Data Siswa berhasil ditambahkan!')
       router.push('/pendapatan/boarding-konsumsi')
     } catch (err: any) {
       console.error(err)
       const msg = err.response?.data?.message || 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.'
       setError(msg)
     } finally {
       setLoading(false)
     }
   }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-2xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">TAMBAH SISWA</h2>
          <p className="text-sm text-gray-500 mb-4">Lengkapi data siswa untuk tagihan boarding atau konsumsi berikut ini.</p>

          {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">NISN Siswa</label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Masukkan NISN Siswa"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tanggal Selesai</label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Nominal</label>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Nominal Tagihan"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Jenis Tagihan</label>
              <select
                value={jenisTagihan}
                onChange={(e) => setJenisTagihan(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="boarding">Boarding</option>
                <option value="konsumsi">Konsumsi</option>
              </select>
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

            <div className="col-span-2 mt-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                <FilePlus2 className="w-5 h-5" />
                {loading ? 'Menyimpan...' : 'Simpan Siswa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
