'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus2, Plus } from 'lucide-react'
import axios from 'axios'

export default function TambahPengeluaran() {
  const router = useRouter()
  const [kategoriList, setKategoriList] = useState<{ id_kategori_pengeluaran: string; nama_kategori_pengeluaran: string }[]>([])
  const [jenisPengeluaran, setJenisPengeluaran] = useState('')
  const [namaPengeluaran, setNamaPengeluaran] = useState('')
  const [subPengeluaran, setSubPengeluaran] = useState([
    {
      id_kategori_pengeluaran: '',
      nama_sub_pengeluaran: '',
      nominal: '',
      jumlah_item: '',
      tanggal_pengeluaran: '',
      file_nota: null as File | null
    }
  ])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch kategori based on jenis pengeluaran
  useEffect(() => {
     if (jenisPengeluaran) {
       const fetchKategori = async () => {
         try {
           const token = localStorage.getItem('token') || ''  // Mendapatkan token atau default ke string kosong
           const response = await axios.get(
             `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/kategori-pengeluaran?type=${jenisPengeluaran}`,
             {
               headers: {
                 Authorization: `Bearer ${token}`,
               },
             }
           )
           setKategoriList(response.data)
         } catch (err) {
           console.error(err)
           setError('Gagal memuat kategori.')
         }
       }
   
       fetchKategori()
     }
   }, [jenisPengeluaran])
   
   

  const handleAddSub = () => {
    setSubPengeluaran([
      ...subPengeluaran,
      {
        id_kategori_pengeluaran: '',
        nama_sub_pengeluaran: '',
        nominal: '',
        jumlah_item: '',
        tanggal_pengeluaran: '',
        file_nota: null
      }
    ])
  }

  const handleSubChange = (index: number, field: string, value: any) => {
    const newSubs = [...subPengeluaran]
    // @ts-ignore
    newSubs[index][field] = value
    setSubPengeluaran(newSubs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jenisPengeluaran || !namaPengeluaran) {
      setError('Jenis dan Nama Pengeluaran wajib diisi.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('jenis_pengeluaran', jenisPengeluaran)
      formData.append('nama_pengeluaran', namaPengeluaran)

      subPengeluaran.forEach((sub, index) => {
        formData.append(`sub_pengeluaran[${index}][id_kategori_pengeluaran]`, sub.id_kategori_pengeluaran)
        formData.append(`sub_pengeluaran[${index}][nama_sub_pengeluaran]`, sub.nama_sub_pengeluaran)
        formData.append(`sub_pengeluaran[${index}][nominal]`, sub.nominal)
        formData.append(`sub_pengeluaran[${index}][jumlah_item]`, sub.jumlah_item)
        formData.append(`sub_pengeluaran[${index}][tanggal_pengeluaran]`, sub.tanggal_pengeluaran)
        if (sub.file_nota) {
          formData.append(`sub_pengeluaran[${index}][file_nota]`, sub.file_nota)
        }
      })

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Token tidak ditemukan, harap login terlebih dahulu.')
        setLoading(false)
        return
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/create`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      setSuccess('Pengeluaran berhasil ditambahkan!')
      router.push('/pengeluaran')
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat mengirim data.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-3xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-5">TAMBAH PENGELUARAN</h2>
          <hr className="border-t-3 border-blue-900 mb-8" />

          {/* Alert Error */}
          {error && (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Alert Success */}
          {success && (
            <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
              <p className="font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium">Jenis Pengeluaran</label>
              <select
                id='jenis_pengeluaran'
                value={jenisPengeluaran}
                onChange={(e) => setJenisPengeluaran(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Pilih jenis</option>
                <option value="Project">Project</option>
                <option value="Non project">Non project</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Nama Pengeluaran</label>
              <input
                id='nama_pengeluaran'
                type="text"
                value={namaPengeluaran}
                onChange={(e) => setNamaPengeluaran(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Masukkan nama pengeluaran"
              />
            </div>

            {subPengeluaran.map((sub, index) => (
              <div key={index} className="border rounded-md p-4 space-y-2 bg-gray-50">
                <h4 className="font-semibold text-sm text-gray-700">Sub Pengeluaran {index + 1}</h4>
                <select
                  id={`kategori_pengeluaran_${index}`}
                  value={sub.id_kategori_pengeluaran}
                  onChange={(e) => handleSubChange(index, 'id_kategori_pengeluaran', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Pilih Kategori</option>
                  {kategoriList.map((kategori) => (
                    <option key={kategori.id_kategori_pengeluaran} value={kategori.id_kategori_pengeluaran}>
                      {kategori.nama_kategori_pengeluaran}
                    </option>
                  ))}
                </select>
                <input
                  id={`nama_sub_pengeluaran_${index}`}
                  type="text"
                  placeholder="Nama Sub Pengeluaran"
                  className="w-full border rounded px-2 py-1"
                  value={sub.nama_sub_pengeluaran}
                  onChange={(e) => handleSubChange(index, 'nama_sub_pengeluaran', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal</label>
                      <div className="flex items-center border rounded px-2 bg-white">
                          <span className="text-gray-500 text-sm mr-1">Rp</span>
                            <input
                              id={`nominal_${index}`}
                              type="number"
                              placeholder="Nominal"
                              className="w-full rounded px-2 py-1"
                              value={sub.nominal}
                              onChange={(e) => handleSubChange(index, 'nominal', e.target.value)}
                            />
                      </div>
                </div>
                <input
                  id={`jumlah_item_${index}`}
                  type="number"
                  placeholder="Jumlah Item"
                  className="w-full border rounded px-2 py-1"
                  value={sub.jumlah_item}
                  onChange={(e) => handleSubChange(index, 'jumlah_item', e.target.value)}
                />
                <input
                  id={`tanggal_pengeluaran_${index}`}
                  type="date"
                  className="w-full border rounded px-2 py-1"
                  value={sub.tanggal_pengeluaran}
                  onChange={(e) => handleSubChange(index, 'tanggal_pengeluaran', e.target.value)}
                />
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Bukti Nota
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      * Maksimal ukuran 10 MB, hanya format PDF, JPG, JPEG, PNG
                    </p>
                        <div className="flex items-center gap-4">
                          {/* Tombol Upload */}
                          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-700">
                            Pilih File
                            <input
                              id={`file_nota_${index}`}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => handleSubChange(index, 'file_nota', e.target.files?.[0] || null)}
                            />
                          </label>
                          {/* Nama File */}
                          {sub.file_nota && (
                            <span className="text-sm text-gray-700">
                              {sub.file_nota.name}
                            </span>
                          )}
                        </div>
                  </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddSub}
              className="flex items-center w-60 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Plus size={16} />
              Tambah Sub Pengeluaran
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              <FilePlus2 className="w-5 h-5" />
              {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
