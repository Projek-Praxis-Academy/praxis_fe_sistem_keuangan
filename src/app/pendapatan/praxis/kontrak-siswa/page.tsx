'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface Siswa {
  no: number
  nama_siswa: string
  nisn: string
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
  const nisn = searchParams.get('nisn') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchSiswaDetail = async () => {
      if (!nisn) return

      setLoading(true)
      setError('')

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/monitoring?nisn=${nisn}`, {
          method: 'GET',
          headers: {
            Authorization: 'Bearer 4|osACJZuD070U2LqNSkRqP7GhgIwv0OumsOqcXmQl35a58ada'
          }
        })

        const result = await response.json()

        if (!response.ok || result.status === 'error') {
          setError('Data tidak ditemukan.')
        } else {
          setSiswaDetail(result.data)
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data.')
      } finally {
        setLoading(false)
      }
    }

    fetchSiswaDetail()
  }, [nisn])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">KONTRAK SISWA</h2>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {siswaDetail && (
            <div className="space-y-4">
              {/* Header info */}
              <div className="grid grid-cols-3 gap-4">
                <input
                  value={siswaDetail.nama_siswa}
                  readOnly
                  className="border px-3 py-2 rounded bg-gray-100"
                />
                <input
                  value={`Level ${siswaDetail.level}`}
                  readOnly
                  className="border px-3 py-2 rounded bg-gray-100"
                />
                <input
                  value={siswaDetail.akademik}
                  readOnly
                  className="border px-3 py-2 rounded bg-gray-100"
                />
              </div>

              {/* NISN */}
              <input
                value={`NISN: ${siswaDetail.nisn}`}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />

              {/* Tagihan */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="KBM"
                  value={siswaDetail.tagihan_uang_kbm ?? ''}
                  readOnly
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="SPP"
                  value={siswaDetail.tagihan_uang_spp ?? ''}
                  readOnly
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="Pemeliharaan"
                  value={siswaDetail.tagihan_uang_pemeliharaan ?? ''}
                  readOnly
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="Sumbangan"
                  value={siswaDetail.tagihan_uang_sumbangan ?? ''}
                  readOnly
                  className="border px-3 py-2 rounded"
                />
              </div>

              {/* Total dan File */}
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

              {/* Button */}
              <button className="mt-6 w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition font-semibold">
                Simpan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
