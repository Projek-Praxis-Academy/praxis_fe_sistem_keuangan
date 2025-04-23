// app/forget-pw/page.tsx
"use client";

import { useState } from "react";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Link reset password telah dikirim ke: ${email}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-blue-900 p-8 rounded-xl shadow-lg border-4 w-[400px] text-center">
      <img src="/logo.png" alt="Praxis Academy" className="mx-auto w-20 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-4">Lupa Kata Sandi</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="example@mail.com"
            className="border bg-white p-2 rounded-md w-full text-blue-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600 active:bg-blue-700 transition duration-200"
          >
            Kirim Link Reset
          </button>
        </form>
      </div>
    </div>
  );
}
