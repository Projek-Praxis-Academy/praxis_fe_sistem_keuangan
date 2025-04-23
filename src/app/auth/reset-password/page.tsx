"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok!");
      return;
    }
    alert("Password berhasil direset!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-blue-900 p-8 rounded-xl shadow-lg border-4 w-[400px] text-center">
      <img src="/logo.png" alt="Praxis Academy" className="mx-auto w-20 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-4">Reset Password</h2>
        <p className="text-white text-sm mb-4">Masukkan token dan password baru</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Token"
            className="border bg-white p-2 rounded-md w-full text-blue-900"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <input
            type="email"
            placeholder="example@mail.com"
            className="border bg-white p-2 rounded-md w-full text-blue-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password Baru */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password Baru"
              className="border bg-white p-2 rounded-md w-full text-blue-900 pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          {/* Konfirmasi Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi Password"
              className="border bg-white p-2 rounded-md w-full text-blue-900 pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600 active:bg-blue-700 transition duration-200"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
