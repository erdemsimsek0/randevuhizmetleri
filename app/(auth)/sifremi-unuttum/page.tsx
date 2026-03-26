'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const siteUrl = window.location.origin

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/sifre-sifirla`,
    })

    setLoading(false)
    if (err) {
      setError('E-posta gönderilemedi. Adresi kontrol edip tekrar deneyin.')
      return
    }
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '3px',
    color: 'var(--white)', fontSize: '13px', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeUp 0.4s ease both' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'var(--gold3)', border: '1px solid rgba(196,154,74,0.3)', borderRadius: '4px', marginBottom: '20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', color: 'var(--white)', letterSpacing: '-0.01em' }}>randevu</span>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', fontStyle: 'italic', color: 'var(--gold)', letterSpacing: '-0.01em' }}>hizmetleri</span>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', color: 'var(--muted)', letterSpacing: '-0.01em' }}>.com</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '4px', padding: 'clamp(20px, 5vw, 32px)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(74,196,120,0.1)', border: '2px solid rgba(74,196,120,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ac478" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--white)', marginBottom: '10px' }}>E-posta Gönderildi</h1>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                <strong style={{ color: 'var(--white)' }}>{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.
              </p>
              <Link href="/login" style={{ fontSize: '13px', color: 'var(--gold)', textDecoration: 'none' }}>
                ← Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--white)', marginBottom: '6px' }}>Şifremi Unuttum</h1>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>
                E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
              </p>

              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: '3px', marginBottom: '16px', fontSize: '12px', color: '#c44a4a' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="isletme@domain.com"
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '11px 16px',
                    background: loading ? 'var(--dim)' : 'var(--white)',
                    border: 'none', borderRadius: '3px',
                    color: loading ? 'var(--muted)' : 'var(--bg)',
                    fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
                <Link href="/login" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>
                  ← Giriş sayfasına dön
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
