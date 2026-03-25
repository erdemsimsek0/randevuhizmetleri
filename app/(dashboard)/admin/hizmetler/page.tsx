'use client'

import { useState } from 'react'
import { services as servicesData } from '@/lib/mock-data'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  borderRadius: '3px',
  color: 'var(--white)',
  fontSize: '13px',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: '500',
  color: 'var(--muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '5px',
}

export default function HizmetlerPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newService, setNewService] = useState({
    name: '',
    duration: '',
    price: '',
    description: '',
    status: 'Aktif',
  })

  const openEdit = (id: string) => {
    const svc = servicesData.find((s) => s.id === id)
    if (svc) {
      setNewService({
        name: svc.name,
        duration: String(svc.duration),
        price: String(svc.price),
        description: svc.description || '',
        status: svc.status,
      })
      setEditingId(id)
      setShowModal(true)
    }
  }

  const openNew = () => {
    setNewService({ name: '', duration: '', price: '', description: '', status: 'Aktif' })
    setEditingId(null)
    setShowModal(true)
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: '900px' }}>
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
            Hizmetler
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {servicesData.filter((s) => s.status === 'Aktif').length} aktif hizmet
          </p>
        </div>
        <button
          onClick={openNew}
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
          Hizmet Ekle
        </button>
      </div>

      {/* Services Table */}
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
              {['Hizmet Adı', 'Süre', 'Ücret', 'Açıklama', 'Durum', 'İşlemler'].map((h) => (
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
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {servicesData.map((svc, i) => (
              <tr
                key={svc.id}
                style={{ borderBottom: i < servicesData.length - 1 ? '1px solid var(--line)' : 'none' }}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>
                    {svc.name}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span style={{ fontSize: '12px', color: 'var(--white)' }}>{svc.duration} dk</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gold)' }}>
                    ₺{svc.price}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--muted)', maxWidth: '200px' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {svc.description || '—'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      background: svc.status === 'Aktif' ? 'rgba(74,196,120,0.1)' : 'rgba(100,100,100,0.1)',
                      border: `1px solid ${svc.status === 'Aktif' ? 'rgba(74,196,120,0.25)' : 'var(--line)'}`,
                      borderRadius: '2px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: svc.status === 'Aktif' ? '#4ac478' : 'var(--muted)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {svc.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => openEdit(svc.id)}
                      style={{
                        padding: '5px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '2px',
                        color: 'var(--white)',
                        fontSize: '11px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      Düzenle
                    </button>
                    <button
                      style={{
                        padding: '5px 12px',
                        background: 'rgba(196,74,74,0.08)',
                        border: '1px solid rgba(196,74,74,0.2)',
                        borderRadius: '2px',
                        color: '#c44a4a',
                        fontSize: '11px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
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
              maxWidth: '420px',
              animation: 'fadeUp 0.25s ease both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--white)' }}>
                {editingId ? 'Hizmet Düzenle' : 'Yeni Hizmet'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Hizmet Adı</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
                  style={inputStyle}
                  placeholder="Örn: Saç Kesimi"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Süre (dk)</label>
                  <input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService((p) => ({ ...p, duration: e.target.value }))}
                    style={inputStyle}
                    placeholder="30"
                    min="5"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Ücret (₺)</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService((p) => ({ ...p, price: e.target.value }))}
                    style={inputStyle}
                    placeholder="150"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Açıklama</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Hizmet açıklaması..."
                />
              </div>
              <div>
                <label style={labelStyle}>Durum</label>
                <select
                  value={newService.status}
                  onChange={(e) => setNewService((p) => ({ ...p, status: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
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
                  {editingId ? 'Değişiklikleri Kaydet' : 'Hizmet Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
