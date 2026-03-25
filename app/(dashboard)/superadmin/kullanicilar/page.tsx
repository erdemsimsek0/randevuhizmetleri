'use client'

import { useState } from 'react'
import { users } from '@/lib/mock-data'
import type { UserRole } from '@/lib/mock-data'

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Süper Admin',
  business_owner: 'İşletme Sahibi',
  staff: 'Personel',
  customer: 'Müşteri',
}

const roleColors: Record<UserRole, { bg: string; color: string; border: string }> = {
  super_admin: { bg: 'var(--gold3)', color: 'var(--gold)', border: 'rgba(196,154,74,0.25)' },
  business_owner: { bg: 'rgba(106,180,232,0.1)', color: '#6ab4e8', border: 'rgba(106,180,232,0.25)' },
  staff: { bg: 'rgba(90,88,80,0.1)', color: 'var(--muted)', border: 'var(--line2)' },
  customer: { bg: 'rgba(90,88,80,0.05)', color: 'var(--muted)', border: 'var(--line)' },
}

function RoleBadge({ role }: { role: UserRole }) {
  const c = roleColors[role]
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '2px 8px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '2px',
        fontSize: '10px',
        fontWeight: '600',
        color: c.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {roleLabels[role]}
    </span>
  )
}

function formatLastLogin(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60)
  if (diff < 60) return `${diff} dk önce`
  if (diff < 1440) return `${Math.floor(diff / 60)} saat önce`
  return `${Math.floor(diff / 1440)} gün önce`
}

export default function KullanicilarPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Tümü')

  const filtered = users.filter((u) => {
    const matchSearch =
      search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'Tümü' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    background: 'var(--bg2)',
    border: '1px solid var(--line)',
    borderRadius: '3px',
    color: 'var(--white)',
    fontSize: '12px',
    outline: 'none',
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Super Admin
          </span>
          <span style={{ fontSize: '10px', color: 'var(--dim)' }}>›</span>
          <span style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Kullanıcılar
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '24px',
            color: 'var(--white)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          Kullanıcılar
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {users.length} toplam kullanıcı · {users.filter((u) => u.status === 'Aktif').length} aktif
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {(Object.entries(roleLabels) as [UserRole, string][]).map(([role, label]) => {
          const count = users.filter((u) => u.role === role).length
          const c = roleColors[role]
          return (
            <div
              key={role}
              style={{
                flex: 1,
                padding: '14px 16px',
                background: 'var(--bg2)',
                border: `1px solid ${c.border}`,
                borderRadius: '3px',
              }}
            >
              <div style={{ fontSize: '10px', color: c.color, fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--white)' }}>{count}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Ad veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '34px', width: '100%' }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="Tümü">Tüm Roller</option>
          {(Object.entries(roleLabels) as [UserRole, string][]).map(([role, label]) => (
            <option key={role} value={role}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--line)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Kullanıcı', 'E-posta', 'Rol', 'İşletme', 'Son Giriş', 'Durum', 'İşlemler'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '11px 16px',
                    textAlign: 'left',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: 'var(--muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid var(--line)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                  Kullanıcı bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((user, i) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: user.role === 'super_admin' ? 'var(--gold3)' : 'var(--dim)',
                          border: user.role === 'super_admin' ? '1px solid var(--gold)' : '1px solid var(--line2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: '600',
                          color: user.role === 'super_admin' ? 'var(--gold)' : 'var(--white)',
                          flexShrink: 0,
                        }}
                      >
                        {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--white)' }}>
                        {user.name}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--muted)' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <RoleBadge role={user.role} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--muted)' }}>
                    {user.businessName || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--muted)' }}>
                    {formatLastLogin(user.lastLogin)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        background: user.status === 'Aktif' ? 'rgba(74,196,120,0.1)' : 'rgba(90,88,80,0.1)',
                        border: `1px solid ${user.status === 'Aktif' ? 'rgba(74,196,120,0.25)' : 'var(--line)'}`,
                        borderRadius: '2px',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: user.status === 'Aktif' ? '#4ac478' : 'var(--muted)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <span
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: user.status === 'Aktif' ? '#4ac478' : 'var(--muted)',
                          display: 'inline-block',
                        }}
                      />
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        style={{
                          padding: '4px 10px',
                          background: 'var(--bg)',
                          border: '1px solid var(--line)',
                          borderRadius: '2px',
                          color: 'var(--white)',
                          fontSize: '10px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Görüntüle
                      </button>
                      {user.role !== 'super_admin' && (
                        <button
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(196,74,74,0.08)',
                            border: '1px solid rgba(196,74,74,0.2)',
                            borderRadius: '2px',
                            color: '#c44a4a',
                            fontSize: '10px',
                            fontWeight: '500',
                            cursor: 'pointer',
                          }}
                        >
                          {user.status === 'Aktif' ? 'Devre Dışı' : 'Aktifleştir'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
