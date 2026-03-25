'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/lib/types'
import { sendStatusChangeNotification } from '@/app/actions/notifications'

type AppointmentWithJoins = Appointment & {
  service?: { name: string } | null
  staff?: { name: string } | null
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'bekliyor', label: 'Bekliyor' },
  { value: 'onaylandi', label: 'Onaylandı' },
  { value: 'tamamlandi', label: 'Tamamlandı' },
  { value: 'iptal', label: 'İptal' },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    bekliyor: { bg: 'var(--gold3)', color: 'var(--gold)', border: 'rgba(196,154,74,0.25)', label: 'Bekliyor' },
    onaylandi: { bg: 'rgba(74,196,120,0.1)', color: '#4ac478', border: 'rgba(74,196,120,0.25)', label: 'Onaylandı' },
    iptal: { bg: 'rgba(196,74,74,0.1)', color: '#c44a4a', border: 'rgba(196,74,74,0.25)', label: 'İptal' },
    tamamlandi: { bg: 'rgba(100,149,237,0.1)', color: '#6ab4e8', border: 'rgba(100,149,237,0.25)', label: 'Tamamlandı' },
  }
  const c = map[status] || map['bekliyor']
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '2px',
        fontSize: '10px',
        fontWeight: '600',
        color: c.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {c.label}
    </span>
  )
}

export default function RandevularPage() {
  const [appointments, setAppointments] = useState<AppointmentWithJoins[]>([])
  const [filtered, setFiltered] = useState<AppointmentWithJoins[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const supabase = createClient()

  const fetchAppointments = useCallback(async (bId: string) => {
    const { data } = await supabase
      .from('appointments')
      .select('*, service:services(name), staff:staff(name)')
      .eq('business_id', bId)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    setAppointments((data as AppointmentWithJoins[]) ?? [])
    setFiltered((data as AppointmentWithJoins[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', user.id)
        .single()

      if (profile?.business_id) {
        await fetchAppointments(profile.business_id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [supabase, fetchAppointments])

  useEffect(() => {
    let result = appointments
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.customer_name.toLowerCase().includes(q) ||
          a.customer_phone.includes(q) ||
          (a.service?.name ?? '').toLowerCase().includes(q) ||
          (a.staff?.name ?? '').toLowerCase().includes(q)
      )
    }
    if (statusFilter) {
      result = result.filter((a) => a.status === statusFilter)
    }
    setFiltered(result)
  }, [search, statusFilter, appointments])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: status as Appointment['status'] } : a))
    )
    setUpdating(null)

    // Send email notification for confirmed/cancelled status changes
    if (status === 'onaylandi' || status === 'iptal') {
      sendStatusChangeNotification(id, status).catch((err) =>
        console.error('[randevular] notification error:', err)
      )
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    background: 'var(--bg)',
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
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Randevular
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {filtered.length} randevu
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Müşteri, hizmet veya personel ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: '260px', flex: 1 }}
          onFocus={(e) => { e.target.style.borderColor = '#454540' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#111111' }}>
              {opt.label}
            </option>
          ))}
        </select>
        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('') }}
            style={{ ...inputStyle, cursor: 'pointer', color: 'var(--muted)', background: 'transparent' }}
          >
            Temizle ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            {search || statusFilter ? 'Arama kriterlerine uygun randevu bulunamadı.' : 'Henüz randevu yok.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Müşteri', 'Hizmet', 'Personel', 'Tarih / Saat', 'Durum', 'İşlem'].map((h) => (
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
              {filtered.map((apt, i) => (
                <tr
                  key={apt.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>{apt.customer_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{apt.customer_phone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--white)' }}>
                    {apt.service?.name ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--muted)' }}>
                    {apt.staff?.name ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--white)', fontWeight: '500' }}>{apt.date}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{String(apt.time).slice(0, 5)}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={apt.status} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={apt.status}
                      disabled={updating === apt.id}
                      onChange={(e) => updateStatus(apt.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '3px',
                        color: 'var(--white)',
                        fontSize: '11px',
                        cursor: updating === apt.id ? 'wait' : 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="bekliyor" style={{ background: '#111111' }}>Bekliyor</option>
                      <option value="onaylandi" style={{ background: '#111111' }}>Onaylandı</option>
                      <option value="tamamlandi" style={{ background: '#111111' }}>Tamamlandı</option>
                      <option value="iptal" style={{ background: '#111111' }}>İptal</option>
                    </select>
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
