'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/lib/types'
import { sendStatusChangeNotification } from '@/app/actions/notifications'
import { createAppointment } from '@/app/actions/booking'

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
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [services, setServices] = useState<{id: string, name: string, duration: number, price: number}[]>([])
  const [staffList, setStaffList] = useState<{id: string, name: string}[]>([])
  const [addForm, setAddForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_id: '',
    staff_id: '',
    date: '',
    time: '',
    notes: '',
  })
  const [addError, setAddError] = useState<string | null>(null)
  const [addSaving, setAddSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
        setBusinessId(profile.business_id)
        await fetchAppointments(profile.business_id)

        const { data: svcData } = await supabase
          .from('services')
          .select('id, name, duration, price')
          .eq('business_id', profile.business_id)
          .order('name')
        setServices((svcData as {id: string, name: string, duration: number, price: number}[]) ?? [])

        const { data: staffData } = await supabase
          .from('staff')
          .select('id, name')
          .eq('business_id', profile.business_id)
          .order('name')
        setStaffList((staffData as {id: string, name: string}[]) ?? [])
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

    if (status === 'onaylandi' || status === 'iptal') {
      sendStatusChangeNotification(id, status).catch((err) =>
        console.error('[randevular] notification error:', err)
      )
    }
  }

  async function handleAddAppointment() {
    if (!businessId) return
    if (!addForm.customer_name.trim() || !addForm.customer_phone.trim()) {
      setAddError('Müşteri adı ve telefon zorunludur.')
      return
    }
    if (!addForm.service_id) {
      setAddError('Lütfen bir hizmet seçin.')
      return
    }
    if (!addForm.date || !addForm.time) {
      setAddError('Tarih ve saat zorunludur.')
      return
    }
    setAddSaving(true)
    setAddError(null)

    const result = await createAppointment({
      business_id: businessId,
      staff_id: addForm.staff_id || null,
      service_id: addForm.service_id,
      customer_name: addForm.customer_name.trim(),
      customer_phone: addForm.customer_phone.trim(),
      customer_email: addForm.customer_email.trim() || null,
      date: addForm.date,
      time: addForm.time,
      notes: addForm.notes.trim() || null,
    })

    if (result.error) {
      setAddError('Randevu eklenemedi: ' + result.error)
      setAddSaving(false)
      return
    }

    setAddSaving(false)
    setShowAddModal(false)
    setAddForm({ customer_name: '', customer_phone: '', customer_email: '', service_id: '', staff_id: '', date: '', time: '', notes: '' })
    await fetchAppointments(businessId)
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
    <div style={{ padding: isMobile ? '16px' : '32px 36px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Randevular
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {filtered.length} randevu
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '9px 16px',
            background: 'var(--gold)',
            border: 'none',
            borderRadius: '3px',
            color: 'var(--bg)',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            width: isMobile ? '100%' : 'auto',
          }}
        >
          + Randevu Ekle
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Müşteri, hizmet veya personel ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: isMobile ? '100%' : '260px', flex: isMobile ? '1 1 100%' : 1 }}
          onFocus={(e) => { e.target.style.borderColor = '#454540' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer', flex: isMobile ? '1 1 calc(50% - 6px)' : 'none' }}
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
            style={{ ...inputStyle, cursor: 'pointer', color: 'var(--muted)', background: 'transparent', flex: isMobile ? '1 1 calc(50% - 6px)' : 'none' }}
          >
            Temizle ✕
          </button>
        )}
      </div>

      {/* Table / Cards */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            {search || statusFilter ? 'Arama kriterlerine uygun randevu bulunamadı.' : 'Henüz randevu yok.'}
          </div>
        ) : isMobile ? (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((apt) => (
              <div key={apt.id} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>{apt.customer_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{apt.customer_phone}</div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--white)', marginBottom: '4px' }}>{apt.service?.name ?? '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--white)', fontWeight: '500' }}>{apt.date} · {String(apt.time).slice(0, 5)}</div>
                    {apt.staff?.name && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{apt.staff.name}</div>}
                  </div>
                  <select
                    value={apt.status}
                    disabled={updating === apt.id}
                    onChange={(e) => updateStatus(apt.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      background: 'var(--bg2)',
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center',
            padding: isMobile ? '0' : '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false) }}
        >
          <div style={{
            background: 'var(--bg2)',
            border: isMobile ? 'none' : '1px solid var(--line2)',
            borderRadius: isMobile ? '0' : '4px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '480px',
            height: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : '90vh',
            overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', color: 'var(--white)', margin: 0 }}>
                Yeni Randevu
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {addError && (
                <div style={{ padding: '10px 14px', background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: '3px', marginBottom: '16px', fontSize: '12px', color: '#c44a4a' }}>
                  {addError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Müşteri Adı *
                  </label>
                  <input
                    type="text"
                    value={addForm.customer_name}
                    onChange={(e) => setAddForm((p) => ({ ...p, customer_name: e.target.value }))}
                    placeholder="Ad Soyad"
                    style={{ ...inputStyle, width: '100%', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Telefon *
                  </label>
                  <input
                    type="text"
                    value={addForm.customer_phone}
                    onChange={(e) => setAddForm((p) => ({ ...p, customer_phone: e.target.value }))}
                    placeholder="0532 000 00 00"
                    style={{ ...inputStyle, width: '100%', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    E-posta <span style={{ fontWeight: '400', textTransform: 'none' }}>(isteğe bağlı)</span>
                  </label>
                  <input
                    type="email"
                    value={addForm.customer_email}
                    onChange={(e) => setAddForm((p) => ({ ...p, customer_email: e.target.value }))}
                    placeholder="ornek@email.com"
                    style={{ ...inputStyle, width: '100%', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Hizmet *
                  </label>
                  <select
                    value={addForm.service_id}
                    onChange={(e) => setAddForm((p) => ({ ...p, service_id: e.target.value }))}
                    style={{ ...inputStyle, width: '100%', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <option value="" style={{ background: '#111111' }}>Hizmet seçin...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id} style={{ background: '#111111' }}>
                        {s.name} — {s.duration} dk — ₺{Number(s.price).toLocaleString('tr-TR')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Personel
                  </label>
                  <select
                    value={addForm.staff_id}
                    onChange={(e) => setAddForm((p) => ({ ...p, staff_id: e.target.value }))}
                    style={{ ...inputStyle, width: '100%', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <option value="" style={{ background: '#111111' }}>Fark Etmez</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id} style={{ background: '#111111' }}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Tarih *
                    </label>
                    <input
                      type="date"
                      value={addForm.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setAddForm((p) => ({ ...p, date: e.target.value }))}
                      style={{ ...inputStyle, width: '100%', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Saat *
                    </label>
                    <input
                      type="time"
                      value={addForm.time}
                      step={1800}
                      onChange={(e) => setAddForm((p) => ({ ...p, time: e.target.value }))}
                      style={{ ...inputStyle, width: '100%', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Notlar <span style={{ fontWeight: '400', textTransform: 'none' }}>(isteğe bağlı)</span>
                  </label>
                  <textarea
                    value={addForm.notes}
                    onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Özel notlar..."
                    rows={3}
                    style={{ ...inputStyle, width: '100%', fontSize: '13px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowAddModal(false); setAddError(null) }}
                style={{
                  padding: '9px 18px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '3px',
                  color: 'var(--muted)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                İptal
              </button>
              <button
                onClick={handleAddAppointment}
                disabled={addSaving}
                style={{
                  padding: '9px 18px',
                  background: addSaving ? 'var(--dim)' : 'var(--gold)',
                  border: 'none',
                  borderRadius: '3px',
                  color: addSaving ? 'var(--muted)' : 'var(--bg)',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  cursor: addSaving ? 'wait' : 'pointer',
                }}
              >
                {addSaving ? 'Kaydediliyor...' : 'Randevu Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
