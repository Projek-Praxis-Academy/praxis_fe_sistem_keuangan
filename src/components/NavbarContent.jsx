'use client'

// Next Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const SidebarContent = () => {
  const [openTagihin, setOpenTagihin] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated") // Hapus status login
    router.push("/") // Arahkan ke halaman login
  }

  return (
    <div className="w-64 h-screen bg-[#01478C] text-white p-4 flex flex-col justify-between">
      <div>
        {/* Logo di kiri */}
        <div className="flex items-center pl-2 mb-4">
          <Image src="/logo.png" alt="Praxis Academy" width={80} height={80} />
        </div>

        <ul>
        <li className="mb-2">
            <Link href="/dashboard" className="block p-2 text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
              Dashboard
            </Link>
          </li>
          {/* Tagihin */}
          <li className="mb-2">
            <button
              onClick={() => setOpenTagihin(!openTagihin)}
              className="flex items-center justify-between p-2 w-full text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded"
            >
              <span>Pendapatan</span>
              <i className={`ri-arrow-down-s-line transition-transform ${openTagihin ? "rotate-180" : ""}`}>▾</i>
            </button>

            {openTagihin && (
              <ul className="ml-4">
                {/* Praxis */}
                <li className="mt-2 mb-2">
                  <Link href="/pendapatan/praxis" className="flex p-2 w-full text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
                    <span>Praxis Academy</span>
                  </Link>
                </li>

                {/* Techno */}
                <li className="mb-2">
                  <Link href="/pendapatan/techno" className="flex p-2 w-full text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
                    <span>Techno Nature</span>
                  </Link>
                </li>

                {/* Boarding & Konsumsi */}
                <li className="mb-2">
                  <Link href="/pendapatan/boarding-konsumsi" className="block p-2 text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
                    Boarding & Konsumsi
                  </Link>
                </li>
              </ul>
            )}
          </li>        
          <li className="mb-2">
            <Link href="/uang-saku" className="block p-2 text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
              Uang Saku
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/ekstra" className="block p-2 text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
              Ekstra
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/pengeluaran" className="block p-2 text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
              Pengeluaran
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/buat-tagihan" className="block p-2 text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
              Buat Tagihan
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/tunggakan" className="block p-2 text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
              Tunggakan
            </Link>
          </li>

        </ul>
      </div>

      {/* Button Logout di bagian bawah */}
      <button
        onClick={handleLogout}
        className="mt-4 w-full p-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition duration-200"
      >
        Logout
      </button>
    </div>
  )
}

export default SidebarContent
