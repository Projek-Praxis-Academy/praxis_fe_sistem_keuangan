'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Pencil, Save } from 'lucide-react'

export default function EditPengeluaran() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idPengeluaran = searchParams.get('id') // Ambil ID dari URL

  const [subPengeluaran, setSubPengeluaran] = useState<any[]>([])
  const [kategoriList, setKategoriList] = useState<any[]>([])
  const [editedRow, setEditedRow] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<any>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || ''
        const headers = { Authorization: `Bearer ${token}` }

        // Get detail pengeluaran
        const res = await axios.get(`https://fitrack-production.up.railway.app/api/monitoring-pengeluaran/update/${idPengeluaran}`, { headers })
        setSubPengeluaran(res.data.sub_pengeluaran || [])

        // Get kategori pengeluaran
        const kategoriRes = await axios.get('https://fitrack-production.up.railway.app/api/kategori-pengeluaran', { headers })
        setKategoriList(kategoriRes.data.data || [])
      } catch (err) {
        console.error('Gagal fetch data', err)
      }
    }

    if (idPengeluaran) fetchData()
  }, [idPengeluaran])

  const handleEditClick = (sub: any) => {
    setEditedRow(sub.id_sub_pengeluaran)
    setEditingData({ ...sub })
  }

  const handleChange = (field: string, value: any) => {
    setEditingData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async (id: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || ''
      const formData = new FormData()
      console.log('Mau update sub ID:', id)

      formData.append("id_kategori_pengeluaran", editingData.id_kategori_pengeluaran || '')
      formData.append("nama_sub_pengeluaran", editingData.nama_sub_pengeluaran || '')
      formData.append("nominal", String(editingData.nominal || ''))
      formData.append("jumlah_item", String(editingData.jumlah_item || ''))
      formData.append("tanggal_pengeluaran", editingData.tanggal_pengeluaran || '')

      if (editingData.file_nota instanceof File) {
        formData.append("file_nota", editingData.file_nota)
      }

      await axios.post(`https://fitrack-production.up.railway.app/api/monitoring-pengeluaran/sub-pengeluaran/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Sub pengeluaran berhasil diperbarui!')
      setEditedRow(null)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengupdate.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">EDIT SUB PENGELUARAN</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="space-y-6 max-w-4xl mx-auto">
        {subPengeluaran.map((sub, index) => (
          <div key={sub.id_sub_pengeluaran} className="border rounded p-4 bg-gray-50">
            {editedRow === sub.id_sub_pengeluaran ? (
              <>
                <select
                  value={editingData.id_kategori_pengeluaran}
                  onChange={(e) => handleChange('id_kategori_pengeluaran', e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-2"
                >
                  <option value="">Pilih Kategori</option>
                  {kategoriList.map((kategori) => (
                    <option key={kategori.id_kategori_pengeluaran} value={kategori.id_kategori_pengeluaran}>
                      {kategori.nama_kategori_pengeluaran}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editingData.nama_sub_pengeluaran}
                  onChange={(e) => handleChange('nama_sub_pengeluaran', e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-2"
                  placeholder="Nama Sub Pengeluaran"
                />
                <input
                  type="number"
                  value={editingData.nominal}
                  onChange={(e) => handleChange('nominal', e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-2"
                  placeholder="Nominal"
                />
                <input
                  type="number"
                  value={editingData.jumlah_item}
                  onChange={(e) => handleChange('jumlah_item', e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-2"
                  placeholder="Jumlah Item"
                />
                <input
                  type="date"
                  value={editingData.tanggal_pengeluaran}
                  onChange={(e) => handleChange('tanggal_pengeluaran', e.target.value)}
                  className="w-full border rounded px-2 py-1 mb-2"
                />
                <input
                  type="file"
                  onChange={(e) => handleChange('file_nota', e.target.files?.[0] || null)}
                  className="w-full"
                />
                <button
                  className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center gap-2"
                  onClick={() => handleSave(sub.id_sub_pengeluaran)}
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </>
            ) : (
              <>
                <p><strong>Kategori:</strong> {kategoriList.find(k => k.id_kategori_pengeluaran === sub.id_kategori_pengeluaran)?.nama_kategori_pengeluaran || '-'}</p>
                <p><strong>Nama:</strong> {sub.nama_sub_pengeluaran}</p>
                <p><strong>Nominal:</strong> Rp{Number(sub.nominal).toLocaleString()}</p>
                <p><strong>Jumlah Item:</strong> {sub.jumlah_item}</p>
                <p><strong>Tanggal:</strong> {sub.tanggal_pengeluaran}</p>
                <button
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 flex items-center gap-2"
                  onClick={() => handleEditClick(sub)}
                >
                  <Pencil size={16} />
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
