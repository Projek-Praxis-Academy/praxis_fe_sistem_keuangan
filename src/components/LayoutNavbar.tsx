'use client'

import { ReactNode } from 'react'

interface LayoutNavbarProps {
  children: ReactNode
}

const LayoutNavbar = ({ children }: LayoutNavbarProps) => {
  return (
    <aside className="fixed left-0 top-0 h-full bg-[#013668] text-white shadow-lg">
      {children}
    </aside>
  )
}

export default LayoutNavbar
