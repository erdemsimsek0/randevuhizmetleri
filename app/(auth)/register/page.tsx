'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const plans = [
  {
    id: 'temel',
    name: 'Temel',
    price: '₺299',
    period: '/ay',
    features: ['1 Personel', '50 Randevu/ay', 'Temel Raporlar'],
    color: 'var(--muted)',
    borderColor: 'var(--line)',
    activeBorder: 'var(--line2)',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₺699',
    period: '/ay',
    features: ['5 Personel', 'Sınırsız Randevu', 'Gelişmiş Raporlar', 'SMS Bildirimleri'],
    color: 'var(--gold)',
    borderColor: 'rgba(196,154,74,0.3)',
    activeBorder: 'var(--gold)',
    popular: true,
  },
  {
    id: 'kurumsal',
    name: 'Kurumsal',
    price: '₺1.499',
    period: '/ay',
    features: ['Sınırsız Personel', 'Sınırsız Randevu', 'Özel Entegrasyonlar', 'Öncelikli Destek'],
    color: 'var(--white)',
    borderColor: 'var(--line2)',
    activeBorder: 'var(--white)',
  },
]

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  }
  return text
    .split('')
    .map((c) => trMap[c] ?? c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function RegisterPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--bg)',
    border: '1px solid var(--line)',
    borderRadius: '3px',
    color: 'var(--white)',
    fontSize: '13px',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (form.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    if (!form.businessName.trim()) {
      setError('İşletme adı zorunludur.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const slug = slugify(form.businessName)

    // 1. Sign up
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.ownerName,
          role: 'isletme',
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.')
      } else {
        setError('Kayıt sırasında bir hata oluştu: ' + signUpError.message)
      }
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // 2. Insert business
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: form.businessName,
        slug,
        owner_id: userId,
        phone: form.phone || null,
        plan: selectedPlan,
        status: 'aktif',
      })
      .select()
      .single()

    if (businessError) {
      setError('İşletme oluşturulurken bir hata oluştu: ' + businessError.message)
      setLoading(false)
      return
    }

    const businessId = businessData.id

    // 3. Update profile with business_id
    await supabase
      .from('profiles')
      .update({ business_id: businessId })
      .eq('id', userId)

    // 4. Insert default working hours (Mon-Sat open, Sun closed)
    const workingHours = [
      { business_id: businessId, day: 0, is_open: false, open_time: '09:00', close_time: '18:00' },
      { business_id: businessId, day: 1, is_open: true, open_time: '09:00', close_time: '18:00' },
      { business_id: businessId, day: 2, is_open: true, open_time: '09:00', close_time: '18:00' },
      { business_id: businessId, day: 3, is_open: true, open_time: '09:00', close_time: '18:00' },
      { business_id: businessId, day: 4, is_open: true, open_time: '09:00', close_time: '18:00' },
      { business_id: businessId, day: 5, is_open: true, open_time: '09:00', close_time: '18:00' },
      { business_id: businessId, day: 6, is_open: true, open_time: '09:00', close_time: '18:00' },
    ]
    await supabase.from('working_hours').insert(workingHours)

    // 5. Insert 3 default services
    const defaultServices = [
      { business_id: businessId, name: 'Saç Kesimi', duration: 30, price: 150, is_active: true },
      { business_id: businessId, name: 'Sakal Tıraş', duration: 20, price: 120, is_active: true },
      { business_id: businessId, name: 'Saç + Sakal', duration: 45, price: 250, is_active: true },
    ]
    await supabase.from('services').insert(defaultServices)

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
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '520px', animation: 'fadeUp 0.4s ease both' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', color: 'var(--white)' }}>randevu</span>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', fontStyle: 'italic', color: 'var(--gold)' }}>hizmetleri</span>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', color: 'var(--muted)' }}>.com</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>İşletmenizi platforma kaydedin</p>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '32px' }}>
          <h1 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--white)', marginBottom: '24px' }}>
            Kayıt Ol
          </h1>

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
            {/* Business Name + Owner Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>İşletme Adı</label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  placeholder="Örn: Bella Kuaför"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
                {form.businessName && (
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
                    URL: /{slugify(form.businessName)}
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Sahip Adı</label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => update('ownerName', e.target.value)}
                  placeholder="Ad Soyad"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>E-posta</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="info@isletme.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Telefon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="0212 555 00 00"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>
            </div>

            {/* Password + Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Şifre</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Şifre Tekrar</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>Plan Seçin</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {plans.map((plan) => {
                  const active = selectedPlan === plan.id
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      style={{
                        padding: '14px 12px',
                        background: active ? 'var(--bg3)' : 'var(--bg)',
                        border: `1px solid ${active ? plan.activeBorder : plan.borderColor}`,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {plan.popular && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--gold)',
                            color: 'var(--bg)',
                            fontSize: '8px',
                            fontWeight: '700',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            padding: '2px 6px',
                            borderRadius: '2px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Popüler
                        </div>
                      )}
                      <div style={{ fontSize: '12px', fontWeight: '600', color: active ? plan.color : 'var(--muted)', marginBottom: '6px', letterSpacing: '0.04em' }}>
                        {plan.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: active ? plan.color : 'var(--white)' }}>{plan.price}</span>
                        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{plan.period}</span>
                      </div>
                      {plan.features.map((f) => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                          <span style={{ color: active ? plan.color : 'var(--dim)', fontSize: '10px' }}>—</span>
                          <span style={{ fontSize: '10px', color: active ? 'var(--white)' : 'var(--muted)' }}>{f}</span>
                        </div>
                      ))}
                      {active && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: plan.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                })}
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
                  Kayıt Yapılıyor...
                </>
              ) : (
                `Kayıt Ol — ${plans.find((p) => p.id === selectedPlan)?.name} Plan`
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Hesabınız var mı? </span>
            <Link href="/login" style={{ fontSize: '13px', color: 'var(--gold)', textDecoration: 'none', fontWeight: '500' }}>
              Giriş Yap
            </Link>
          </div>
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
