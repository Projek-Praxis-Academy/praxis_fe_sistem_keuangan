'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface Siswa {
  no: number
  nama_siswa: string
  id_siswa: string
  nisn: string
  level: string
  akademik: string
  tagihan_uang_kbm: number | null
  tagihan_uang_spp: number | null
  tagihan_uang_pemeliharaan: number | null
  tagihan_uang_sumbangan: number | null
}

export default function KontrakSiswa() {
  const searchParams = useSearchParams()
  const id_siswa = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)

  // State untuk menangani perubahan input
  const [updatedSiswaDetail, setUpdatedSiswaDetail] = useState<Siswa | null>(null)

  useEffect(() => {
    const fetchSiswaDetail = async () => {
      if (!id_siswa) return

      setLoading(true)
      setError('')

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/monitoring?id_siswa=${id_siswa}`, {
          method: 'GET',
          headers: {
            Authorization: 'Bearer 4|osACJZuD070U2LqNSkRqP7GhgIwv0OumsOqcXmQl35a58ada'
          }
        })

        const result = await response.json()

        if (!response.ok) {
          setError('Data tidak ditemukan.')
        } else {
          setSiswaDetail(result)
          setUpdatedSiswaDetail(result) // Menyimpan salinan data untuk editing
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data.')
      } finally {
        setLoading(false)
      }
    }

    fetchSiswaDetail()
  }, [id_siswa])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFile = e.target.files?.[0]
     if (selectedFile && selectedFile.type !== 'application/pdf') {
       alert('Hanya file PDF yang diperbolehkan.')
       setFile(null)
     } else {
       setFile(selectedFile)
     }
   }
   

  // Fungsi untuk menangani perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Siswa) => {
    if (updatedSiswaDetail) {
      setUpdatedSiswaDetail({
        ...updatedSiswaDetail,
        [field]: e.target.value ? parseInt(e.target.value) : null
      })
    }
  }

  const handleSubmit = async () => {
    if (!updatedSiswaDetail || !file) return

    const formData = new FormData()
    formData.append('id_siswa', updatedSiswaDetail.id_siswa)
    formData.append('uang_kbm', String(updatedSiswaDetail.tagihan_uang_kbm ?? 0))
    formData.append('uang_spp', String(updatedSiswaDetail.tagihan_uang_spp ?? 0))
    formData.append('uang_pemeliharaan', String(updatedSiswaDetail.tagihan_uang_pemeliharaan ?? 0))
    formData.append('uang_sumbangan', String(updatedSiswaDetail.tagihan_uang_sumbangan ?? 0))
    formData.append('catatan', '')
    formData.append('file_kontrak', file)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/kontrak', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 4|osACJZuD070U2LqNSkRqP7GhgIwv0OumsOqcXmQl35a58ada',
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || 'Gagal membuat kontrak siswa.')
      } else {
        alert('Kontrak berhasil disimpan!')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data.')
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">KONTRAK SISWA</h2>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {updatedSiswaDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <input
                  value={updatedSiswaDetail.nama_siswa}
                  readOnly
                  className="w-70 border px-3 py-2 rounded bg-gray-100 text-center"
                />
                <input
                  value={`Level ${updatedSiswaDetail.level}`}
                  readOnly
                  className="ml-20 w-30 border px-3 py-2 rounded bg-gray-100 text-center"
                />
                <input
                  value={updatedSiswaDetail.akademik}
                  readOnly
                  className="w-30 border px-3 py-2 rounded bg-gray-100 text-center"
                />
              </div>

              <input
                value={`NISN: ${updatedSiswaDetail.nisn}`}
                readOnly
                className="text-center w-100 border px-3 py-2 rounded bg-gray-100"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black font-bold mb-1">KBM</label>
                  <input
                    type="number"
                    value={updatedSiswaDetail.tagihan_uang_kbm ?? ''}
                    onChange={(e) => handleInputChange(e, 'tagihan_uang_kbm')}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black font-bold mb-1">SPP</label>
                  <input
                    type="number"
                    value={updatedSiswaDetail.tagihan_uang_spp ?? ''}
                    onChange={(e) => handleInputChange(e, 'tagihan_uang_spp')}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black font-bold mb-1">Pemeliharaan</label>
                  <input
                    type="number"
                    value={updatedSiswaDetail.tagihan_uang_pemeliharaan ?? ''}
                    onChange={(e) => handleInputChange(e, 'tagihan_uang_pemeliharaan')}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black font-bold mb-1">Sumbangan</label>
                  <input
                    type="number"
                    value={updatedSiswaDetail.tagihan_uang_sumbangan ?? ''}
                    onChange={(e) => handleInputChange(e, 'tagihan_uang_sumbangan')}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-start">
                <input placeholder="Total" className="border px-3 py-2 rounded" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">File PDF Kontrak</label>
                  <p className="text-xs text-gray-500">* Maksimal ukuran 10 MB, hanya format PDF</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full text-sm border rounded px-3 py-2 cursor-pointer file:py-1 file:px-3 file:bg-blue-50 file:text-blue-700 file:rounded file:border-0 hover:file:bg-blue-100"
                  />
                  {file && <p className="text-sm mt-1 text-gray-600">{file.name}</p>}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="mt-6 w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition font-semibold"
              >
                Simpan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
