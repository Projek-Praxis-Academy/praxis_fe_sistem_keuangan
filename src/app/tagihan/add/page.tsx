'use client'
import { useState, useEffect, useRef } from 'react'
import { FilePlus2 } from 'lucide-react'
import axios from 'axios'
import { pdf } from '@react-pdf/renderer'
import PDFTagihan from '@/components/PDFTagihan'
import Image from 'next/image'

export default function BuatTagihan() {
  // State untuk form tagihan
  const [nisn, setNisn] = useState('')
  const [namaSiswa, setNamaSiswa] = useState('')
  const [level, setLevel] = useState('')
  const [akademik, setAkademik] = useState('')
  const [semester, setSemester] = useState('')
  const [periode, setPeriode] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [jatuhTempo, setJatuhTempo] = useState('')
  const [tunggakan, setTunggakan] = useState('')
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // State untuk autocomplete
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const [inputTagihan, setInputTagihan] = useState({
    kbm: '',
    spp: '',
    pemeliharaan: '',
    sumbangan: '',
    konsumsi: '',
    boarding: '',
    ekstra: '',
    uang_belanja: ''
  })

  const [totalTagihan, setTotalTagihan] = useState({
    kbm: 0,
    spp: 0,
    pemeliharaan: 0,
    sumbangan: 0,
    konsumsi: 0,
    boarding: 0,
    ekstra: 0,
    uang_belanja: 0
  })

  // Fetch data autocomplete
  const fetchSearchResults = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([])
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `https://fitrack-production.up.railway.app/api/cari-siswa?query=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      if (response.data.status === 'success') {
        setSearchResults(response.data.data)
        setShowDropdown(true)
      }
    } catch (error) {
      console.error('Error fetching search results:', error)
      setSearchResults([])
    }
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchResults(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle select siswa dari dropdown
  const handleSelectSiswa = (siswa) => {
    setNisn(siswa.nisn)
    setNamaSiswa(siswa.nama_siswa)
    setLevel(siswa.level)
    setAkademik(siswa.akademik)
    setSearchQuery(`${siswa.nisn}`)
    setShowDropdown(false)
    
    // Fetch data tagihan siswa
    fetchTagihanByNisn(siswa.nisn)
  }

  const fetchTagihanByNisn = async (nisn: string) => {
    if (!nisn) {
      // Reset data jika NISN kosong
      setNamaSiswa('')
      setLevel('')
      setAkademik('')
      setTotalTagihan({
        kbm: 0,
        spp: 0,
        pemeliharaan: 0,
        sumbangan: 0,
        konsumsi: 0,
        boarding: 0,
        ekstra: 0,
        uang_belanja: 0
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`https://fitrack-production.up.railway.app/api/tagihan/${nisn}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data
      setNamaSiswa(data.nama_siswa)
      setLevel(data.level)
      setAkademik(data.akademik)
      setTotalTagihan({
        kbm: parseInt(data.tagihan_uang_kbm.replace(/\./g, '')) || 0,
        spp: parseInt(data.tagihan_uang_spp.replace(/\./g, '')) || 0,
        pemeliharaan: parseInt(data.tagihan_uang_pemeliharaan.replace(/\./g, '')) || 0,
        sumbangan: parseInt(data.tagihan_uang_sumbangan.replace(/\./g, '')) || 0,
        konsumsi: parseInt(data.tagihan_konsumsi.replace(/\./g, '')) || 0,
        boarding: parseInt(data.tagihan_boarding.replace(/\./g, '')) || 0,
        ekstra: parseInt(data.tagihan_ekstra.replace(/\./g, '')) || 0,
        uang_belanja: parseInt(data.tagihan_uang_saku.replace(/\./g, '')) || 0
      })
    } catch (err) {
      console.error(err)
      setError('Gagal mengambil data tagihan. Pastikan NISN valid.')
    }
  }

  const formatRupiah = (val: number | string) => 'Rp ' + (parseInt(val as string) || 0).toLocaleString('id-ID')

  const handleGenerateAndUpload = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validasi data
      if (!nisn || !namaSiswa) {
        throw new Error('NISN dan Nama Siswa harus diisi')
      }

      // 1. Generate PDF sebagai Blob
      const pdfBlob = await pdf(
        <PDFTagihan
          data={{
            namaSiswa,
            nisn,
            level,
            akademik,
            semester,
            periode,
            tanggal,
            jatuhTempo,
            tunggakan,
            catatan,
            inputTagihan,
            totalTagihan
          }}
        />
      ).toBlob()

      // 2. Konversi Blob ke File
      const pdfFile = new File([pdfBlob], `tagihan_${namaSiswa}_${Date.now()}.pdf`, {
        type: 'application/pdf'
      })

      // 3. Buat FormData untuk API
      const formData = new FormData()
      formData.append('nisn', nisn)
      formData.append('file_tagihan', pdfFile)

      // 4. Kirim ke API
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'https://fitrack-production.up.railway.app/api/tagihan/create',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      // 5. Tampilkan pesan sukses
      setSuccess('Tagihan berhasil dibuat dan disimpan!')
      
      // 6. Download PDF otomatis
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tagihan_${namaSiswa}.pdf`
      a.click()

    } catch (error) {
      console.error('Error:', error)
      setError(error.message || 'Gagal menyimpan tagihan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderInputField = (label: string, key: keyof typeof inputTagihan) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <p className="text-xs text-gray-500 mb-1">
        Total Tagihan: {formatRupiah(totalTagihan[key])}
      </p>
      <input
        type="number"
        value={inputTagihan[key]}
        onChange={(e) => setInputTagihan({ ...inputTagihan, [key]: e.target.value })}
        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
        placeholder={`Jumlah ${label}`}
      />
    </div>
  )

  const tagihanPokok = [
    { label: 'KBM', key: 'kbm' },
    { label: 'SPP', key: 'spp' },
    { label: 'Pemeliharaan', key: 'pemeliharaan' },
    { label: 'Sumbangan', key: 'sumbangan' }
  ]

  const tagihanBulanan = [
    { label: 'Konsumsi', key: 'konsumsi' },
    { label: 'Boarding', key: 'boarding' },
    { label: 'Ekstra Kurikuler', key: 'ekstra' },
    { label: 'Uang Belanja', key: 'uang_belanja' }
  ]

  const sisaTagihan = [...tagihanPokok, ...tagihanBulanan].map(item => ({
    label: item.label,
    jumlah: totalTagihan[item.key as keyof typeof totalTagihan] - parseInt(inputTagihan[item.key as keyof typeof inputTagihan] || '0')
  }))

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-3xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">BUAT TAGIHAN SISWA</h2>
          <p className="text-sm text-gray-500 mb-4">Lengkapi form tagihan siswa berikut ini.</p>
          <hr className="border-t-3 border-blue-900 mb-5" />

          {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}
          {success && <div className="text-green-600 mb-4 font-medium">{success}</div>}

          <form onSubmit={(e) => {
            e.preventDefault()
            handleGenerateAndUpload()
          }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field NISN dengan autocomplete */}
            <div className="col-span-2 relative" ref={dropdownRef}>
              <label className="text-sm font-medium">Cari Siswa (NISN/Nama)</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value === '') {
                    setNisn('')
                    setNamaSiswa('')
                    setLevel('')
                    setAkademik('')
                  }
                }}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Masukkan NISN atau Nama Siswa"
              />
              
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((siswa) => (
                    <div
                      key={siswa.id_siswa}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectSiswa(siswa)}
                    >
                      <div className="font-medium">{siswa.nisn}</div>
                      <div className="text-sm">{siswa.nama_siswa}</div>
                      <div className="text-xs text-gray-500">
                        {siswa.level} - {siswa.akademik}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div><label>Nama Siswa</label><p className="mt-1 bg-gray-100 px-3 py-2 rounded">{namaSiswa}</p></div>
            <div><label>Level</label><p className="mt-1 bg-gray-100 px-3 py-2 rounded">{level}</p></div>
            <div><label>Akademik</label><p className="mt-1 bg-gray-100 px-3 py-2 rounded">{akademik}</p></div>
            <div><label>Semester</label><input value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" /></div>
            <div><label>Periode</label><input value={periode} onChange={(e) => setPeriode(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" /></div>
            <div><label>Tanggal Tagihan</label><input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" /></div>
            <div><label>Jatuh Tempo</label><input type="date" value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded" /></div>

            <h3 className="col-span-2 mt-4 font-bold border-b pb-1">Tagihan Pokok</h3>
            {tagihanPokok.map(item => renderInputField(item.label, item.key as keyof typeof inputTagihan))}

            <h3 className="col-span-2 mt-4 font-bold border-b pb-1">Tagihan Bulanan</h3>
            {tagihanBulanan.map(item => renderInputField(item.label, item.key as keyof typeof inputTagihan))}

            <div className="col-span-2">
              <label className="text-sm font-medium">Tunggakan Tahun Ajaran Sebelumnya</label>
              <input
                type="number"
                value={tunggakan}
                onChange={(e) => setTunggakan(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Catatan</label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
              />
            </div>

            <div className="col-span-2 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 w-full ${
                  isLoading ? 'bg-blue-400' : 'bg-green-600 hover:bg-green-700'
                } text-white font-medium px-4 py-2 rounded-md`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <FilePlus2 className="w-5 h-5" /> Simpan & Cetak Tagihan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}