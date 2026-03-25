'use client'

import { useState } from 'react'
import { appointments, staff, services } from '@/lib/mock-data'
import type { AppointmentStatus } from '@/lib/mock-data'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    'Onaylandı': { bg: 'rgba(74,196,120,0.1)', color: '#4ac478', border: 'rgba(74,196,120,0.25)' },
    'Bekliyor': { bg: 'var(--gold3)', color: 'var(--gold)', border: 'rgba(196,154,74,0.25)' },
    'İptal': { bg: 'rgba(196,74,74,0.1)', color: '#c44a4a', border: 'rgba(196,74,74,0.25)' },
    'Tamamlandı': { bg: 'rgba(100,100,100,0.1)', color: 'var(--muted)', border: 'var(--line)' },
  }
  const c = colors[status] || colors['Tamamlandı']
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
      {status}
    </span>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--bg2)',
  border: '1px solid var(--line)',
  borderRadius: '3px',
  color: 'var(--white)',
  fontSize: '12px',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--bg2)',
  border: '1px solid var(--line)',
  borderRadius: '3px',
  color: 'var(--white)',
  fontSize: '12px',
  outline: 'none',
  cursor: 'pointer',
}

export default function RandevularPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tümü')
  const [staffFilter, setStaffFilter] = useState('Tümü')
  const [showModal, setShowModal] = useState(false)
  const [newApt, setNewApt] = useState({
    customerName: '',
    customerPhone: '',
    service: '',
    staff: '',
    date: '',
    time: '',
    notes: '',
  })

  const filtered = appointments.filter((a) => {
    const matchSearch =
      search === '' ||
      a.customerName.toLowerCase().includes(search.toLowerCase()) ||
      a.service.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Tümü' || a.status === statusFilter
    const matchStaff = staffFilter === 'Tümü' || a.staff === staffFilter
    return matchSearch && matchStatus && matchStaff
  })

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: '24px',
              color: 'var(--white)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Randevular
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {appointments.length} toplam randevu
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
            background: 'var(--white)',
            border: 'none',
            borderRadius: '3px',
            color: 'var(--bg)',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Randevu Ekle
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
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
            placeholder="Müşteri veya hizmet ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '34px', width: '100%' }}
          />
        </div>
        <input
          type="date"
          style={inputStyle}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="Tümü">Tüm Durumlar</option>
          <option value="Onaylandı">Onaylandı</option>
          <option value="Bekliyor">Bekliyor</option>
          <option value="İptal">İptal</option>
          <option value="Tamamlandı">Tamamlandı</option>
        </select>
        <select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="Tümü">Tüm Personel</option>
          {staff.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
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
              {['Müşteri', 'Hizmet', 'Personel', 'Tarih / Saat', 'Ücret', 'Durum', 'İşlemler'].map((h) => (
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
                  Randevu bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((apt, i) => (
                <tr
                  key={apt.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>
                      {apt.customerName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{apt.customerPhone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--white)' }}>
                    {apt.service}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--muted)' }}>
                    {apt.staff}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--white)' }}>{apt.time}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{apt.date}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--white)' }}>
                    ₺{apt.price}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={apt.status} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {apt.status === 'Bekliyor' && (
                        <button
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(74,196,120,0.1)',
                            border: '1px solid rgba(74,196,120,0.25)',
                            borderRadius: '2px',
                            color: '#4ac478',
                            fontSize: '10px',
                            fontWeight: '600',
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                          }}
                        >
                          Onayla
                        </button>
                      )}
                      <button
                        style={{
                          padding: '4px 10px',
                          background: 'var(--bg)',
                          border: '1px solid var(--line)',
                          borderRadius: '2px',
                          color: 'var(--muted)',
                          fontSize: '10px',
                          fontWeight: '600',
                          letterSpacing: '0.04em',
                          cursor: 'pointer',
                        }}
                      >
                        Düzenle
                      </button>
                      {apt.status !== 'İptal' && (
                        <button
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(196,74,74,0.08)',
                            border: '1px solid rgba(196,74,74,0.2)',
                            borderRadius: '2px',
                            color: '#c44a4a',
                            fontSize: '10px',
                            fontWeight: '600',
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                          }}
                        >
                          İptal
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

      {/* Add Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '4px',
              padding: '28px',
              width: '100%',
              maxWidth: '480px',
              animation: 'fadeUp 0.25s ease both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--white)' }}>Yeni Randevu</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Müşteri Adı
                  </label>
                  <input
                    type="text"
                    value={newApt.customerName}
                    onChange={(e) => setNewApt((p) => ({ ...p, customerName: e.target.value }))}
                    style={{ ...inputStyle, width: '100%', background: 'var(--bg)' }}
                    placeholder="Ad Soyad"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={newApt.customerPhone}
                    onChange={(e) => setNewApt((p) => ({ ...p, customerPhone: e.target.value }))}
                    style={{ ...inputStyle, width: '100%', background: 'var(--bg)' }}
                    placeholder="05xx xxx xx xx"
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Hizmet
                </label>
                <select
                  value={newApt.service}
                  onChange={(e) => setNewApt((p) => ({ ...p, service: e.target.value }))}
                  style={{ ...selectStyle, width: '100%', background: 'var(--bg)' }}
                >
                  <option value="">Hizmet Seçin</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>{s.name} — ₺{s.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Personel
                </label>
                <select
                  value={newApt.staff}
                  onChange={(e) => setNewApt((p) => ({ ...p, staff: e.target.value }))}
                  style={{ ...selectStyle, width: '100%', background: 'var(--bg)' }}
                >
                  <option value="">Personel Seçin</option>
                  {staff.filter((s) => s.status === 'Aktif').map((s) => (
                    <option key={s.id} value={s.name}>{s.name} — {s.role}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={newApt.date}
                    onChange={(e) => setNewApt((p) => ({ ...p, date: e.target.value }))}
                    style={{ ...inputStyle, width: '100%', background: 'var(--bg)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Saat
                  </label>
                  <input
                    type="time"
                    value={newApt.time}
                    onChange={(e) => setNewApt((p) => ({ ...p, time: e.target.value }))}
                    style={{ ...inputStyle, width: '100%', background: 'var(--bg)' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Notlar
                </label>
                <textarea
                  value={newApt.notes}
                  onChange={(e) => setNewApt((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  style={{ ...inputStyle, width: '100%', background: 'var(--bg)', resize: 'vertical' }}
                  placeholder="Opsiyonel not..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    color: 'var(--muted)',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  İptal
                </button>
                <button
                  style={{
                    flex: 2,
                    padding: '10px',
                    background: 'var(--white)',
                    border: 'none',
                    borderRadius: '3px',
                    color: 'var(--bg)',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}
                >
                  Randevu Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
