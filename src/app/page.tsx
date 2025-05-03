"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
  
    const raw = JSON.stringify({
      email: email.trim(),
      password: password.trim(),
    });
  
    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", requestOptions);
      const data = await response.json(); // Ini ambil body JSON
  
      if (response.ok) {
        const token = data.access_token; // ambil dari data.access_token (bukan data.token)
        localStorage.setItem("token", token); // Simpan ke localStorage
        router.push("/dashboard"); // Ganti ke path, jangan ke URL full
      } else {
        alert(data.message || "Login gagal. Cek email dan password!");
      }
    } catch (error) {
      console.error("Error login:", error);
      alert("Terjadi kesalahan. Coba lagi nanti.");
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-blue-900 p-8 rounded-xl shadow-lg border-4 w-[400px] text-center">
        <img src="/logo.png" alt="Praxis Academy" className="mx-auto w-20 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-4">Masuk</h2>

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="example@mail.com"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
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
