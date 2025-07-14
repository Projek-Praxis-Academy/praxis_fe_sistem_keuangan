'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FilePenLine, ArrowLeft } from 'lucide-react'
import axios from 'axios'

interface SiswaDetail {
  id_siswa: string
  nama_siswa: string
  nisn: string
  level: string
  kategori: string
  akademik: string
  nama_wali: string
  no_hp_wali: string
  created_at: string
  updated_at: string
}

export default function Page() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [siswa, setSiswa] = useState<SiswaDetail | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Mengambil data siswa saat komponen dimuat
  useEffect(() => {
    const fetchSiswaData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Token tidak ditemukan, harap login terlebih dahulu.')
          setIsLoading(false)
          return
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/techno/siswa/detail/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data.status === 'success') {
          setSiswa(response.data.data)
        } else {
          setError(response.data.message || 'Gagal memuat data siswa.')
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Terjadi kesalahan saat memuat data.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSiswaData()
  }, [id])

  if (isLoading) {
    return (
      <div className="ml-64 flex-1 bg-gray-50 min-h-screen p-6 text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data siswa...</p>
        </div>
      </div>
    )
  }

  if (!siswa) {
    return (
      <div className="ml-64 flex-1 bg-gray-50 min-h-screen p-6 text-black flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800">Data tidak ditemukan</h3>
            <p className="mt-2 text-red-700">
              {error || 'Siswa dengan ID tersebut tidak ditemukan'}
            </p>
            <button
              onClick={() => router.push('/pendapatan/techno/siswa-techno')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Kembali ke Daftar Siswa
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Format tanggal untuk ditampilkan
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="ml-64 flex-1 min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl mx-auto border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center">
                <button 
                  onClick={() => router.back()} 
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-blue-900" />
                </button>
                <h1 className="text-3xl font-bold text-blue-900">Detail Siswa TechnoNatura</h1>
              </div>
              <p className="text-sm text-gray-500 mt-2 ml-10">
                Informasi lengkap siswa TechnoNatura
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FilePenLine className="w-8 h-8 text-blue-700" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-gray-200">
                Informasi Pribadi
              </h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nama Siswa
              </label>
              <div className="text-lg font-medium text-gray-900">
                {siswa.nama_siswa}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                NISN
              </label>
              <div className="text-lg font-medium text-gray-900">
                {siswa.nisn}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Level
              </label>
              <div className="text-lg font-medium text-gray-900">
                Level {siswa.level}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Kategori
              </label>
              <div className="text-lg font-medium text-gray-900">
                {siswa.kategori}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Program Akademik
              </label>
              <div className="text-lg font-medium text-gray-900">
                {siswa.akademik}
              </div>
            </div>

            <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-gray-200">
                Informasi Wali
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nama Wali
              </label>
              <div className="text-lg font-medium text-gray-900">
                {siswa.nama_wali}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                No HP Wali
              </label>
              <div className="text-lg font-medium text-gray-900">
                {siswa.no_hp_wali}
              </div>
            </div>

            <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-gray-200">
                Informasi Sistem
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Dibuat Pada
              </label>
              <div className="text-md font-medium text-gray-900">
                {formatDate(siswa.created_at)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Diperbarui Pada
              </label>
              <div className="text-md font-medium text-gray-900">
                {formatDate(siswa.updated_at)}
              </div>
            </div>

            <div className="md:col-span-2 mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/pendapatan/techno/siswa-techno')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => router.push(`/pendapatan/techno/siswa-techno/edit/${id}`)}
                className="px-6 py-3 rounded-lg font-medium flex items-center bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <FilePenLine className="w-5 h-5 mr-2" />
                Edit Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}