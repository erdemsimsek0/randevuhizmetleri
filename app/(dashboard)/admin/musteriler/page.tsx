'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CustomerAppointment {
  id: string
  date: string
  time: string
  status: string
  service: { name: string; price: number } | null
  staff: { name: string } | null
}

interface Customer {
  name: string
  phone: string
  email: string | null
  appointments: CustomerAppointment[]
  totalSpent: number
  lastDate: string
}

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${day} ${MONTHS_TR[month - 1]} ${year}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    bekliyor: { bg: 'var(--gold3)', color: 'var(--gold)', border: 'rgba(196,154,74,0.25)', label: 'Bekliyor' },
    onaylandi: { bg: 'rgba(74,196,120,0.1)', color: '#4ac478', border: 'rgba(74,196,120,0.25)', label: 'Onaylandı' },
    iptal: { bg: 'rgba(196,74,74,0.1)', color: '#c44a4a', border: 'rgba(196,74,74,0.25)', label: 'İptal' },
    tamamlandi: { bg: 'rgba(100,149,237,0.1)', color: '#6ab4e8', border: 'rgba(100,149,237,0.25)', label: 'Tamamlandı' },
  }
  const c = map[status] || map['bekliyor']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '2px', fontSize: '10px', fontWeight: '600', color: c.color, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  )
}

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [businessSlug, setBusinessSlug] = useState<string>('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
      if (!profile?.business_id) { setLoading(false); return }

      const { data: biz } = await supabase.from('businesses').select('slug').eq('id', profile.business_id).single()
      if (biz?.slug) setBusinessSlug(biz.slug)

      const { data } = await supabase
        .from('appointments')
        .select('id, customer_name, customer_phone, customer_email, date, time, status, service:services(name, price), staff:staff(name)')
        .eq('business_id', profile.business_id)
        .neq('status', 'iptal')
        .order('date', { ascending: false })

      if (!data) { setLoading(false); return }

      // Aggregate by phone
      const map = new Map<string, Customer>()
      for (const row of data) {
        const phone = row.customer_phone
        const appt: CustomerAppointment = {
          id: row.id,
          date: row.date,
          time: row.time,
          status: row.status,
          service: Array.isArray(row.service) ? (row.service[0] ?? null) : (row.service as { name: string; price: number } | null),
          staff: Array.isArray(row.staff) ? (row.staff[0] ?? null) : (row.staff as { name: string } | null),
        }
        const price = appt.service?.price ?? 0
        if (map.has(phone)) {
          const existing = map.get(phone)!
          existing.appointments.push(appt)
          existing.totalSpent += price
          if (row.date > existing.lastDate) existing.lastDate = row.date
        } else {
          map.set(phone, {
            name: row.customer_name,
            phone,
            email: row.customer_email ?? null,
            appointments: [appt],
            totalSpent: price,
            lastDate: row.date,
          })
        }
      }

      setCustomers(Array.from(map.values()).sort((a, b) => b.lastDate.localeCompare(a.lastDate)))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1100px', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--white)', margin: 0, fontFamily: 'DM Serif Display, serif', letterSpacing: '-0.02em' }}>
            Müşteriler
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0' }}>Randevu geçmişi olan tüm müşteriler</p>
        </div>
        {!loading && (
          <span style={{ marginLeft: 'auto', padding: '4px 12px', background: 'var(--gold3)', border: '1px solid rgba(196,154,74,0.25)', borderRadius: '2px', fontSize: '12px', fontWeight: '600', color: 'var(--gold)' }}>
            {filtered.length} müşteri
          </span>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="İsim veya telefon ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '360px', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', color: 'var(--white)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--gold)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
          {search ? 'Arama sonucu bulunamadı.' : 'Henüz müşteri yok.'}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div style={{ display: 'block', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Müşteri', 'Telefon', 'E-posta', 'Randevu', 'Son Randevu', 'Toplam Harcama', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.phone} style={{ borderBottom: '1px solid var(--line)', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg2)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                  >
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--white)' }}>{c.name}</span>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--muted)', fontFamily: 'monospace', fontSize: '12px' }}>{c.phone}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--muted)', fontSize: '12px' }}>{c.email || '—'}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ padding: '2px 10px', background: 'var(--gold3)', border: '1px solid rgba(196,154,74,0.2)', borderRadius: '2px', fontSize: '11px', fontWeight: '600', color: 'var(--gold)' }}>
                        {c.appointments.length}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(c.lastDate)}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--gold)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      {c.totalSpent.toLocaleString('tr-TR')} ₺
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        style={{ padding: '5px 14px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '2px', color: 'var(--muted)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)' }}
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedCustomer && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCustomer(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '6px', width: '100%', maxWidth: '640px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--white)', fontFamily: 'DM Serif Display, serif' }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{selectedCustomer.phone}{selectedCustomer.email ? ` · ${selectedCustomer.email}` : ''}</div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '20px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>×</button>
            </div>

            {/* Stats */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', display: 'flex', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Randevu Sayısı</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gold)' }}>{selectedCustomer.appointments.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Toplam Harcama</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gold)' }}>{selectedCustomer.totalSpent.toLocaleString('tr-TR')} ₺</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Son Randevu</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--white)', marginTop: '4px' }}>{formatDate(selectedCustomer.lastDate)}</div>
              </div>
            </div>

            {/* Appointments list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {selectedCustomer.appointments.map((appt) => (
                <div key={appt.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)', marginBottom: '3px' }}>
                      {appt.service?.name ?? '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {formatDate(appt.date)} · {String(appt.time).slice(0, 5)}{appt.staff ? ` · ${appt.staff.name}` : ''}
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                  {appt.service?.price != null && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                      {appt.service.price.toLocaleString('tr-TR')} ₺
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)' }}>
              {businessSlug && (
                <a
                  href={`/${businessSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'var(--gold3)', border: '1px solid rgba(196,154,74,0.3)', borderRadius: '3px', color: 'var(--gold)', fontSize: '12px', fontWeight: '600', textDecoration: 'none', letterSpacing: '0.04em' }}
                >
                  Randevu Al
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          table thead { display: none; }
          table tr { display: block; background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; margin-bottom: 10px; padding: 12px; }
          table td { display: flex; justify-content: space-between; padding: 5px 0 !important; font-size: 12px !important; }
          table td::before { content: attr(data-label); font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
        }
      `}</style>
    </div>
  )
}
