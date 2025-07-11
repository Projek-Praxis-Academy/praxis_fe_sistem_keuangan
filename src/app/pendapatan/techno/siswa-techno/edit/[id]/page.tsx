'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FilePlus2 } from 'lucide-react'
import axios from 'axios'

export default function Page() {
  const router = useRouter()

  const [namaSiswa, setNamaSiswa] = useState('')
  const [nisn, setNisn] = useState('')
  const [level, setLevel] = useState('')
  const [namaWali, setNamaWali] = useState('')
  const [noHpWali, setNoHpWali] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!namaSiswa || !nisn || !level || !namaWali || !noHpWali) {
      setError('Semua field wajib diisi!')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Token tidak ditemukan, harap login terlebih dahulu.')
        setLoading(false)
        return
      }

      const payload = {
        nama_siswa: namaSiswa,
        nisn,
        level,
        nama_wali: namaWali,
        no_hp_wali: noHpWali
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/siswa-techno`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.status === 'success') {
        setSuccess('Siswa berhasil ditambahkan.')
        setTimeout(() => {
          router.push('/pendapatan/techno/siswa-techno')
        }, 1500)
      } else {
        setError(response.data.message || 'Gagal menambah siswa.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengirim data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">TAMBAH SISWA TECHNONATURA</h2>
          <p className="text-sm text-gray-500 mb-4">Lengkapi data siswa TechnoNatura berikut ini.</p>
          <hr className="border-t-2 border-blue-900 mb-5" />

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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium">Nama Siswa</label>
              <input
                type="text"
                value={namaSiswa}
                onChange={e => setNamaSiswa(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Nama Siswa"
              />
            </div>
            <div>
              <label className="text-sm font-medium">NISN</label>
              <input
                type="text"
                value={nisn}
                onChange={e => setNisn(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="NISN"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Level</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Pilih Level</option>
                <option value="I">Level I</option>
                <option value="II">Level II</option>
                <option value="III">Level III</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Nama Wali</label>
              <input
                type="text"
                value={namaWali}
                onChange={e => setNamaWali(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Nama Wali"
              />
            </div>
            <div>
              <label className="text-sm font-medium">No HP Wali</label>
              <input
                type="text"
                value={noHpWali}
                onChange={e => setNoHpWali(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="No HP Wali"
              />
            </div>
            <div className="mt-4 flex gap-4">
              <Link
                href="/pendapatan/techno/siswa-techno"
                className="flex-1 text-center bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Kembali
              </Link>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700"
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