'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.')
      } else if (authError.message.includes('Email not confirmed')) {
        setError('E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.')
      } else {
        setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.')
      }
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(196,154,74,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          animation: 'fadeUp 0.4s ease both',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              background: 'var(--gold3)',
              border: '1px solid rgba(196,154,74,0.3)',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="14" x2="8" y2="14" />
              <line x1="12" y1="14" x2="12" y2="14" />
              <line x1="16" y1="14" x2="16" y2="14" />
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', color: 'var(--white)', letterSpacing: '-0.01em' }}>
              randevu
            </span>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', fontStyle: 'italic', color: 'var(--gold)', letterSpacing: '-0.01em' }}>
              hizmetleri
            </span>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', color: 'var(--muted)', letterSpacing: '-0.01em' }}>
              .com
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '4px',
            padding: 'clamp(20px, 5vw, 32px)',
          }}
        >
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--white)', marginBottom: '6px', letterSpacing: '-0.01em' }}>
            Giriş Yap
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>
            Hesabınıza erişmek için bilgilerinizi girin.
          </p>

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
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: 'var(--muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="isletme@domain.com"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: '3px',
                  color: 'var(--white)',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Şifre
                </label>
                <a href="#" style={{ fontSize: '11px', color: 'var(--gold)', textDecoration: 'none' }}>
                  Şifremi Unuttum
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    color: 'var(--white)',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                background: loading ? 'var(--dim)' : 'var(--white)',
                border: 'none',
                borderRadius: '3px',
                color: loading ? 'var(--muted)' : 'var(--bg)',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Giriş Yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Hesabınız yok mu?{' '}
            </span>
            <Link href="/register" style={{ fontSize: '13px', color: 'var(--gold)', textDecoration: 'none', fontWeight: '500' }}>
              Hesap Oluştur
            </Link>
          </div>
        </div>

        {/* Super admin link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            href="/superadmin-login"
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Süper Admin? Buradan giriş yap
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
