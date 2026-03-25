'use client'

import { useState } from 'react'
import { businesses } from '@/lib/mock-data'
import type { BusinessStatus, BusinessPlan } from '@/lib/mock-data'

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    Temel: { bg: 'rgba(90,88,80,0.15)', color: 'var(--muted)', border: 'var(--line2)' },
    Pro: { bg: 'var(--gold3)', color: 'var(--gold)', border: 'rgba(196,154,74,0.25)' },
    Kurumsal: { bg: 'rgba(245,243,239,0.08)', color: 'var(--white)', border: 'rgba(245,243,239,0.2)' },
  }
  const s = styles[plan] || styles['Temel']
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '2px 8px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '2px',
        fontSize: '10px',
        fontWeight: '600',
        color: s.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {plan}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    Aktif: { bg: 'rgba(74,196,120,0.1)', color: '#4ac478', border: 'rgba(74,196,120,0.25)' },
    Pasif: { bg: 'rgba(90,88,80,0.1)', color: 'var(--muted)', border: 'var(--line)' },
    'Askı': { bg: 'rgba(196,74,74,0.1)', color: '#c44a4a', border: 'rgba(196,74,74,0.25)' },
  }
  const s = styles[status] || styles['Pasif']
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '2px',
        fontSize: '10px',
        fontWeight: '600',
        color: s.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {status}
    </span>
  )
}

export default function IsletmelerPage() {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('Tümü')
  const [statusFilter, setStatusFilter] = useState('Tümü')

  const filtered = businesses.filter((b) => {
    const matchSearch = search === '' || b.name.toLowerCase().includes(search.toLowerCase()) || b.owner.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'Tümü' || b.plan === planFilter
    const matchStatus = statusFilter === 'Tümü' || b.status === statusFilter
    return matchSearch && matchPlan && matchStatus
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
    <div style={{ padding: '32px 36px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Super Admin
          </span>
          <span style={{ fontSize: '10px', color: 'var(--dim)' }}>›</span>
          <span style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            İşletmeler
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
          İşletmeler
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {businesses.length} işletme kayıtlı · {businesses.filter((b) => b.status === 'Aktif').length} aktif
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
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
            placeholder="İşletme adı veya sahip ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '34px', width: '100%' }}
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="Tümü">Tüm Planlar</option>
          <option value="Temel">Temel</option>
          <option value="Pro">Pro</option>
          <option value="Kurumsal">Kurumsal</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="Tümü">Tüm Durumlar</option>
          <option value="Aktif">Aktif</option>
          <option value="Pasif">Pasif</option>
          <option value="Askı">Askı</option>
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
              {['İşletme Adı', 'Sahip', 'Plan', 'Durum', 'Randevular', 'Gelir', 'Kayıt Tarihi', 'İşlemler'].map((h) => (
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
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                  İşletme bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((b, i) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '3px',
                          background: 'var(--gold3)',
                          border: '1px solid rgba(196,154,74,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: 'var(--gold)',
                          flexShrink: 0,
                        }}
                      >
                        {b.logo}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--white)' }}>{b.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{b.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--white)' }}>
                    {b.owner}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <PlanBadge plan={b.plan} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={b.status} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--white)' }}>
                    {b.appointmentsCount.toLocaleString('tr-TR')}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--gold)' }}>
                    ₺{b.revenue.toLocaleString('tr-TR')}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--muted)' }}>
                    {b.createdAt}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
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
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Görüntüle
                      </button>
                      {b.status !== 'Askı' ? (
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
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Askıya Al
                        </button>
                      ) : (
                        <button
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(74,196,120,0.08)',
                            border: '1px solid rgba(74,196,120,0.2)',
                            borderRadius: '2px',
                            color: '#4ac478',
                            fontSize: '10px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Aktifleştir
                        </button>
                      )}
                      <button
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(196,74,74,0.08)',
                          border: '1px solid rgba(196,74,74,0.2)',
                          borderRadius: '2px',
                          color: '#c44a4a',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
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
