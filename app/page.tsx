'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const plans = [
  {
    id: 'temel',
    name: 'Temel',
    price: '₺299',
    period: '/ay',
    features: ['1 Personel', '50 Randevu/ay', 'Temel Raporlar', 'Online Randevu Sayfası'],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₺699',
    period: '/ay',
    features: ['5 Personel', 'Sınırsız Randevu', 'Gelişmiş Raporlar', 'SMS Bildirimleri', 'Email Bildirimleri'],
    highlight: true,
  },
  {
    id: 'kurumsal',
    name: 'Kurumsal',
    price: '₺1.499',
    period: '/ay',
    features: ['Sınırsız Personel', 'Sınırsız Randevu', 'Özel Entegrasyonlar', 'Öncelikli Destek', 'Özel Domain'],
    highlight: false,
  },
]

const features = [
  { icon: '📅', title: 'Kolay Randevu', desc: 'Müşteriler 7/24 online randevu alabilir' },
  { icon: '👥', title: 'Personel Yönetimi', desc: 'Ustalarınızı ve çalışanlarınızı kolayca yönetin' },
  { icon: '📧', title: 'Otomatik Bildirim', desc: 'Email ile anında randevu bildirimleri' },
  { icon: '📊', title: 'Gelir Takibi', desc: 'Günlük, haftalık gelir raporları' },
  { icon: '🔗', title: 'Özel Link', desc: 'işletmeniz.randevuhizmetleri.com' },
  { icon: '⚙️', title: 'Kolay Kurulum', desc: '5 dakikada kurulum, teknik bilgi gerektirmez' },
]

