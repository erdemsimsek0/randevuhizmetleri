'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  {
    label: 'Panel',
    href: '/admin',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Randevular',
    href: '/admin/randevular',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Müşteriler',
    href: '/admin/musteriler',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <line x1="12" y1="7" x2="12" y2="7" strokeWidth="2.5" />
        <line x1="15" y1="4" x2="15" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Takvim',
    href: '/admin/takvim',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="8" y2="14" />
        <line x1="12" y1="14" x2="12" y2="14" />
        <line x1="16" y1="14" x2="16" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Personel',
    href: '/admin/personel',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Hizmetler',
    href: '/admin/hizmetler',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" />
        <path d="M11 3L8 9l4 13 4-13-3-6" />
        <path d="M2 9h20" />
      </svg>
    ),
  },
  {
    label: 'Ürünler',
    href: '/admin/urunler',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: 'Ayarlar',
    href: '/admin/ayarlar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

interface AdminSidebarProps {
  businessName?: string
  businessSlug?: string
  userEmail?: string
  userName?: string
}

export default function AdminSidebar({
  businessName,
  businessSlug,
  userEmail,
  userName,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const displayName = businessName || 'İşletme'
  const displaySlug = businessSlug || 'isletme'
  const displayUserName = userName || 'Kullanıcı'
  const displayEmail = userEmail || ''
  const initials = displayUserName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function handleCopyLink() {
    const url = `https://randevuhizmetleri.vercel.app/${displaySlug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleNavClick() {
    if (isMobile) setMobileOpen(false)
  }

  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        width: '240px',
        minWidth: '240px',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        overflow: 'hidden',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }
    : {
        width: '240px',
        minWidth: '240px',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }

  return (
    <>
      {/* Hamburger button — mobile only */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position: 'fixed',
            top: '14px',
            left: '14px',
            zIndex: 1001,
            width: '40px',
            height: '40px',
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '4px',
            color: 'var(--gold)',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          aria-label="Menüyü aç"
        >
          ☰
        </button>
      )}

      {/* Backdrop — mobile only */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 999,
          }}
        />
      )}

      <aside style={sidebarStyle}>
        {/* Logo Area */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                background: 'var(--gold3)',
                border: '1px solid var(--gold)',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--gold)',
                fontFamily: 'DM Serif Display, serif',
                flexShrink: 0,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--white)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              background: 'var(--gold3)',
              border: '1px solid rgba(196,154,74,0.25)',
              borderRadius: '2px',
            }}
          >
            <span style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.04em' }}>
              @{displaySlug}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          <div
            style={{
              padding: '0 12px 8px',
              fontSize: '9px',
              fontWeight: '600',
              color: 'var(--muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Yönetim
          </div>
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  margin: '1px 8px',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: active ? '500' : '400',
                  color: active ? 'var(--gold)' : 'var(--muted)',
                  background: active ? 'var(--gold3)' : 'transparent',
                  border: active ? '1px solid rgba(196,154,74,0.15)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <span style={{ opacity: active ? 1 : 0.7, color: active ? 'var(--gold)' : 'var(--muted)' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {active && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'var(--gold)',
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Customer Link */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(196,154,74,0.05)',
              border: '1px solid rgba(196,154,74,0.25)',
              borderLeft: '3px solid var(--gold)',
              borderRadius: '3px',
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Müşteri Linki
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--muted)',
                marginBottom: '8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              randevuhizmetleri.com/{displaySlug}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  background: copied ? 'rgba(74,196,120,0.1)' : 'transparent',
                  border: `1px solid ${copied ? 'rgba(74,196,120,0.3)' : 'rgba(196,154,74,0.3)'}`,
                  borderRadius: '2px',
                  color: copied ? '#4ac478' : 'var(--gold)',
                  fontSize: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.04em',
                }}
              >
                {copied ? 'Kopyalandı!' : 'Kopyala'}
              </button>
              <a
                href={`https://randevuhizmetleri.vercel.app/${displaySlug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  background: 'transparent',
                  border: '1px solid rgba(196,154,74,0.3)',
                  borderRadius: '2px',
                  color: 'var(--gold)',
                  fontSize: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Aç
              </a>
            </div>
          </div>
        </div>

        {/* Bottom User Area */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--dim)',
                border: '1px solid var(--line2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--white)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--white)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayUserName}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayEmail}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '7px 12px',
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              color: 'var(--muted)',
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  )
}
