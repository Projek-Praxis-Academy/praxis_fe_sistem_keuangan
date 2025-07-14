'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, Eye } from 'lucide-react' // Tambahkan import Eye
import axios from 'axios'
import { useRouter, useParams } from 'next/navigation' // Perubahan 1: Tambahkan useParams

interface Siswa {
  nama_siswa: string
  nisn: string
  id_siswa: number
}

export default function Page() {
  const params = useParams() 
  const [data, setData] = useState<Siswa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token') || ''
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-techno`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const siswaArray = response.data.data?.data || []
      setData(
        siswaArray.map((item: any) => ({
          nama_siswa: item.nama_siswa,
          nisn: item.nisn,
          id_siswa: item.id_siswa
        }))
      )
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDetail = (id: number) => {
    router.push(`/pendapatan/techno/siswa-techno/detail/${id}`)
  }

  const handleEdit = (id: number) => {
    router.push(`/pendapatan/techno/siswa-techno/edit/${id}`)
  }

  const handleDelete = async (id: number) => {
    if (isDeleting) return
    if (!window.confirm('Yakin ingin menghapus siswa ini?')) return

    try {
      setIsDeleting(true)
      const token = localStorage.getItem('token') || ''
      
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/techno/siswa/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Refresh data after successful deletion
      await fetchData()
      alert('Siswa berhasil dihapus')
    } catch (error) {
      console.error('Failed to delete siswa:', error)
      alert('Gagal menghapus siswa. Silakan coba lagi.')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredData = data.filter(
    (item) =>
      item.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nisn.includes(searchTerm)
  )

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Data Siswa TechnoNatura</h2>
      </div>
      <div className="flex justify-between items-center mb-2">
        <input
          type="text"
          placeholder="Cari nama atau NISN..."
          className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm"
          onClick={() => router.push('/pendapatan/techno/siswa-techno/tambah-siswa')}
        >
          + Tambah Siswa
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left text-sm text-black">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="p-2 border">Nama Siswa</th>
              {/* Kolom baru untuk Detail */}
              <th className="p-2 border">Detail</th>
              <th className="p-2 border">Edit</th>
              <th className="p-2 border">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((siswa) => (
              <tr key={siswa.id_siswa} className="border">
                <td className="p-2 border">{siswa.nama_siswa}</td>
                
                {/* Kolom Detail dengan ikon Eye */}
                <td className="p-2 border text-center">
                  <Eye
                    className="text-green-600 cursor-pointer hover:text-green-900 inline"
                    onClick={() => handleDetail(siswa.id_siswa)}
                  />
                </td>
                
                <td className="p-2 border text-center">
                  <Pencil
                    className="text-blue-600 cursor-pointer hover:text-blue-900 inline"
                    onClick={() => handleEdit(siswa.id_siswa)}
                  />
                </td>
                <td className="p-2 border text-center">
                  <Trash2
                    className={`${isDeleting ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 cursor-pointer hover:text-red-900'} inline`}
                    onClick={() => !isDeleting && handleDelete(siswa.id_siswa)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}