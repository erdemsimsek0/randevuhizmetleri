'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SuperAdminLoginPage() {
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
      } else {
        setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.')
      }
      setLoading(false)
      return
    }

    // Check if the user has superadmin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Kullanıcı bilgisi alınamadı.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'superadmin') {
      await supabase.auth.signOut()
      setError('Bu hesabın süper admin yetkisi yok.')
      setLoading(false)
      return
    }

    router.push('/superadmin')
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
          background: 'radial-gradient(circle, rgba(196,154,74,0.06) 0%, transparent 70%)',
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
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {/* SUPER ADMIN badge */}
          <div style={{ marginBottom: '16px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: 'rgba(196,154,74,0.15)',
                border: '1px solid rgba(196,154,74,0.4)',
                borderRadius: '2px',
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}
            >
              Super Admin
            </span>
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
            border: '1px solid rgba(196,154,74,0.2)',
            borderRadius: '4px',
            padding: '32px',
          }}
        >
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--white)', marginBottom: '6px', letterSpacing: '-0.01em' }}>
            Süper Admin Girişi
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Bu sayfa sadece platform yöneticileri içindir
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
                placeholder="admin@domain.com"
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
                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Şifre
              </label>
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
                  onFocus={(e) => { e.target.style.borderColor = 'var(--gold)' }}
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
                background: loading ? 'var(--dim)' : 'var(--gold)',
                border: 'none',
                borderRadius: '3px',
                color: loading ? 'var(--muted)' : 'var(--bg)',
                fontSize: '12px',
                fontWeight: '700',
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
            <Link href="/login" style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none' }}>
              İşletme girişi için tıklayın
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
