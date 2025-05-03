'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, FilePlus2 } from 'lucide-react'
import axios from 'axios'

export default function TambahSiswaEkstra() {
  const router = useRouter()

  const siswa = {
    nama: 'Aditya Wibowo',
    level: 'Level 7',
    sekolah: 'Praxis Academy',
    nisn: '097643243567',
  }

  const dummyEkstra = [
    { id: 1, nama: 'Basket' },
    { id: 2, nama: 'Futsal' },
    { id: 3, nama: 'English Club' },
    { id: 4, nama: 'Tahfidz' },
    { id: 5, nama: 'Panahan' },
  ]

  const [ekstraList, setEkstraList] = useState<string[]>([''])
  const [periode, setPeriode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddField = () => {
    setEkstraList([...ekstraList, ''])
  }

  const handleRemoveField = (index: number) => {
    const newList = [...ekstraList]
    newList.splice(index, 1)
    setEkstraList(newList)
  }

  const handleChangeEkstra = (index: number, value: string) => {
    const newList = [...ekstraList]
    newList[index] = value
    setEkstraList(newList)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const filledEkstra = ekstraList.filter((ekstra) => ekstra.trim() !== '')

    if (filledEkstra.length === 0 || !periode) {
      setError('Harap lengkapi semua field.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token') || ''

      await axios.post(
        'http://127.0.0.1:8000/api/siswa/ekstra',
        {
          nisn: siswa.nisn,
          ekstra: filledEkstra,
          periode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      alert('Data ekstrakurikuler siswa berhasil disimpan!')
      router.push('/ekstra')
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="bg-white border rounded-md shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">TAMBAH SISWA EKSTRAKURIKULER</h2>

        {/* Identitas Siswa */}
        <div className="flex flex-wrap justify-between gap-2 mb-4 text-sm">
          <span className="bg-gray-200 px-3 py-1 rounded">{siswa.nama}</span>
          <span className="bg-gray-200 px-3 py-1 rounded">{siswa.level}</span>
          <span className="bg-gray-200 px-3 py-1 rounded">{siswa.sekolah}</span>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={`NISN: ${siswa.nisn}`}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <hr className="border-t-2 border-blue-800 mb-6" />

        {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Dropdown Ekstra */}
          <label className="block mb-2 font-semibold">Ekstra yang Diikuti</label>
          <div className="space-y-3 mb-6">
            {ekstraList.map((ekstra, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={ekstra}
                  onChange={(e) => handleChangeEkstra(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Pilih Ekstra</option>
                  {dummyEkstra.map((item) => (
                    <option key={item.id} value={item.nama}>
                      {item.nama}
                    </option>
                  ))}
                </select>
                {ekstraList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Hapus field"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddField}
            className="mb-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Tambah Ekstra
          </button>

          {/* Periode */}
          <label className="block mb-2 font-semibold">Periode</label>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          >
            <option value="">Pilih Periode</option>
            <option value="2025/2026">2025/2026</option>
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
          </select>

          {/* Submit */}
          <button
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
