"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react"; // Import ikon mata

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulasi autentikasi sederhana
    if (email === "user@example.com" && password === "password123") {
      localStorage.setItem("isAuthenticated", "true"); // Simpan status login
      router.push("/dashboard"); // Arahkan ke dashboard
    } else {
      alert("Email atau password salah!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-blue-900 p-8 rounded-xl shadow-lg border-4 w-[400px] text-center">
        {/* Logo */}
        <img src="/logo.png" alt="Praxis Academy" className="mx-auto w-20 mb-4" />

        {/* Judul */}
        <h2 className="text-xl font-semibold text-white mb-4">Masuk</h2>

        {/* Form Login */}
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="example@mail.com"
            className="border bg-white p-2 rounded-md w-full text-blue-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="password"
              className="border bg-white p-2 rounded-md w-full text-blue-900 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Ikon Mata */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          <div className="text-right">
            <a
              href="auth/forget-password"
              className="text-white text-sm hover:text-blue-300 transition duration-200"
            >
              Lupa Kata Sandi?
            </a>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600 active:bg-blue-700 transition duration-200"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}