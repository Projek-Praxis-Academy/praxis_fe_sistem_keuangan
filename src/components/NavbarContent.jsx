'use client'

// Next Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut } from 'lucide-react'

const SidebarContent = () => {
  const [openTagihin, setOpenTagihin] = useState(false)
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Hapus token dari localStorage
        localStorage.removeItem('token')
        // Redirect ke halaman login menggunakan Next.js router
        router.push('/')
      } else {
        const errorData = await response.json()
        console.error('Logout failed:', errorData)
        alert(errorData.message || 'Logout gagal. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error during logout:', error)
      alert('Terjadi kesalahan saat logout. Silakan coba lagi.')
    } finally {
      setIsLoggingOut(false)
    }
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
                    <span>TechnoNatura</span>
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
            <Link href="/tagihan" className="block p-2 text-left text-black bg-white hover:bg-gray-200 hover:text-black rounded">
              Tagihan
            </Link>
          </li>
        </ul>
      </div>

      {/* Button Logout di bagian bawah */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-4 w-full p-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition duration-200 flex items-center justify-center gap-2"
      >
        {isLoggingOut ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging out...
          </>
        ) : (
          <>
            <LogOut className="h-5 w-5" />
            Logout
          </>
        )}
      </button>
    </div>
  )
}

export default SidebarContent