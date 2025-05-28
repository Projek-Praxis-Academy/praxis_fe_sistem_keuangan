'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function TambahKategoriPengeluaran() {
  const [jenisPengeluaran, setJenisPengeluaran] = useState<'Project' | 'Non project'>('Non project')
  const [namaKategori, setNamaKategori] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const token = localStorage.getItem('token') || ''
      const response = await axios.post(
        'https://fitrack-production.up.railway.app/api/monitoring-pengeluaran/kategori-pengeluaran/create',
        {
          jenis_pengeluaran: jenisPengeluaran,
          nama_kategori_pengeluaran: namaKategori,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.status === 'success') {
        setSuccessMessage('Kategori pengeluaran berhasil disimpan!')
        setTimeout(() => {
          router.push('/pengeluaran/kategori') // sesuaikan path jika berbeda
          router.refresh()
        }, 1500)
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">TAMBAH KATEGORI PENGELUARAN</h2>
          <hr className="border-t-2 border-blue-900 mb-5" />

          {errorMessage && (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Pengeluaran</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${
                    jenisPengeluaran === 'Project' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-black'
                  }`}
                  onClick={() => setJenisPengeluaran('Project')}
                >
                  Project
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${
                    jenisPengeluaran === 'Non project' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-black'
                  }`}
                  onClick={() => setJenisPengeluaran('Non project')}
                >
                  Non Project
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="namaKategori" className="block text-sm font-medium text-gray-700">
                Nama Kategori Pengeluaran
              </label>
              <input
                id="namaKategori"
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                className="border px-3 py-2 w-full rounded bg-gray-100"
                placeholder="Contoh: Lomba LN"
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className={`w-100 max-w-xs bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition font-semibold ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Sedang Menyimpan...' : 'Simpan Kategori'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
