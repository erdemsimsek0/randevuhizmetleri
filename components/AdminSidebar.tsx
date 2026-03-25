'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { currentBusiness, currentUser } from '@/lib/mock-data'

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

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside
      style={{
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
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--line)',
        }}
      >
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
            }}
          >
            {currentBusiness.logo}
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
              {currentBusiness.name}
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
            @{currentBusiness.slug}
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

      {/* Bottom User Area */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--line)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
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
            {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
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
              {currentUser.name}
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
              {currentUser.email}
            </div>
          </div>
        </div>
        <button
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
  )
}
