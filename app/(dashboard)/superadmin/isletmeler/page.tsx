'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/lib/types'

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    temel: { bg: 'rgba(90,88,80,0.15)', color: 'var(--muted)', border: 'var(--line2)' },
    pro: { bg: 'var(--gold3)', color: 'var(--gold)', border: 'rgba(196,154,74,0.25)' },
    kurumsal: { bg: 'rgba(245,243,239,0.08)', color: 'var(--white)', border: 'rgba(245,243,239,0.2)' },
  }
  const s = styles[plan] || styles['temel']
  return (
    <span style={{ display: 'inline-flex', padding: '2px 8px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: '2px', fontSize: '10px', fontWeight: '600', color: s.color, letterSpacing: '0.06em', textTransform: 'capitalize' }}>
      {plan}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    aktif: { bg: 'rgba(74,196,120,0.1)', color: '#4ac478', border: 'rgba(74,196,120,0.25)' },
    pasif: { bg: 'rgba(90,88,80,0.1)', color: 'var(--muted)', border: 'var(--line)' },
    askida: { bg: 'rgba(196,74,74,0.1)', color: '#c44a4a', border: 'rgba(196,74,74,0.25)' },
  }
  const s = styles[status] || styles['pasif']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: '2px', fontSize: '10px', fontWeight: '600', color: s.color, letterSpacing: '0.06em', textTransform: 'capitalize' }}>
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {status}
    </span>
  )
}

export default function IsletmelerPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filtered, setFiltered] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const supabase = createClient()

  const fetchBusinesses = useCallback(async () => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })
    setBusinesses((data as Business[]) ?? [])
    setFiltered((data as Business[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchBusinesses() }, [fetchBusinesses])

  useEffect(() => {
    if (!search) { setFiltered(businesses); return }
    const q = search.toLowerCase()
    setFiltered(businesses.filter((b) => b.name.toLowerCase().includes(q) || b.slug.includes(q)))
  }, [search, businesses])

  async function updateStatus(id: string, status: Business['status']) {
    setUpdating(id)
    await supabase.from('businesses').update({ status }).eq('id', id)
    setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
    setUpdating(null)
  }

  async function updatePlan(id: string, plan: Business['plan']) {
    setUpdating(id)
    await supabase.from('businesses').update({ plan }).eq('id', id)
    setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, plan } : b))
    setUpdating(null)
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          İşletme Yönetimi
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {filtered.length} işletme
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="İşletme adı veya slug ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: '400px',
            padding: '9px 14px',
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            color: 'var(--white)',
            fontSize: '13px',
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#454540' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            {search ? 'Arama sonucu bulunamadı.' : 'Henüz işletme yok.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['İşletme', 'Plan', 'Durum', 'Kayıt', 'Plan Değiştir', 'Durum Değiştir'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
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
              {filtered.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none', opacity: updating === b.id ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '30px', height: '30px', borderRadius: '3px',
                          background: 'var(--gold3)', border: '1px solid rgba(196,154,74,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: '700', color: 'var(--gold)', flexShrink: 0,
                        }}
                      >
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>{b.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>/{b.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><PlanBadge plan={b.plan} /></td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={b.status} /></td>
                  <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--muted)' }}>
                    {new Date(b.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={b.plan}
                      disabled={updating === b.id}
                      onChange={(e) => updatePlan(b.id, e.target.value as Business['plan'])}
                      style={{
                        padding: '4px 8px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '3px',
                        color: 'var(--white)',
                        fontSize: '11px',
                        cursor: updating === b.id ? 'wait' : 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="temel" style={{ background: '#F4F2EE' }}>Temel</option>
                      <option value="pro" style={{ background: '#F4F2EE' }}>Pro</option>
                      <option value="kurumsal" style={{ background: '#F4F2EE' }}>Kurumsal</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        disabled={b.status === 'aktif' || updating === b.id}
                        onClick={() => updateStatus(b.id, 'aktif')}
                        style={{
                          padding: '4px 10px',
                          background: 'transparent',
                          border: '1px solid rgba(74,196,120,0.3)',
                          borderRadius: '3px',
                          color: '#4ac478',
                          fontSize: '10px',
                          cursor: b.status === 'aktif' || updating === b.id ? 'not-allowed' : 'pointer',
                          opacity: b.status === 'aktif' ? 0.4 : 1,
                          fontWeight: '600',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Aktif Et
                      </button>
                      <button
                        disabled={b.status === 'askida' || updating === b.id}
                        onClick={() => updateStatus(b.id, 'askida')}
                        style={{
                          padding: '4px 10px',
                          background: 'transparent',
                          border: '1px solid rgba(196,74,74,0.3)',
                          borderRadius: '3px',
                          color: '#c44a4a',
                          fontSize: '10px',
                          cursor: b.status === 'askida' || updating === b.id ? 'not-allowed' : 'pointer',
                          opacity: b.status === 'askida' ? 0.4 : 1,
                          fontWeight: '600',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Askıya Al
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
