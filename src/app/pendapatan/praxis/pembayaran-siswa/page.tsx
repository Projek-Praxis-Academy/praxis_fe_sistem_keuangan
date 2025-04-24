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

export default function PembayaranSiswa() {
  const searchParams = useSearchParams()
  const id_siswa = searchParams.get('id_siswa') || ''

  const [siswaDetail, setSiswaDetail] = useState<Siswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [kbm, setKbm] = useState<number | string>('') // Gunakan state untuk input nominal
  const [spp, setSpp] = useState<number | string>('') 
  const [pemeliharaan, setPemeliharaan] = useState<number | string>('') 
  const [sumbangan, setSumbangan] = useState<number | string>('') 
  const [catatan, setCatatan] = useState<string>('')

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
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data.')
      } finally {
        setLoading(false)
      }
    }

    fetchSiswaDetail()
  }, [id_siswa])

  const handleSubmit = async () => {
    const payload = {
      id_siswa: siswaDetail?.id_siswa,
      tanggal_pembayaran: new Date().toISOString().split('T')[0],
      uang_kbm: kbm !== '' ? Number(kbm) : null,
      uang_spp: spp !== '' ? Number(spp) : null,
      uang_pemeliharaan: pemeliharaan !== '' ? Number(pemeliharaan) : null,
      uang_sumbangan: sumbangan !== '' ? Number(sumbangan) : null,
      catatan,
    }

    const response = await fetch('http://127.0.0.1:8000/api/pembayaran', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer 4|osACJZuD070U2LqNSkRqP7GhgIwv0OumsOqcXmQl35a58ada'
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    if (response.ok) {
      alert(result.message || 'Pembayaran berhasil.')
    } else {
      alert(result.message || 'Gagal menyimpan pembayaran.')
    }
  }

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 min-w-[700px] w-full max-w-2xl border mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">PEMBAYARAN</h2>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {siswaDetail && (
            <div className="space-y-4">
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

              <input
                value={`NISN: ${siswaDetail.nisn}`}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="KBM"
                  value={kbm}
                  onChange={(e) => setKbm(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="SPP"
                  value={spp}
                  onChange={(e) => setSpp(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="Pemeliharaan"
                  value={pemeliharaan}
                  onChange={(e) => setPemeliharaan(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <input
                  placeholder="Sumbangan"
                  value={sumbangan}
                  onChange={(e) => setSumbangan(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Catatan</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
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
