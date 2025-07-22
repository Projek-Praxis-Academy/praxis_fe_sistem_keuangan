cat << 'EOF' > README.md
# � Finance Tracking System

Sistem manajemen keuangan untuk kebutuhan administrasi di **Yayasan Praxis Academy** dan **Techno Natura**. Dirancang untuk mencatat, mengelola, dan memantau semua transaksi pemasukan & pengeluaran dengan efisien dan transparan.

---

## �� Fitur Utama

### � Pendapatan
Finance Tracking memisahkan sumber pendapatan menjadi beberapa kategori:
- � Praxis Academy
- � Techno Natura
- � Boarding & Konsumsi
- � Uang Saku
- � Ekstrakurikuler

Setiap kategori menghasilkan **tagihan bulanan otomatis** kepada siswa, yang dapat dikelola melalui fitur:

- ✍️ **Buat Tagihan**  
- � **Tunggakan**  
  Jika ada siswa belum melunasi tagihan, data secara otomatis masuk ke menu ini agar bendahara dapat memantau dengan mudah.

### � Pengeluaran
Sistem mencatat pengeluaran dalam dua jenis:
- � **Proyek (Project-Based)**
- � **Operasional Rutin (Non-Project)**

> � Sistem ini membantu proses pencatatan menjadi **lebih terstruktur, transparan, dan efisien** untuk seluruh proses administrasi keuangan.

---

## � Cara Menjalankan (FE)

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

� Akses Produksi
� https://fe-fintrack.vercel.app

� Login Demo
Username : bendahara@example.com
Password : password123


⚙️ Setup Backend (BE) – Wajib karena Railway tidak premium
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
� Teknologi yang Digunakan
�‍� Next.js

� Tailwind CSS

� Zustand (State Management)

� Authentication & Session

⚙️ RESTful API
EOF
