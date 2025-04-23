"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Sidebar from "@/components/NavBar";
import Header from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const excludedPaths = ["/", "/auth/forget-password", "/auth/reset-password"];

  return (
    <html lang="id">
      <body>
        {excludedPaths.includes(pathname) ? (
          // Halaman Login dan Auth tanpa Sidebar & Header
          <>{children}</>
        ) : (
          // Halaman lain tetap dengan layout
          <div className="flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Wrapper untuk konten utama */}
            <div className="flex-1 min-h-screen flex flex-col bg-white">
              {/* Header tetap di atas */}
              <Header />

              {/* Konten, beri padding atas agar tidak tertutup Header */}
              <main className="p-8 mt-16">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
