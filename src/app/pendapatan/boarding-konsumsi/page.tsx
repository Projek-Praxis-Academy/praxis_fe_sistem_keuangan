'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Search, CreditCard, FileSignature } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Siswa {
  no: number;
  nama_siswa: string;
  tagihan_boarding: string;
  tagihan_konsumsi: string;
  id_siswa: string;
}

export default function BoardingKonsumsi() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('X');
  const [data, setData] = useState<Siswa[]>([]);
  const router = useRouter();

  useEffect(() => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://127.0.0.1:8000/api/monitoring/bk',
      headers: {
        'Authorization': 'Bearer 4|osACJZuD070U2LqNSkRqP7GhgIwv0OumsOqcXmQl35a58ada'
      }
    };

    axios.request(config)
      .then((response) => {
        if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
          const fetchedData = response.data.data.data.map((item: any, index: number) => ({
            no: index + 1,
            nama_siswa: item.nama_siswa,
            tagihan_boarding: item.tagihan_boarding || '0',
            tagihan_konsumsi: item.tagihan_konsumsi || '0',
            id_siswa: item.id_siswa,
          }));
          setData(fetchedData);
        } else {
          console.error('Data tidak dalam format yang diharapkan atau hilang:', response.data.data);
          setData([]);
        }
      })
      .catch((error) => {
        console.error('Gagal mengambil data:', error);
        setData([]);
      });
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: 'no', header: 'No' },
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
        accessorKey: 'detail',
        header: 'Detail',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa;
          return (
            <a href={`/pendapatan/boarding-konsumsi/detail?id_siswa=${id_siswa}`}>
              <FileSignature className="text-blue-500 cursor-pointer" />
            </a>
          );
        }
      },
      {
        accessorKey: 'bayar',
        header: 'Bayar',
        cell: ({ row }: any) => {
          const id_siswa = row.original.id_siswa;
          return (
            <CreditCard
              className="text-green-500 cursor-pointer"
              onClick={() => router.push(`/pendapatan/boarding-konsumsi/pembayaran-siswa?id_siswa=${id_siswa}`)}
            />
          );
        }
      }
    ],
    [router]
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Boarding & Konsumsi</h2>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <select
            className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="X">Level X</option>
            <option value="XI">Level XI</option>
            <option value="XII">Level XII</option>
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
        </div>
        <button
          className="px-3 py-1 bg-gray-300 text-black rounded-md text-sm"
          onClick={() => router.push('/pendapatan/boarding-konsumsi/tambah-siswa')}
        >
          Tambah Siswa
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-blue-900 text-white">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-2 border text-sm">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border text-sm">
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
