'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SifreSifirlaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase sets the session from the URL hash/code on load
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    // Also check if there's already a session (in case event already fired)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (err) {
      setError('Şifre güncellenemedi: ' + err.message)
      return
    }
    router.push('/login?reset=ok')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '3px',
    color: 'var(--white)', fontSize: '13px', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeUp 0.4s ease both' }}>

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
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--white)', marginBottom: '6px' }}>Yeni Şifre Belirle</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>
            Hesabınız için yeni bir şifre oluşturun.
          </p>

          {!ready && (
            <div style={{ padding: '12px', background: 'var(--gold3)', border: '1px solid rgba(196,154,74,0.3)', borderRadius: '3px', marginBottom: '16px', fontSize: '12px', color: 'var(--gold)' }}>
              Bağlantı doğrulanıyor...
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: '3px', marginBottom: '16px', fontSize: '12px', color: '#c44a4a' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Yeni Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !ready}
              style={{
                width: '100%', padding: '11px 16px',
                background: (loading || !ready) ? 'var(--dim)' : 'var(--white)',
                border: 'none', borderRadius: '3px',
                color: (loading || !ready) ? 'var(--muted)' : 'var(--bg)',
                fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: (loading || !ready) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
            <Link href="/login" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
