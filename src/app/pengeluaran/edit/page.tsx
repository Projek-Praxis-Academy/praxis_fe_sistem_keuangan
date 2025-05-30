'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Pencil, Save, Plus } from 'lucide-react'

interface Kategori {
  id_kategori_pengeluaran: string
  nama_kategori_pengeluaran: string
  id_jenis_pengeluaran: string
}

interface SubPengeluaran {
  id_sub_pengeluaran: string
  nama_sub_pengeluaran: string
  nominal: number
  jumlah_item: number
  file_nota: string | null
  tanggal_pengeluaran: string
  id_kategori_pengeluaran: string
}

interface PengeluaranDetail {
  id_pengeluaran: string
  nama_pengeluaran: string
  id_jenis_pengeluaran: string
  jenis_pengeluaran: {
    id_jenis_pengeluaran: string
    nama_jenis_pengeluaran: string
  }
  sub_pengeluaran: SubPengeluaran[]
}

function EditPengeluaranInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idPengeluaran = searchParams.get('id_sub_pengeluaran') || ''
  const [pengeluaranDetail, setPengeluaranDetail] = useState<PengeluaranDetail | null>(null)
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editedRow, setEditedRow] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<any>({})

  // Fetch detail pengeluaran dan kategori sesuai jenis pengeluaran utama
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token') || ''
        const headers = { Authorization: `Bearer ${token}` }

        // Get detail pengeluaran
        const response = await axios.get<PengeluaranDetail>(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/detail/${idPengeluaran}`,
          { headers }
        )
        setPengeluaranDetail(response.data)

        // Fetch kategori sesuai id_jenis_pengeluaran utama
        const jenisPengeluaranId = response.data.id_jenis_pengeluaran
        setLoadingCategories(true)
        const kategoriRes = await axios.get<Kategori[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/kategori-pengeluaran?type=${jenisPengeluaranId}`,
          { headers }
        )
        setKategoriList(kategoriRes.data)
      } catch (err) {
        setError('Gagal memuat data pengeluaran atau kategori')
      } finally {
        setLoading(false)
        setLoadingCategories(false)
      }
    }

    if (idPengeluaran) fetchData()
  }, [idPengeluaran])

  const handleEditClick = (sub: SubPengeluaran) => {
    setEditedRow(sub.id_sub_pengeluaran)
    setEditingData({ ...sub, id_kategori_pengeluaran: sub.id_kategori_pengeluaran || '' })
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

      formData.append("id_kategori_pengeluaran", editingData.id_kategori_pengeluaran || '')
      formData.append("nama_sub_pengeluaran", editingData.nama_sub_pengeluaran || '')
      formData.append("nominal", String(editingData.nominal || ''))
      formData.append("jumlah_item", String(editingData.jumlah_item || ''))
      formData.append("tanggal_pengeluaran", editingData.tanggal_pengeluaran || '')

      if (editingData.file_nota instanceof File) {
        formData.append("file_nota", editingData.file_nota)
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/sub-pengeluaran/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      // Refresh data
      const res = await axios.get<PengeluaranDetail>(
        `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/detail/${idPengeluaran}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPengeluaranDetail(res.data)

      setSuccess('Sub pengeluaran berhasil diperbarui!')
      setEditedRow(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengupdate.')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredKategoriList = () => {
    if (!pengeluaranDetail) return []
    return kategoriList.filter(
      k => k.id_jenis_pengeluaran === pengeluaranDetail.id_jenis_pengeluaran
    )
  }

  if (loading) return <div className="ml-64 p-6">Memuat data pengeluaran...</div>
  if (!pengeluaranDetail) return <div className="ml-64 p-6">Data tidak ditemukan</div>

  return (
    <div className="ml-64 p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
        EDIT PENGELUARAN - {pengeluaranDetail.jenis_pengeluaran.nama_jenis_pengeluaran}
      </h2>

      <div className="bg-gray-100 p-4 rounded-md mb-6 shadow">
        <p className="font-medium">Nama Pengeluaran: {pengeluaranDetail.nama_pengeluaran}</p>
      </div>

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

      <h3 className="text-xl font-semibold mb-4">Sub Pengeluaran</h3>
      <div className="space-y-4">
        {pengeluaranDetail.sub_pengeluaran.map((sub) => (
          <div key={sub.id_sub_pengeluaran} className="border rounded-lg p-4 bg-gray-50">
            {editedRow === sub.id_sub_pengeluaran ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  {loadingCategories ? (
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      Memuat kategori...
                    </div>
                  ) : (
                    <select
                      value={editingData.id_kategori_pengeluaran}
                      onChange={(e) => handleChange('id_kategori_pengeluaran', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Pilih Kategori</option>
                      {getFilteredKategoriList().map((kategori) => (
                        <option key={kategori.id_kategori_pengeluaran} value={kategori.id_kategori_pengeluaran}>
                          {kategori.nama_kategori_pengeluaran}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nama Sub Pengeluaran</label>
                  <input
                    type="text"
                    value={editingData.nama_sub_pengeluaran}
                    onChange={(e) => handleChange('nama_sub_pengeluaran', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nominal</label>
                    <div className="flex items-center border rounded px-2 bg-white">
                      <span className="text-gray-500 text-sm mr-1">Rp</span>
                      <input
                        type="number"
                        value={editingData.nominal}
                        onChange={(e) => handleChange('nominal', e.target.value)}
                        className="w-full px-3 py-2 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Jumlah Item</label>
                    <input
                      type="number"
                      value={editingData.jumlah_item}
                      onChange={(e) => handleChange('jumlah_item', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Pengeluaran</label>
                  <input
                    type="date"
                    value={editingData.tanggal_pengeluaran}
                    onChange={(e) => handleChange('tanggal_pengeluaran', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bukti Nota (Opsional)</label>
                  <input
                    type="file"
                    onChange={(e) => handleChange('file_nota', e.target.files?.[0] || null)}
                    className="w-full"
                  />
                  {sub.file_nota && (
                    <p className="text-xs text-gray-500 mt-1">
                      File saat ini: {sub.file_nota}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditedRow(null)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(sub.id_sub_pengeluaran)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Kategori</p>
                  <p>
                    {kategoriList.find(k => k.id_kategori_pengeluaran === sub.id_kategori_pengeluaran)?.nama_kategori_pengeluaran || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Nama</p>
                  <p>{sub.nama_sub_pengeluaran}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Nominal</p>
                  <p>Rp{sub.nominal.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Jumlah Item</p>
                  <p>{sub.jumlah_item}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tanggal</p>
                  <p>
                    {new Date(sub.tanggal_pengeluaran).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Bukti Nota</p>
                  <p>{sub.file_nota ? 'Tersedia' : 'Tidak ada'}</p>
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={() => handleEditClick(sub)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EditPengeluaran() {
  return (
    <Suspense fallback={<div className="ml-64 p-6">Memuat...</div>}>
      <EditPengeluaranInner />
    </Suspense>
  )
}