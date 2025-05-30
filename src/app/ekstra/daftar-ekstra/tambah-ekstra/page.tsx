'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function TambahEkstra() {
  const [namaEkstra, setNamaEkstra] = useState('')
  const [biayaEkstra, setBiayaEkstra] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')  // Untuk pesan sukses
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const token = localStorage.getItem('token') || ''
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/ekstra/create`,
        {
          nama_ekstra: namaEkstra,
          biaya_ekstra: biayaEkstra,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // Jika berhasil, arahkan kembali ke daftar ekstra
      if (response.data.status === 'success') {
        setSuccessMessage('Kategori berhasil disimpan!')  // Menampilkan pesan sukses
        setTimeout(() => {
          router.push('/ekstra/daftar-ekstra')
          router.refresh()
        }, 1500)
      }
    } catch (error: any) {
      // Tangani error jika ada
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">TAMBAH KATEGORI</h2>
          <hr className="border-t-2 border-blue-900 mb-5" />

          {/* Alert Error */}
          {errorMessage && (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Alert Success */}
          {successMessage && (
            <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700" htmlFor="namaEkstra">
                Nama Kategori
              </label>
              <input
                id="namaEkstra"
                value={namaEkstra}
                onChange={(e) => setNamaEkstra(e.target.value)}
                className="border px-3 py-2 w-full rounded bg-gray-100"
                placeholder="Contoh: Pramuka"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700" htmlFor="biayaEkstra">
                Harga Per Semester
              </label>
              <input
                id="biayaEkstra"
                type="text"
                value={biayaEkstra}
                onChange={(e) => setBiayaEkstra(e.target.value.replace(/\D/g, ''))}
                className="border px-3 py-2 w-full rounded bg-gray-100"
                placeholder="500000"
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
