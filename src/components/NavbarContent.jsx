'use client'

// Next Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

const SidebarContent = () => {
  const [openTagihin, setOpenTagihin] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        localStorage.removeItem('token')
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

  // const toggleSidebar = () => {
  //   setIsCollapsed(!isCollapsed)
  // }

  return (
    <div className={`h-screen bg-[#01478C] text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Toggle Button */}
      {/* <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-5 z-10 rounded-full bg-white p-1 shadow-md hover:bg-gray-200"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button> */}

      <div className="p-4 flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          {isCollapsed ? (
            <Image src="/steam.png" alt="Praxis Academy" width={150} height={100} />
          ) : (
            <Image src="/steam.png" alt="Praxis Academy" width={150} height={100} />
          )}
        </div>

        <ul className="space-y-2">
          <li>
            <Link
              id="dashboard-link"
              href="/dashboard" 
              className={`flex items-center p-2 text-left text-black bg-white hover:bg-gray-200 rounded ${isCollapsed ? 'justify-center' : ''}`}
            >
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          
          {/* Pendapatan */}
          <li>
            <button
              type='button'
              id="pendapatan-button"
              onClick={() => setOpenTagihin(!openTagihin)}
              className={`flex items-center p-2 w-full text-left text-black bg-white hover:bg-gray-200 rounded ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              {!isCollapsed && <span>Pendapatan</span>}
              {!isCollapsed && <i className={`ri-arrow-down-s-line transition-transform ${openTagihin ? "rotate-180" : ""}`}>▾</i>}
            </button>

            {openTagihin && !isCollapsed && (
              <ul className="ml-4 mt-2 space-y-2">
                <li>
                  <Link
                  id='pendapatan-praxis-link'
                  href="/pendapatan/praxis" className="block p-2 text-left text-black bg-white hover:bg-gray-200 rounded">
                    Praxis Academy
                  </Link>
                </li>

                <li>
                  <Link
                  id='pendapatan-techno-link'
                  href="/pendapatan/techno" className="block p-2 text-left text-black bg-white hover:bg-gray-200 rounded">
                    TechnoNatura
                  </Link>
                </li>

                <li>
                  <Link 
                  id='pendapatan-boarding-konsumsi-link'
                  href="/pendapatan/boarding-konsumsi" className="block p-2 text-left text-black bg-white hover:bg-gray-200 rounded">
                    Boarding & Konsumsi
                  </Link>
                </li>
              </ul>
            )}
          </li>        
          
          <li>
            <Link 
              id="uang-saku-link"
              href="/uang-saku" 
              className={`flex items-center p-2 text-left text-black bg-white hover:bg-gray-200 rounded ${isCollapsed ? 'justify-center' : ''}`}
            >
              {!isCollapsed && <span>Uang Saku</span>}
            </Link>
          </li>
          
          <li>
            <Link 
              id="ekstra-link"
              href="/ekstra" 
              className={`flex items-center p-2 text-left text-black bg-white hover:bg-gray-200 rounded ${isCollapsed ? 'justify-center' : ''}`}
            >
              {!isCollapsed && <span>Ekstrakurikuler</span>}
            </Link>
          </li>
          
          <li>
            <Link 
              id="pengeluaran-link"
              href="/pengeluaran" 
              className={`flex items-center p-2 text-left text-black bg-white hover:bg-gray-200 rounded ${isCollapsed ? 'justify-center' : ''}`}
            >
              {!isCollapsed && <span>Pengeluaran</span>}
            </Link>
          </li>
          
          <li>
            <Link 
              id="tagihan-link"
              href="/tagihan" 
              className={`flex items-center p-2 text-left text-black bg-white hover:bg-gray-200 rounded ${isCollapsed ? 'justify-center' : ''}`}
            >
              {!isCollapsed && <span>Tagihan</span>}
            </Link>
          </li>

          <li>
            <Link 
              id="tunggakan-link"
              href="/tunggakan" 
              className={`flex items-center p-2 text-left text-black bg-white hover:bg-gray-200 rounded ${isCollapsed ? 'justify-center' : ''}`}
            >
              {!isCollapsed && <span>Tunggakan</span>}
            </Link>
          </li>
        </ul>
      </div>

      {/* Bottom section with logout and copyright */}
      <div className="p-4 border-t border-white/10">
        <button
          id="logout-button"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full p-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition duration-200 flex items-center justify-center gap-2 ${isCollapsed ? 'px-0' : ''}`}
        >
          {isLoggingOut ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {!isCollapsed && 'Logging out...'}
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5" />
              {!isCollapsed && 'Logout'}
            </>
          )}
        </button>
        <p className={`text-center text-sm text-white opacity-75 mt-2 ${isCollapsed ? 'text-xs' : ''}`}>
            <span className="block">version 3.0.1</span>
            <span className="block">© 2025 fintrack-team</span>
          </p>
      </div>
    </div>
  )
}

export default SidebarContent