const businessTypes = [
  'Berber', 'Kuaför', 'Güzellik Salonu', 'Dövme Stüdyosu',
  'Spor Salonu', 'Masaj Merkezi', 'Diş Kliniği', 'Veteriner', '+ daha fazlası',
]

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })

    const handleScroll = () => setNavScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: 'var(--bg)', color: 'var(--white)', minHeight: '100vh' }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: navScrolled ? 'rgba(8,8,8,0.95)' : 'transparent',
        borderBottom: navScrolled ? '1px solid var(--line)' : '1px solid transparent',
        backdropFilter: navScrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '17px', color: 'var(--white)', fontWeight: '500' }}>
            randevu<em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>hizmetleri</em>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Özellikler', 'Fiyatlar'].map((item, i) => (
              <a
                key={item}
                href={i === 0 ? '#ozellikler' : '#fiyatlar'}
                style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--white)' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--muted)' }}
              >
                {item}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isLoggedIn ? (
              <Link
                href="/admin"
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--bg)',
                  background: 'var(--gold)',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  letterSpacing: '0.03em',
                }}
              >
                Panele Git
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--white)' }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--muted)' }}
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  style={{
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--bg)',
                    background: 'var(--gold)',
                    borderRadius: '3px',
                    textDecoration: 'none',
                    letterSpacing: '0.03em',
                  }}
                >
                  Ücretsiz Dene
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(196,154,74,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {/* Left: Copy */}
          <div style={{ flex: '1 1 400px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 12px',
              background: 'var(--gold3)',
              border: '1px solid rgba(196,154,74,0.25)',
              borderRadius: '20px',
              marginBottom: '28px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Türkiye&apos;nin Randevu Platformu
              </span>
            </div>

            <h1 style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: 'clamp(40px, 6vw, 64px)',
              color: 'var(--white)',
              lineHeight: '1.05',
              letterSpacing: '-0.03em',
              marginBottom: '24px',
            }}>
              İşletmenizin<br />
              <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Randevu</em> Sistemi
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '36px', maxWidth: '440px' }}>
              Berberden güzellik salonuna, spor salonundan dövme stüdyosuna — her işletmeye özel online randevu sayfası.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/register"
                style={{
                  padding: '13px 28px',
                  background: 'var(--gold)',
                  color: 'var(--bg)',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  letterSpacing: '0.03em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Ücretsiz Başla →
              </Link>
              <a
                href="#ozellikler"
                style={{
                  padding: '13px 28px',
                  background: 'transparent',
                  color: 'var(--white)',
                  border: '1px solid var(--line2)',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Demo İzle
              </a>
            </div>

            <div style={{ display: 'flex', gap: '28px', marginTop: '40px', flexWrap: 'wrap' }}>
              {[['500+', 'Aktif İşletme'], ['50K+', 'Randevu/ay'], ['4.9', 'Ortalama Puan']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gold)', fontFamily: 'DM Serif Display, serif' }}>{num}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '240px',
              height: '480px',
              background: 'var(--bg2)',
              border: '2px solid var(--line2)',
              borderRadius: '36px',
              padding: '12px',
              boxShadow: '0 0 60px rgba(196,154,74,0.12), 0 40px 80px rgba(0,0,0,0.6)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Phone notch */}
              <div style={{ width: '80px', height: '20px', background: 'var(--bg)', borderRadius: '10px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--line2)' }} />
              </div>
              {/* Booking UI mock */}
              <div style={{ padding: '0 4px' }}>
                {/* Nav bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '24px', height: '24px', background: 'var(--gold3)', border: '1px solid var(--gold)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'var(--gold)', fontWeight: '700' }}>B</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--white)' }}>Berber Ali</span>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ac478' }} />
                </div>
                {/* Service cards */}
                {[
                  { name: 'Saç Kesim', price: '₺150', min: '30 dk' },
                  { name: 'Saç + Sakal', price: '₺220', min: '45 dk' },
                  { name: 'Sakal Tıraş', price: '₺100', min: '20 dk' },
                ].map((s, i) => (
                  <div key={s.name} style={{
                    padding: '8px 10px',
                    background: i === 0 ? 'var(--bg3)' : 'var(--bg)',
                    border: `1px solid ${i === 0 ? 'var(--gold)' : 'var(--line)'}`,
                    borderRadius: '3px',
                    marginBottom: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: '600', color: 'var(--white)' }}>{s.name}</div>
                      <div style={{ fontSize: '8px', color: 'var(--muted)', marginTop: '1px' }}>{s.min}</div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--gold)' }}>{s.price}</span>
                  </div>
                ))}
                {/* Time slots */}
                <div style={{ marginTop: '12px', marginBottom: '8px', fontSize: '8px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saat Seçin</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px' }}>
                  {['10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00'].map((t, i) => (
                    <div key={t} style={{
                      padding: '5px 3px',
                      background: i === 2 ? 'var(--gold3)' : 'var(--bg)',
                      border: `1px solid ${i === 2 ? 'var(--gold)' : i === 0 || i === 4 ? 'var(--line)' : 'var(--line)'}`,
                      borderRadius: '2px',
                      textAlign: 'center',
                      fontSize: '7px',
                      fontWeight: i === 2 ? '700' : '400',
                      color: i === 2 ? 'var(--gold)' : i === 0 || i === 4 ? 'var(--muted)' : 'var(--white)',
                      opacity: i === 0 || i === 4 ? 0.4 : 1,
                      textDecoration: i === 0 || i === 4 ? 'line-through' : 'none',
                    }}>{t}</div>
                  ))}
                </div>
                {/* CTA button */}
                <div style={{ marginTop: '14px', padding: '9px', background: 'var(--gold)', borderRadius: '3px', textAlign: 'center', fontSize: '9px', fontWeight: '700', color: 'var(--bg)' }}>
                  Randevu Al
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="ozellikler" style={{ padding: '80px 24px', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Özellikler
            </div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--white)', letterSpacing: '-0.02em' }}>
              Neden <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>randevuhizmetleri</em>?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: '24px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  transition: 'border-color 0.2s, transform 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(196,154,74,0.4)'
                  el.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--line)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--white)', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BUSINESS TYPES ===== */}
      <section style={{ padding: '72px 24px', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(24px, 3.5vw, 36px)', color: 'var(--white)', letterSpacing: '-0.02em' }}>
              Her İşletme Türüne Uygun
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '12px' }}>
              Sektörünüz ne olursa olsun, randevuhizmetleri sizin için çalışır.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {businessTypes.map((type) => (
              <div
                key={type}
                style={{
                  padding: '9px 18px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--line)',
                  borderRadius: '24px',
                  fontSize: '13px',
                  color: 'var(--white)',
                  cursor: 'default',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--gold)'
                  el.style.color = 'var(--gold)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--line)'
                  el.style.color = 'var(--white)'
                }}
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="fiyatlar" style={{ padding: '80px 24px', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Fiyatlandırma
            </div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--white)', letterSpacing: '-0.02em' }}>
              Şeffaf Fiyatlandırma
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '12px' }}>
              14 gün ücretsiz deneyin. Kredi kartı gerekmez.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  padding: '28px',
                  background: plan.highlight ? 'var(--bg3)' : 'var(--bg2)',
                  border: `1px solid ${plan.highlight ? 'var(--gold)' : 'var(--line)'}`,
                  borderRadius: '4px',
                  position: 'relative',
                  transition: 'transform 0.2s',
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: 'absolute',
                    top: '-11px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '3px 14px',
                    background: 'var(--gold)',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: 'var(--bg)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    En Popüler
                  </div>
                )}

                <h3 style={{ fontSize: '18px', fontWeight: '600', color: plan.highlight ? 'var(--gold)' : 'var(--white)', marginBottom: '8px' }}>
                  {plan.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                  <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', color: 'var(--white)' }}>{plan.price}</span>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{plan.period}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px', marginBottom: '24px' }}>
                  {plan.features.map((feature) => (
                    <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="7" fill={plan.highlight ? 'rgba(196,154,74,0.15)' : 'var(--dim)'} />
                        <path d="M4 7l2 2 4-4" stroke={plan.highlight ? 'var(--gold)' : '#555'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '11px',
                    background: plan.highlight ? 'var(--gold)' : 'transparent',
                    border: `1px solid ${plan.highlight ? 'var(--gold)' : 'var(--line2)'}`,
                    borderRadius: '3px',
                    textAlign: 'center',
                    color: plan.highlight ? 'var(--bg)' : 'var(--white)',
                    fontSize: '13px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    letterSpacing: '0.03em',
                  }}
                >
                  Başla
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, rgba(196,154,74,0.08) 0%, rgba(196,154,74,0.03) 50%, rgba(196,154,74,0.08) 100%)',
        borderTop: '1px solid rgba(196,154,74,0.2)',
        borderBottom: '1px solid rgba(196,154,74,0.2)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: 'clamp(28px, 4vw, 44px)',
            color: 'var(--white)',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
          }}>
            Hemen Başlayın
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '32px' }}>
            14 gün ücretsiz deneyin, kredi kartı gerekmez.
          </p>
          <Link
            href="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 36px',
              background: 'var(--gold)',
              color: 'var(--bg)',
              borderRadius: '3px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '700',
              letterSpacing: '0.03em',
            }}
          >
            Ücretsiz Kayıt Ol →
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '15px', color: 'var(--white)', fontWeight: '500' }}>
              randevu<em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>hizmetleri</em>
            </span>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
              Türkiye&apos;nin randevu platformu
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Hakkımızda', 'Gizlilik', 'İletişim'].map((link) => (
              <a
                key={link}
                href="#"
                style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--white)' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--muted)' }}
              >
                {link}
              </a>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
            © 2026 randevuhizmetleri.com
          </p>
        </div>
      </footer>
    </div>
  )
}
