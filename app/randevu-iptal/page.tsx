'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { cancelAppointmentByToken } from '@/app/actions/cancel-appointment'

function RandevuIptalContent() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('id') ?? ''

  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState(false)

  async function handleCancel() {
    if (!appointmentId) {
      setError('Geçersiz randevu bağlantısı.')
      return
    }
    if (phone.length !== 4 || !/^\d{4}$/.test(phone)) {
      setError('Lütfen 4 haneli bir numara girin.')
      return
    }
    setLoading(true)
    setError(null)

    const result = await cancelAppointmentByToken(appointmentId, phone)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setCancelled(true)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--bg2)',
    border: '1px solid var(--line)',
    borderRadius: '3px',
    color: 'var(--white)',
    fontSize: '16px',
    outline: 'none',
    textAlign: 'center',
    letterSpacing: '0.3em',
    fontWeight: '700',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <div style={{ maxWidth: '430px', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '20px', color: 'var(--white)', fontWeight: '500' }}>
            randevu<em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>hizmetleri</em>
          </span>
        </div>

        {cancelled ? (
          /* Success screen */
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s ease both' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(196,74,74,0.1)',
                border: '2px solid rgba(196,74,74,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c44a4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: '26px',
                color: 'var(--white)',
                marginBottom: '12px',
                letterSpacing: '-0.02em',
              }}
            >
              Randevunuz İptal Edildi
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '32px' }}>
              Randevunuz başarıyla iptal edildi. Daha sonra tekrar randevu alabilirsiniz.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'rgba(196,74,74,0.1)',
                border: '1px solid rgba(196,74,74,0.25)',
                borderRadius: '2px',
                fontSize: '11px',
                color: '#c44a4a',
                fontWeight: '600',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#c44a4a',
                  display: 'inline-block',
                }}
              />
              İptal Edildi
            </div>
          </div>
        ) : (
          /* Cancel form */
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <div
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: '4px',
                padding: '32px',
              }}
            >
              <h1
                style={{
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: '24px',
                  color: 'var(--white)',
                  marginBottom: '10px',
                  letterSpacing: '-0.02em',
                  textAlign: 'center',
                }}
              >
                Randevu İptali
              </h1>

              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--muted)',
                  lineHeight: '1.6',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                Randevunuzu iptal etmek için telefon numaranızın son 4 hanesini girin.
              </p>

              {appointmentId && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg3)',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Randevu No
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--white)', fontWeight: '600', fontFamily: 'monospace' }}>
                    #{appointmentId.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(196,74,74,0.1)',
                    border: '1px solid rgba(196,74,74,0.25)',
                    borderRadius: '3px',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#c44a4a',
                    textAlign: 'center',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    textAlign: 'center',
                  }}
                >
                  Telefon Son 4 Hane
                </label>
                <input
                  type="number"
                  value={phone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setPhone(v)
                  }}
                  placeholder="_ _ _ _"
                  maxLength={4}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--gold)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>

              <button
                onClick={handleCancel}
                disabled={loading || phone.length !== 4}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: (loading || phone.length !== 4) ? 'var(--dim)' : '#c44a4a',
                  border: 'none',
                  borderRadius: '3px',
                  color: (loading || phone.length !== 4) ? 'var(--muted)' : '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  cursor: (loading || phone.length !== 4) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? 'İşleniyor...' : 'İptali Onayla'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  )
}

export default function RandevuIptalPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Yükleniyor...</span>
      </div>
    }>
      <RandevuIptalContent />
    </Suspense>
  )
}
