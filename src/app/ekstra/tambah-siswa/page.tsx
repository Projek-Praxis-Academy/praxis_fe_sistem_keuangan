'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2 } from 'lucide-react'
import axios from 'axios'

export default function TambahSiswaEkstra() {
  const router = useRouter()

  const [ekstraList, setEkstraList] = useState<any[]>([])
  const [selectedEkstra, setSelectedEkstra] = useState<any[]>([])
  const [nisn, setNisn] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEkstraList = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ekstra/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setEkstraList(response.data.data)
      } catch (err) {
        console.error('Error fetching ekstra list', err)
        setError('Terjadi kesalahan saat memuat data ekstra.')
      }
    }
    fetchEkstraList()
  }, [])

  const handleAddEkstra = () => {
    setSelectedEkstra((prev) => [...prev, ''])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nisn || selectedEkstra.length === 0 || !tanggalMulai || !tanggalSelesai) {
      setError('Harap lengkapi semua field.')
      return
    }

    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token') || ''
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-ekstra/create-siswa`,
        {
          nisn,
          id_ekstra: selectedEkstra,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai,
          catatan,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.status === 'success') {
        setSuccessMessage('Data ekstra siswa berhasil disimpan!')
        setTimeout(() => {
          router.push('/ekstra')
          router.refresh()
        }, 1500)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="bg-white border rounded-md shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">TAMBAH SISWA EKSTRAKURIKULER</h2>

        {/* Alert Error */}
        {error && (
          <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Alert Success */}
        {successMessage && (
          <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* NISN Input */}
          <div className="mb-4">
            <input
              id='nisn'
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="Masukkan NISN"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <hr className="border-t-2 border-blue-800 mb-6" />

          {/* Ekstra Selection */}
          <label className="block mb-2 font-semibold">Ekstra yang Diikuti</label>
          <div className="space-y-3 mb-6">
            {selectedEkstra.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  id={`ekstra-${index}`}
                  value={item}
                  onChange={(e) => {
                    const newSelectedEkstra = [...selectedEkstra]
                    newSelectedEkstra[index] = e.target.value
                    setSelectedEkstra(newSelectedEkstra)
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Pilih Ekstra</option>
                  {ekstraList.map((ekstra) => (
                    <option key={ekstra.id_ekstra} value={ekstra.id_ekstra}>
                      {ekstra.nama_ekstra}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddEkstra}
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mb-6"
          >
            + Tambah Ekstra
          </button>

          {/* Tanggal Mulai */}
          <label className="block mb-2 font-semibold">Tanggal Mulai</label>
          <input
            id='tanggalMulai'
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          />

          {/* Tanggal Selesai */}
          <label className="block mb-2 font-semibold">Tanggal Selesai</label>
          <input
            id='tanggalSelesai'
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          />

          {/* Catatan */}
          <label className="block mb-2 font-semibold">Catatan</label>
          <textarea
            id='catatan'
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
            placeholder="Masukkan catatan (opsional)"
          />

          {/* Submit */}
          <button
            id='submit-tambah-siswa-ekstra'
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 flex justify-center items-center gap-2"
          >
            <FilePlus2 size={18} />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  )
}
