'use client'

import { useState, useEffect } from 'react'

export default function DashboardMainWrapper({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <main
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: '100vh',
        paddingTop: isMobile ? '56px' : '0',
      }}
    >
      {children}
    </main>
  )
}
