'use client';

import { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Search, FileText } from 'lucide-react';

export default function PengeluaranTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data Pengeluaran
  const data = useMemo(
    () => [
      { kategori: 'Tambahan', nama: 'Persiapan Lomba Programming', harga: 200000, tanggal: '15/02/2025' },
      { kategori: 'Alat', nama: 'Pengadaan Alat Kebersihan', harga: 200000, tanggal: '09/02/2025' },
      { kategori: 'Perawatan', nama: 'Biaya Perawatan Taman Sekolah', harga: 200000, tanggal: '06/02/2025' },
      { kategori: 'Perawatan', nama: 'Langganan Internet Sekolah', harga: 500000, tanggal: '04/02/2025' },
      { kategori: 'Perawatan', nama: 'Biaya Listrik dan Air', harga: 500000, tanggal: '04/02/2025' },
      { kategori: 'Tambahan', nama: 'Pelatihan dan Workshop Guru', harga: 500000, tanggal: '28/01/2025' },
      { kategori: 'Alat', nama: 'Pengadaan CCTV', harga: 500000, tanggal: '15/01/2025' }
    ],
    []
  );

  // Filter data berdasarkan pencarian dan rentang tanggal
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const [day, month, year] = row.tanggal.split('/');
      const formattedDate = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];
      const matchesSearch = row.nama.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = (!startDate || formattedDate >= startDate) && (!endDate || formattedDate <= endDate);
      return matchesSearch && matchesDate;
    });
  }, [searchTerm, startDate, endDate, data]);

  // Definisi Kolom
  const columns = useMemo(
    () => [
      { accessorKey: 'kategori', header: 'Kategori' },
      { accessorKey: 'nama', header: 'Nama Pengeluaran' },
      { accessorKey: 'harga', header: 'Harga Barang', cell: (info) => info.getValue().toLocaleString('id-ID') },
      { accessorKey: 'tanggal', header: 'Tanggal Pembelian' },
      {
        accessorKey: 'nota',
        header: 'Nota',
        cell: () => <FileText className="text-black cursor-pointer" />
      },
      {
        accessorKey: 'keterangan',
        header: 'Keterangan',
        cell: () => <FileText className="text-black cursor-pointer" />
      }
    ],
    []
  );

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="ml-64 flex-1 bg-white min-h-screen p-6 text-black">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Monitoring Pengeluaran</h2>
      </div>
      {/* Filter & Search */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
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
          onClick={() => alert('Fitur Tambah Pengeluaran belum tersedia')}
        >
          Tambah Pengeluaran
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-blue-900 text-white">
              {table.getHeaderGroups().map(headerGroup => (
                headerGroup.headers.map(header => (
                  <th key={header.id} className="p-2 border text-sm">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))
              ))}
            </tr>
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