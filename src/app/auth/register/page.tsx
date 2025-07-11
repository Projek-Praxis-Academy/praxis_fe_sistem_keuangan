"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
//     myHeaders.append("Authorization", "Bearer your_api_key_if_needed"); // Ganti jika butuh

    const raw = JSON.stringify({
      nama: nama.trim(),
      email: email.trim(),
      password: password.trim(),
      password_confirmation: passwordConfirmation.trim(),
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", requestOptions);
      const result = await response.json();

      if (response.ok) {
        alert("Registrasi berhasil! Silakan login.");
        router.push("/"); // redirect ke halaman login
      } else {
        alert(result.message || "Registrasi gagal. Periksa kembali isian Anda.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat registrasi.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-blue-900 p-8 rounded-xl shadow-lg border-4 w-[400px] text-center">
        <img src="/logo.png" alt="Praxis Academy" className="mx-auto w-20 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-4">Daftar Akun</h2>

        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nama Lengkap"
            className="border bg-white p-2 rounded-md w-full text-blue-900"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="example@mail.com"
            className="border bg-white p-2 rounded-md w-full text-blue-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="border bg-white p-2 rounded-md w-full text-blue-900 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Konfirmasi Password"
            className="border bg-white p-2 rounded-md w-full text-blue-900"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600 active:bg-blue-700 transition duration-200"
          >
            Daftar
          </button>
        </form>
      </div>
    </div>
  );
}
