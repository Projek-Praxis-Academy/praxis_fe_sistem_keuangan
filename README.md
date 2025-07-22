````markdown
# 💰 Finance Tracking System

Sistem manajemen keuangan untuk kebutuhan administrasi di **Yayasan Praxis Academy** dan **Techno Natura**.  
Dirancang untuk mencatat, mengelola, dan memantau semua transaksi pemasukan & pengeluaran secara **efisien, transparan, dan terstruktur**.

---

## 🧾 Fitur Utama

### 📌 Pendapatan
Finance Tracking memisahkan sumber pendapatan menjadi beberapa kategori:
- 🏫 Praxis Academy  
- 🏫 Techno Natura  
- 🏡 Boarding & Konsumsi  
- 💸 Uang Saku  
- 🥋 Ekstrakurikuler  

Setiap kategori menghasilkan **tagihan bulanan otomatis** kepada siswa, dengan fitur:
- ✍️ **Buat Tagihan**
- 📍 **Tunggakan**: Menampilkan siswa yang belum melunasi tagihan secara otomatis untuk memudahkan monitoring.

---

### 💼 Pengeluaran
Pengeluaran dicatat dalam dua jenis:
- 📂 **Proyek (Project-Based)**
- 🔧 **Operasional Rutin (Non-Project)**

> 🔐 Sistem ini mempermudah pencatatan keuangan dengan cara yang **terpusat dan akuntabel**, sehingga proses pelaporan dan audit menjadi lebih lancar.

---

## 🚀 Cara Menjalankan (Frontend)

```bash
# Clone repository frontend
git clone https://github.com/Projek-Praxis-Academy/praxis_fe_sistem_keuangan.git

# Masuk ke folder project
cd praxis_fe_sistem_keuangan

# Buka di VS Code (opsional)
code .

# Install dependencies
npm install

# Jalankan proyek
npm run dev
````

🌐 **Akses Produksi**
👉 [https://fe-fintrack.vercel.app](https://fe-fintrack.vercel.app)

🔐 **Login Demo**

* Username : `bendahara@example.com`
* Password : `password123`

---

## ⚙️ Setup Backend (BE) - Wajib (Karena Railway tidak premium)

Karena layanan Railway sudah tidak premium, silakan jalankan backend secara lokal dengan langkah berikut:

```bash
# Clone repository backend
git clone <url-repo-backend>

# Masuk ke folder backend
cd nama-folder-backend

# Install dependency PHP
composer install

# Migrasi & seeding database
php artisan migrate:fresh --seed

# Jalankan server lokal
php artisan serve
```

> ⚠️ Pastikan juga environment dan database sudah disiapkan sesuai kebutuhan backend.

---

## 🧩 Teknologi yang Digunakan

| Fitur              | Teknologi                                  |
| ------------------ | ------------------------------------------ |
| Framework Frontend | 🧑‍💻 [Next.js](https://nextjs.org)        |
| Styling            | 🎨 [Tailwind CSS](https://tailwindcss.com) |
| State Management   | 💡 Zustand                                 |
| Autentikasi & Sesi | 🔐 NextAuth / Middleware                   |
| API                | ⚙️ RESTful API                             |

---

## 🤝 Kontribusi

Pull request terbuka!
Silakan buat issue jika ada bug, feedback, atau saran pengembangan.

---

## 📄 Lisensi

Proyek ini didistribusikan untuk kebutuhan internal yayasan.
Hubungi pengelola jika ingin menggunakan sistem ini di institusi Anda.

```
