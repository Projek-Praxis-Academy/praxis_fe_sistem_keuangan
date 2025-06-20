import axios from 'axios'
import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'

interface Kategori {
  id_kategori_pengeluaran: string
  nama_kategori_pengeluaran: string
}

interface EditSubPengeluaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Replace 'any' with a more specific type if available
  onSave: (payload: any) => void; // Adjust the payload type as needed
  jenisPengeluaran: string;
}

export default function EditSubPengeluaranModal({
  isOpen,
  onClose,
  data,
  onSave,
  jenisPengeluaran,
}: EditSubPengeluaranModalProps) {
  interface FormState {
    id_sub_pengeluaran: string;
    nama_sub_pengeluaran: string;
    id_kategori_pengeluaran: string;
    nominal: string;
    jumlah_item: string;
    tanggal_pengeluaran: string;
    file_nota: File | null;
  }

  const defaultForm: FormState = {
    id_sub_pengeluaran: '',
    nama_sub_pengeluaran: '',
    id_kategori_pengeluaran: '',
    nominal: '',
    jumlah_item: '',
    tanggal_pengeluaran: '',
    file_nota: null,
  }

  const [form, setForm] = useState<FormState>(defaultForm)
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [loadingKategori, setLoadingKategori] = useState(false)
  useEffect(() => {
     if(jenisPengeluaran) {
    const fetchKategori = async () => {
      try {
        setLoadingKategori(true)
        const token = localStorage.getItem('token') || ''
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/monitoring-pengeluaran/kategori-pengeluaran?type=${jenisPengeluaran}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        console.log('Kategori response:', response.data); // Debug
        // Coba beberapa alternatif struktur response
        const data = response.data.data || response.data;
        setKategoriList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Gagal memuat kategori:', err)
      } finally {
        setLoadingKategori(false)
      }
    }
      fetchKategori()
    }
  }, [jenisPengeluaran])

  useEffect(() => {
    if (data) {
      setForm({
        id_sub_pengeluaran: data.id_sub_pengeluaran || '',
        nama_sub_pengeluaran: data.nama_sub_pengeluaran || '',
        id_kategori_pengeluaran: data.id_kategori_pengeluaran?.toString() || '',
        nominal: data.nominal?.toString() || '',
        jumlah_item: data.jumlah_item?.toString() || '',
        tanggal_pengeluaran: data.tanggal_pengeluaran || '',
        file_nota: null, // Kosongkan agar hanya unggah ulang jika perlu
      })
    }
  }, [data])

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    const formData = new FormData()

    // Pastikan semua nilai sesuai dengan tipe yang diharapkan Laravel
    formData.append('nama_sub_pengeluaran', form.nama_sub_pengeluaran)
    formData.append('id_kategori_pengeluaran', form.id_kategori_pengeluaran)
    formData.append('nominal', form.nominal)
    formData.append('jumlah_item', form.jumlah_item)
    formData.append('tanggal_pengeluaran', form.tanggal_pengeluaran)

    if (form.file_nota) {
      formData.append('file_nota', form.file_nota)
    }

    onSave({
    id_sub_pengeluaran: form.id_sub_pengeluaran,
    formData // Kirim FormData yang sudah dibuat
     });

    onClose()
  }

  if (!data) return null

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white p-6 rounded-md shadow-md max-w-md w-full">
          <Dialog.Title className="text-lg font-bold mb-4">
            Edit Sub Pengeluaran
          </Dialog.Title>

          <div className="flex flex-col gap-3">
            <input
              className="border px-3 py-2 rounded"
              value={form.nama_sub_pengeluaran}
              onChange={(e) => handleChange('nama_sub_pengeluaran', e.target.value)}
              placeholder="Nama Sub Pengeluaran"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Pengeluaran
              </label>
              {loadingKategori ? (
                <select className="border px-3 py-2 rounded bg-gray-100 animate-pulse">
                  <option>Memuat kategori...</option>
                </select>
              ) : (
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={form.id_kategori_pengeluaran}
                  onChange={(e) => handleChange('id_kategori_pengeluaran', e.target.value)}
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriList.map((kategori) => (
                    <option key={kategori.id_kategori_pengeluaran} value={kategori.id_kategori_pengeluaran}>
                      {kategori.nama_kategori_pengeluaran}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <input
              type="number"
              className="border px-3 py-2 rounded"
              value={form.nominal}
              onChange={(e) => handleChange('nominal', e.target.value)}
              placeholder="Nominal"
              min={0}
              required
            />

            <input
              type="number"
              className="border px-3 py-2 rounded"
              value={form.jumlah_item}
              onChange={(e) => handleChange('jumlah_item', e.target.value)}
              placeholder="Jumlah Item"
              min={1}
              required
            />

            <input
              type="date"
              className="border px-3 py-2 rounded"
              value={form.tanggal_pengeluaran}
              onChange={(e) => handleChange('tanggal_pengeluaran', e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Nota</label>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="file_nota"
                  className="bg-blue-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
                >
                  Pilih File
                </label>
                <input
                  id="file_nota"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleChange('file_nota', e.target.files?.[0] || null)}
                  className="hidden"
                />
                {form.file_nota && (
                  <span className="text-xs text-gray-600">{form.file_nota.name}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Simpan
            </button>
            <button onClick={onClose} className="border px-4 py-2 rounded">
              Batal
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}