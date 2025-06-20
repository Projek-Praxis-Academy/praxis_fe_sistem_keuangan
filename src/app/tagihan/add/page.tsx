'use client'
import { useRouter } from 'next/navigation'
import { FilePlus2, X } from 'lucide-react'
import { Suspense, useState, useEffect, useRef } from 'react'
import { pdf } from '@react-pdf/renderer'
import PDFTagihan from '@/components/PDFTagihan'
import axios from 'axios'

interface Siswa {
  id_siswa: number
  nisn: string
  nama_siswa: string
  level: string
  akademik: string
}

interface InputTagihan {
  kbm: string
  spp: string
  pemeliharaan: string
  sumbangan: string
  konsumsi: string
  boarding: string
  ekstra: string
  uang_belanja: string
}

interface TotalTagihan {
  kbm: number
  spp: number
  pemeliharaan: number
  sumbangan: number
  konsumsi: number
  boarding: number
  ekstra: number
  uang_belanja: number
}

function SuccessAlertTagihan() {
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;
  const router = useRouter();
  const [show, setShow] = useState(true);

  const successParam = searchParams?.get('success');
  const isTambah = successParam && successParam.toLowerCase().includes('tambah');

  let alertMsg = '';
  if (isTambah) alertMsg = 'Tagihan siswa berhasil ditambahkan!';

  useEffect(() => {
    if (alertMsg) {
      setShow(true);
      const timeout = setTimeout(() => {
        setShow(false);
        router.replace('/tagihan');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [alertMsg, router]);

  if (!alertMsg || !show) return null;

  return (
    <div className="relative text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500 flex items-center">
      <p className="font-medium flex-1">{alertMsg}</p>
      <button
        onClick={() => {
          setShow(false);
          router.replace('/tagihan');
        }}
        className="absolute right-3 top-3 text-green-700 hover:text-green-900"
        aria-label="Tutup"
        type="button"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default function BuatTagihan() {
  // Autocomplete state
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Siswa[]>([])
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Siswa terpilih
  const [nisn, setNisn] = useState<string>('')
  const [namaSiswa, setNamaSiswa] = useState<string>('')
  const [level, setLevel] = useState<string>('')
  const [akademik, setAkademik] = useState<string>('')

  // Form tagihan
  const [semester, setSemester] = useState<string>('')
  const [periode, setPeriode] = useState<string>('')
  const [tanggal, setTanggal] = useState<string>('')
  const [jatuhTempo, setJatuhTempo] = useState<string>('')
  const [tunggakan, setTunggakan] = useState<string>('')
  const [catatan, setCatatan] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [inputTagihan, setInputTagihan] = useState<InputTagihan>({
    kbm: '',
    spp: '',
    pemeliharaan: '',
    sumbangan: '',
    konsumsi: '',
    boarding: '',
    ekstra: '',
    uang_belanja: ''
  })

  const [totalTagihan, setTotalTagihan] = useState<TotalTagihan>({
    kbm: 0,
    spp: 0,
    pemeliharaan: 0,
    sumbangan: 0,
    konsumsi: 0,
    boarding: 0,
    ekstra: 0,
    uang_belanja: 0
  })

  // Fetch autocomplete siswa
  const fetchSearchResults = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([])
      return
    }
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/cari-siswa?query=${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data.status === 'success') {
        setSearchResults(response.data.data)
        setShowDropdown(true)
      }
    } catch {
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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle select siswa dari dropdown
  const handleSelectSiswa = (siswa: Siswa) => {
    setNisn(siswa.nisn)
    setNamaSiswa(siswa.nama_siswa)
    setLevel(siswa.level)
    setAkademik(siswa.akademik)
    setSearchQuery(`${siswa.nisn} - ${siswa.nama_siswa}`)
    setShowDropdown(false)
  }

  // Fetch tagihan otomatis saat nisn valid
  useEffect(() => {
    const fetchTagihan = async () => {
      if (!nisn || nisn.length < 5) {
        setTotalTagihan({
          kbm: 0, spp: 0, pemeliharaan: 0, sumbangan: 0,
          konsumsi: 0, boarding: 0, ekstra: 0, uang_belanja: 0
        })
        return
      }
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tagihan/${nisn}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const response = await res.json()
        const data = response.data || {}
        setTotalTagihan({
          kbm: parseInt(data.tagihan_uang_kbm?.replace(/\./g, '') || '0') || 0,
          spp: parseInt(data.tagihan_uang_spp?.replace(/\./g, '') || '0') || 0,
          pemeliharaan: parseInt(data.tagihan_uang_pemeliharaan?.replace(/\./g, '') || '0') || 0,
          sumbangan: parseInt(data.tagihan_uang_sumbangan?.replace(/\./g, '') || '0') || 0,
          konsumsi: 0, boarding: 0, ekstra: 0, uang_belanja: 0
        })
      } catch {
        setTotalTagihan({
          kbm: 0, spp: 0, pemeliharaan: 0, sumbangan: 0,
          konsumsi: 0, boarding: 0, ekstra: 0, uang_belanja: 0
        })
      }
    }
    fetchTagihan()
  }, [nisn])

  const formatRupiah = (val: number | string) => 'Rp ' + (parseInt(val as string) || 0).toLocaleString('id-ID')

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!nisn) throw new Error('NISN harus diisi')

      // 1. Generate PDF sebagai Blob
      const pdfBlob = await pdf(
        <PDFTagihan
          data={{
            nisn,
            namaSiswa,
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
      const pdfFile = new File([pdfBlob], `tagihan_${nisn}_${Date.now()}.pdf`, {
        type: 'application/pdf'
      })

      // 3. Buat FormData untuk API
      const formData = new FormData()
      formData.append('nisn', nisn)
      formData.append('file_tagihan', pdfFile)

      // 4. Kirim ke API
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tagihan/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const resJson = await response.json()
      if (!response.ok) {
        throw new Error(resJson.message || 'Gagal menyimpan tagihan.')
      }

      setSuccess('Tagihan berhasil dibuat dan diunggah!')
      localStorage.setItem('selectedLevel', level)
      localStorage.setItem('tagihan_last_nama', namaSiswa) // pastikan variabel namaSiswa berisi nama siswa yang ditagihkan
      router.push('/tagihan?success=tambah')

      // 5. Download PDF otomatis
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tagihan_${namaSiswa}.pdf`
      a.click()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'Gagal membuat tagihan. Silakan coba lagi.')
      } else {
        setError('Gagal membuat tagihan. Silakan coba lagi.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderInputField = (label: string, key: keyof InputTagihan) => {
    // Ambil nilai input dan konversi ke format rupiah
    const value = inputTagihan[key];
    const formatted = value ? formatRupiah(value) : 'Rp 0';

    return (
      <div key={key}>
        <label className="text-sm font-medium">{label}</label>
        <p className="text-xs text-gray-500 mb-1">
          Total Tagihan: {formatRupiah(totalTagihan[key])}
        </p>
        <input
          type="number"
          value={value}
          onChange={(e) => setInputTagihan({ ...inputTagihan, [key]: e.target.value })}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder={`Jumlah ${label}`}
          min={0}
          step={1000}
        />
        <div className="text-xs text-blue-700 mt-1">
          {formatted}
        </div>
      </div>
    );
  }

  const tagihanPokok = [
    { label: 'KBM', key: 'kbm' as const },
    { label: 'SPP', key: 'spp' as const },
    { label: 'Pemeliharaan', key: 'pemeliharaan' as const },
    { label: 'Sumbangan', key: 'sumbangan' as const }
  ]

  const tagihanBulanan = [
    { label: 'Konsumsi', key: 'konsumsi' as const },
    { label: 'Boarding', key: 'boarding' as const },
    { label: 'Ekstrakurikuler', key: 'ekstra' as const },
    { label: 'Uang Belanja', key: 'uang_belanja' as const }
  ]

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="overflow-x-auto">
        <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-3xl mx-auto border">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-3">BUAT TAGIHAN SISWA</h2>
          <p className="text-sm text-gray-500 mb-4">Lengkapi form tagihan siswa berikut ini.</p>
          <hr className="border-t-3 border-blue-900 mb-5" />

          {/* ALERT ERROR */}
          {error && (
            <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* ALERT SUCCESS */}
          {success && (
            <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
              <p className="font-medium">{success}</p>
            </div>
          )}

          {/* ALERT SUCCESS REDIRECT */}
          <Suspense fallback={null}>
            <SuccessAlertTagihan />
          </Suspense>

          <form onSubmit={(e) => {
            e.preventDefault()
            handleGeneratePDF()
          }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Autocomplete NISN/Nama Siswa */}
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
                autoComplete="off"
              />
              {showDropdown && searchResults.length > 0 && (
                <div
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {searchResults.map((siswa) => (
                    <div
                      key={siswa.id_siswa}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectSiswa(siswa)}
                    >
                      <div className="font-medium">{siswa.nisn} - {siswa.nama_siswa}</div>
                      <div className="text-sm text-gray-500">
                        {siswa.level} - {siswa.akademik}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info siswa */}
            <div className="col-span-2">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-1">Informasi Siswa</h4>
                {nisn ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">NISN:</span> {nisn}
                    </div>
                    <div>
                      <span className="text-gray-500">Nama:</span> {namaSiswa}
                    </div>
                    <div>
                      <span className="text-gray-500">Level:</span> {level}
                    </div>
                    <div>
                      <span className="text-gray-500">Akademik:</span> {akademik}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Silakan cari dan pilih siswa</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Semester</label>
              <input
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full mt-1 border px-3 py-2 rounded"
                placeholder="Semester"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Periode</label>
              <input
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full mt-1 border px-3 py-2 rounded"
                placeholder="Periode"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tanggal Tagihan</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full mt-1 border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Jatuh Tempo</label>
              <input
                type="date"
                value={jatuhTempo}
                onChange={(e) => setJatuhTempo(e.target.value)}
                className="w-full mt-1 border px-3 py-2 rounded"
              />
            </div>

            <h3 className="col-span-2 mt-4 font-bold border-b pb-1">Tagihan Pokok</h3>
            {tagihanPokok.map(item => renderInputField(item.label, item.key))}

            <h3 className="col-span-2 mt-4 font-bold border-b pb-1">Tagihan Bulanan</h3>
            {tagihanBulanan.map(item => renderInputField(item.label, item.key))}

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
                placeholder='Masukkan catatan atau keterangan tambahan'
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