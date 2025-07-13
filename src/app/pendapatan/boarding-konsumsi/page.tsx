'use client';

import { useState, useEffect, useMemo, useRef, Suspense, useCallback } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Search, CreditCard, FileSignature, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

interface Siswa {
  nama_siswa: string;
  tagihan_boarding: string;
  tagihan_konsumsi: string;
  id_siswa: string;
  level: string;
}

const levelOptions = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"
];

function formatRupiah(angka: string) {
  if (!angka) return '0';
  const num = Number(angka.replace(/\D/g, ''));
  if (isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
}

// Fungsi untuk mengubah string Rupiah menjadi angka
function parseRupiah(rupiah: string): number {
  if (!rupiah || rupiah === '-') return 0;
  const cleanString = rupiah.replace('Rp ', '').replace(/\./g, '');
  return parseInt(cleanString, 10) || 0;
}

function BoardingKonsumsiInner() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLevel') || 'I'
    }
    return 'I'
  });
  const [data, setData] = useState<Siswa[]>([]);
  const [highlightNama, setHighlightNama] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [isCreatingTunggakan, setIsCreatingTunggakan] = useState(false);
  const [tunggakanSuccess, setTunggakanSuccess] = useState('');
  const [tunggakanError, setTunggakanError] = useState('');
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    localStorage.setItem('selectedLevel', selectedLevel)
  }, [selectedLevel])

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token') || '';
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring-bk/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          level: selectedLevel,
        },
      });

      if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
        const fetchedData = response.data.data.data.map((item: any) => ({
          nama_siswa: item.nama_siswa,
          tagihan_boarding: item.tagihan_boarding !== undefined && item.tagihan_boarding !== null
            ? `Rp ${formatRupiah(item.tagihan_boarding.toString())}`
            : '-',
          tagihan_konsumsi: item.tagihan_konsumsi !== undefined && item.tagihan_konsumsi !== null
            ? `Rp ${formatRupiah(item.tagihan_konsumsi.toString())}`
            : '-',
          id_siswa: item.id_siswa,
          level: item.level || '',
        }));

        const lastNama = localStorage.getItem('bk_last_nama')
        let sortedData = fetchedData
        if (lastNama) {
          const idx = fetchedData.findIndex((d: Siswa) => d.nama_siswa === lastNama)
          if (idx > -1) {
            const [item] = fetchedData.splice(idx, 1)
            sortedData = [item, ...fetchedData]
          }
        }
        setData(sortedData)
      } else {
        console.error('Data tidak dalam format yang diharapkan:', response.data.data);
        setData([]);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      setData([]);
    }
  }, [selectedLevel]);

  useEffect(() => {
    fetchData();
  }, [fetchData])

  // Fungsi untuk membuat tunggakan
  const handleCreateTunggakan = useCallback(async (siswa: Siswa) => {
    // Konfirmasi dengan pengguna
    if (!confirm(`Buat tunggakan untuk ${siswa.nama_siswa}?`)) {
      return;
    }

    setIsCreatingTunggakan(true);
    setTunggakanError('');
    setTunggakanSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTunggakanError('Token tidak ditemukan, harap login ulang');
        return;
      }

      // Siapkan data tagihan
      const tagihanItems = [];
      
      // Proses tagihan boarding
      const boardingValue = parseRupiah(siswa.tagihan_boarding);
      if (boardingValue > 0) {
        tagihanItems.push({
          nama_tagihan: 'Boarding',
          nominal: boardingValue
        });
      }

      // Proses tagihan konsumsi
      const konsumsiValue = parseRupiah(siswa.tagihan_konsumsi);
      if (konsumsiValue > 0) {
        tagihanItems.push({
          nama_tagihan: 'Konsumsi',
          nominal: konsumsiValue
        });
      }

      // Jika tidak ada tagihan
      if (tagihanItems.length === 0) {
        setTunggakanError('Tidak ada tagihan untuk dibuatkan tunggakan');
        return;
      }

      // Dapatkan tahun periode
      const currentYear = new Date().getFullYear();
      const periode = `${currentYear}/${currentYear + 1}`;

      // Siapkan data untuk dikirim
      const dataToSend = {
        id_siswa: siswa.id_siswa.toString(),
        nama_siswa: siswa.nama_siswa,
        jenis_tagihan: 'Boarding & Konsumsi',
        periode: periode,
        tagihan: tagihanItems
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tunggakan/create`,
        dataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setTunggakanSuccess(`Tunggakan berhasil dibuat untuk ${siswa.nama_siswa}!`);
        
        // Refresh data setelah beberapa detik
        setTimeout(() => {
          fetchData();
          setTunggakanSuccess('');
        }, 2000);
      } else {
        setTunggakanError(response.data.message || 'Gagal membuat tunggakan');
      }
    } catch (err: any) {
      console.error(err);
      setTunggakanError(err.response?.data?.message || 'Terjadi kesalahan saat membuat tunggakan');
    } finally {
      setIsCreatingTunggakan(false);
    }
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data
      .filter(item => item.level === selectedLevel)
      .filter(item =>
        item.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm, selectedLevel, data]);

  const columns = useMemo(
    () => [
      { accessorKey: 'nama_siswa', header: 'Nama Siswa' },
      {
        accessorKey: 'tagihan_boarding',
        header: 'Boarding',
        cell: ({ getValue }: any) => <span>{getValue()}</span>
      },
      {
        accessorKey: 'tagihan_konsumsi',
        header: 'Konsumsi',
        cell: ({ getValue }: any) => <span>{getValue()}</span>
      },
      {
        accessorKey: 'bayar',
        header: 'Bayar',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa;
          return (
            <FileSignature
              id='bayar'
              className="text-gray-600 cursor-pointer hover:text-blue-600"
              onClick={() => router.push(`/pendapatan/boarding-konsumsi/pembayaran-bk?id_siswa=${id_siswa}`)}
            />
          );
        }
      },
      {
        accessorKey: 'riwayat',
        header: 'Riwayat',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa;
          return (
            <a href={`/pendapatan/boarding-konsumsi/detail-bk?id_siswa=${id_siswa}`}>
              <CreditCard id='riwayat' className="text-gray-600 cursor-pointer hover:text-blue-600" />
            </a>
          );
        }
      },
      {
        accessorKey: 'tunggakan',
        header: 'Tunggakan',
        cell: ({ row }: any) => {
          const siswa = row.original;
          return (
            <FileSignature
              id='tunggakan'
              className={`text-gray-600 cursor-pointer hover:text-blue-600 ${
                isCreatingTunggakan ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => {
                if (!isCreatingTunggakan) handleCreateTunggakan(siswa)
              }}
            />
          );
        }
      },
      {
        accessorKey: 'aksi',
        header: 'Aksi',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa;
          return (
            <div className="flex gap-2 justify-center">
              <button
                className="bg-blue-500 p-1 rounded hover:bg-blue-600 transition"
                title="Edit"
                onClick={() => {
                  localStorage.setItem('bk_last_nama', row.original.nama_siswa);
                  setHighlightNama(row.original.nama_siswa);
                  router.push(`/pendapatan/boarding-konsumsi/edit/${row.original.id_siswa}`);
                }}
              >
                <img src="/edit.svg" alt="Edit" className="w-5 h-5" />
              </button>
            </div>
          );
        }
      }
    ],
    [router, isCreatingTunggakan, handleCreateTunggakan]
  );

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() });

  // Highlight data terbaru
  useEffect(() => {
    const lastNama = localStorage.getItem('bk_last_nama')
    if (lastNama) {
      setHighlightNama(lastNama)
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightNama(null)
        localStorage.removeItem('bk_last_nama')
      }, 3000)
    }
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [data])

  // Scroll otomatis ke atas saat highlightNama aktif
  useEffect(() => {
    if (highlightNama) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [highlightNama])

  // Success alert logic
  useEffect(() => {
    const successParam = searchParams.get('success');
    const isTambah = successParam && successParam.toLowerCase().includes('tambah');
    const isBayar = successParam && successParam.toLowerCase().includes('pembayar');

    if (isTambah || isBayar) {
      setShowAlert(true);
      const timeout = setTimeout(() => {
        setShowAlert(false);
        router.replace('/pendapatan/boarding-konsumsi');
      }, 25000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router]);

  // Edit success logic
  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam && successParam.toLowerCase().includes('edit')) {
      fetchData();
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams, fetchData]);

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Boarding & Konsumsi</h2>
      </div>

      {/* ALERT TUNGGAKAN */}
      {tunggakanSuccess && (
        <div className="text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500">
          <p className="font-medium">{tunggakanSuccess}</p>
        </div>
      )}
      {tunggakanError && (
        <div className="text-red-600 mb-4 p-3 rounded bg-red-100 border border-red-500">
          <p className="font-medium">{tunggakanError}</p>
        </div>
      )}

      {/* FILTER DAN TOMBOL */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
        >
          {levelOptions.map(level => (
            <option key={level} value={level}>
              Level {level}
            </option>
          ))}
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="px-2 py-1 pl-8 bg-gray-300 text-black rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute left-2 top-2 text-gray-700" />
        </div>

        <button
          type='button'
          className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-sm"
          onClick={() => router.push('/pendapatan/boarding-konsumsi/tambah-siswa')}
        >
          + Tambah Siswa
        </button>
      </div>

      {/* ALERT SUCCESS */}
      <Suspense fallback={null}>
        {showAlert && (
          <div className="relative text-green-600 mb-4 p-3 rounded bg-green-100 border border-green-500 flex items-center">
            <p className="font-medium flex-1">
              {searchParams.get('success')?.toLowerCase().includes('tambah')
                ? 'Data siswa berhasil ditambahkan!'
                : searchParams.get('success')?.toLowerCase().includes('pembayar')
                ? 'Pembayaran siswa berhasil dilakukan!'
                : ''}
            </p>
            <button
              onClick={() => {
                setShowAlert(false);
                router.replace('/pendapatan/boarding-konsumsi');
              }}
              className="absolute right-3 top-3 text-green-700 hover:text-green-900"
              aria-label="Tutup"
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </Suspense>

      {/* TABEL */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left text-sm text-black">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-blue-900 text-white">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-2 border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={`border transition-colors duration-500 ${
                  highlightNama && row.original.nama_siswa === highlightNama
                    ? 'bg-yellow-200'
                    : ''
                }`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BoardingKonsumsi() {
  return (
    <Suspense fallback={<div className="ml-64 p-8">Loading...</div>}>
      <BoardingKonsumsiInner />
    </Suspense>
  );
}
