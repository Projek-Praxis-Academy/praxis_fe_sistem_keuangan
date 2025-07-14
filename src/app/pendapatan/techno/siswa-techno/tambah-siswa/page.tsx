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
  const [kategori, setKategori] = useState('Reguler')
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

    // Validasi NISN minimal 10 karakter
    if (nisn.length < 10) {
      setError('NISN harus minimal 10 karakter')
      return
    }

    // Validasi nomor HP minimal 10 karakter
    if (noHpWali.length < 10) {
      setError('Nomor HP wali harus minimal 10 karakter')
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
        nisn,
        nama_siswa: namaSiswa,
        level,
        kategori,
        nama_wali: namaWali,
        no_hp_wali: noHpWali
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/techno/siswa/create`,
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
      if (err.response?.data?.error) {
        setError(err.response.data.message || 'Terjadi kesalahan saat mengirim data.')
      } else {
        setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-gray-50 min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl mx-auto border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Tambah Siswa TechnoNatura</h1>
              <p className="text-sm text-gray-500 mt-2">
                Lengkapi data siswa TechnoNatura berikut ini dengan benar.
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FilePlus2 className="w-8 h-8 text-blue-700" />
            </div>
          </div>
          
          <div className="border-t-2 border-blue-200 mb-6"></div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={namaSiswa}
                onChange={e => setNamaSiswa(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama lengkap siswa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NISN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nisn}
                onChange={e => setNisn(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan NISN siswa"
                maxLength={10}
              />
              <p className="mt-1 text-xs text-gray-500">Minimal 10 karakter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Level</option>
                <option value="I">Level I</option>
                <option value="II">Level II</option>
                <option value="III">Level III</option>
                <option value="IV">Level IV</option>
                <option value="V">Level V</option>
                <option value="VI">Level VI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Reguler">Reguler</option>
                <option value="Beasiswa">Beasiswa</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Wali <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={namaWali}
                onChange={e => setNamaWali(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama wali siswa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No HP Wali <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={noHpWali}
                onChange={e => setNoHpWali(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nomor HP wali"
              />
              <p className="mt-1 text-xs text-gray-500">Minimal 10 karakter</p>
            </div>

            <div className="md:col-span-2 mt-6 flex justify-end space-x-4">
              <Link
                href="/pendapatan/techno/siswa-techno"
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Kembali
              </Link>
              <button
                type="submit"
                className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FilePlus2 className="w-5 h-5 mr-2" />
                    Simpan Siswa
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}