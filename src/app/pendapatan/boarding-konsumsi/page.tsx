'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Search, CreditCard, FileSignature } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function BoardingKonsumsi() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedLevel') || 'I'
  }
  return 'I'
});
  const [data, setData] = useState<Siswa[]>([]);
  const router = useRouter();

  useEffect(() => {
        localStorage.setItem('selectedLevel', selectedLevel)
      }, [selectedLevel])

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitoring/bk`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            level: selectedLevel,  // Kirim level sebagai parameter
          },
        });
  
        if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
          const fetchedData = response.data.data.data.map((item: any) => ({
            nama_siswa: item.nama_siswa,
            tagihan_boarding: item.tagihan_boarding || '0',
            tagihan_konsumsi: item.tagihan_konsumsi || '0',
            id_siswa: item.id_siswa,
            level: item.level || '',
          }));
          setData(fetchedData);
        } else {
          console.error('Data tidak dalam format yang diharapkan:', response.data.data);
          setData([]);
        }
      } catch (error) {
        console.error('Gagal mengambil data:', error);
        setData([]);
      }
    };
  
    fetchData();
  }, []);  
  

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
      }
    ],
    [router]
  );

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Boarding & Konsumsi</h2>
      </div>

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
              <tr key={row.id} className="border">
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
