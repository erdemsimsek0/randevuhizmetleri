'use client'

import { useState } from 'react'
import { staff as staffData } from '@/lib/mock-data'

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="10" height="10" viewBox="0 0 24 24" fill={star <= Math.floor(rating) ? 'var(--gold)' : 'var(--dim)'} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ fontSize: '10px', color: 'var(--muted)', marginLeft: '2px' }}>{rating}</span>
    </div>
  )
}

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

export default function PersonelPage() {
  const [showModal, setShowModal] = useState(false)
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
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
            Personel
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {staffData.filter((s) => s.status === 'Aktif').length} aktif personel
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
          Personel Ekle
        </button>
      </div>

      {/* Staff Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {staffData.map((member) => (
          <div
            key={member.id}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '20px',
              position: 'relative',
            }}
          >
            {/* Status badge */}
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  background: member.status === 'Aktif' ? 'rgba(74,196,120,0.1)' : 'rgba(100,100,100,0.1)',
                  border: `1px solid ${member.status === 'Aktif' ? 'rgba(74,196,120,0.25)' : 'var(--line)'}`,
                  borderRadius: '2px',
                  fontSize: '9px',
                  fontWeight: '600',
                  color: member.status === 'Aktif' ? '#4ac478' : 'var(--muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: member.status === 'Aktif' ? '#4ac478' : 'var(--muted)',
                    display: 'inline-block',
                  }}
                />
                {member.status}
              </span>
            </div>

            {/* Avatar */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--dim)',
                border: '2px solid var(--line2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--white)',
                marginBottom: '14px',
              }}
            >
              {member.avatar}
            </div>

            {/* Info */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--white)', marginBottom: '3px' }}>
                {member.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gold)', marginBottom: '8px' }}>
                {member.role}
              </div>
              <StarRating rating={member.rating} />
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                padding: '12px 0',
                borderTop: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                marginBottom: '14px',
              }}
            >
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--white)', letterSpacing: '-0.02em' }}>
                  {member.appointmentsToday}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '1px' }}>Bugün</div>
              </div>
              <div style={{ width: '1px', background: 'var(--line)' }} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--white)', letterSpacing: '-0.02em' }}>
                  {member.rating}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '1px' }}>Puan</div>
              </div>
            </div>

            {/* Contact */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>{member.phone}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{member.email}</div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '7px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '2px',
                  color: 'var(--white)',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                Düzenle
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '7px',
                  background: 'rgba(196,74,74,0.08)',
                  border: '1px solid rgba(196,74,74,0.2)',
                  borderRadius: '2px',
                  color: '#c44a4a',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
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
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--white)' }}>Personel Ekle</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Ad Soyad</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff((p) => ({ ...p, name: e.target.value }))}
                  style={inputStyle}
                  placeholder="Personel adı"
                />
              </div>
              <div>
                <label style={labelStyle}>Unvan / Rol</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff((p) => ({ ...p, role: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Rol Seçin</option>
                  <option value="Berber">Berber</option>
                  <option value="Stilist">Stilist</option>
                  <option value="Teknisyen">Teknisyen</option>
                  <option value="Masör">Masör</option>
                  <option value="Tırnak Teknisyeni">Tırnak Teknisyeni</option>
                  <option value="Dövme Sanatçısı">Dövme Sanatçısı</option>
                  <option value="Yönetici">Yönetici</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Telefon</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff((p) => ({ ...p, phone: e.target.value }))}
                  style={inputStyle}
                  placeholder="05xx xxx xx xx"
                />
              </div>
              <div>
                <label style={labelStyle}>E-posta</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff((p) => ({ ...p, email: e.target.value }))}
                  style={inputStyle}
                  placeholder="personel@isletme.com"
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
                  Personel Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
