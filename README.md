cat << 'EOF' > README.md
# í²° Finance Tracking System

Sistem manajemen keuangan untuk kebutuhan administrasi di **Yayasan Praxis Academy** dan **Techno Natura**. Dirancang untuk mencatat, mengelola, dan memantau semua transaksi pemasukan & pengeluaran dengan efisien dan transparan.

---

## ï¿½ï¿½ Fitur Utama

### í³Œ Pendapatan
Finance Tracking memisahkan sumber pendapatan menjadi beberapa kategori:
- í¿« Praxis Academy
- í¿« Techno Natura
- í¿¡ Boarding & Konsumsi
- í²¸ Uang Saku
- íµ‹ Ekstrakurikuler

Setiap kategori menghasilkan **tagihan bulanan otomatis** kepada siswa, yang dapat dikelola melalui fitur:

- âœï¸ **Buat Tagihan**  
- í³ **Tunggakan**  
  Jika ada siswa belum melunasi tagihan, data secara otomatis masuk ke menu ini agar bendahara dapat memantau dengan mudah.

### í²¼ Pengeluaran
Sistem mencatat pengeluaran dalam dua jenis:
- í³‚ **Proyek (Project-Based)**
- í´§ **Operasional Rutin (Non-Project)**

> í´ Sistem ini membantu proses pencatatan menjadi **lebih terstruktur, transparan, dan efisien** untuk seluruh proses administrasi keuangan.

---

## íº€ Cara Menjalankan (FE)

```bash
# Clone repository
git clone https://github.com/Projek-Praxis-Academy/praxis_fe_sistem_keuangan.git

# Masuk ke folder
cd praxis_fe_sistem_keuangan

# Buka di VS Code (opsional)
code .

# Install dependencies
npm install

# Jalankan proyek
npm run dev

í¼ Akses Produksi
í±‰ https://fe-fintrack.vercel.app

í´ Login Demo
Username : bendahara@example.com
Password : password123


âš™ï¸ Setup Backend (BE) â€“ Wajib karena Railway tidak premium
Dikarenakan Railway sudah tidak premium, gunakan backend secara lokal dengan langkah berikut:

bash
Copy code
# Clone repository backend
git clone <url-repo-backend>

# Masuk ke folder backend
cd nama-folder-backend

# Install dependency PHP
composer install

# Jalankan migrasi dan seeding database
php artisan migrate:fresh --seed

# Jalankan server lokal
php artisan serve
í³Œ Teknologi yang Digunakan
í·‘â€í²» Next.js

í¾¨ Tailwind CSS

í²¡ Zustand (State Management)

í´ Authentication & Session

âš™ï¸ RESTful API
EOF
