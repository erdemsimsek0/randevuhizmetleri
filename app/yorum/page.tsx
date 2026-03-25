'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitReview } from '@/app/actions/review'

function YorumContent() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('id') ?? ''

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    if (!appointmentId) { setError('Geçersiz yorum bağlantısı.'); return }
    if (rating === 0) { setError('Lütfen bir puan seçin.'); return }
    if (phone.length !== 4 || !/^\d{4}$/.test(phone)) { setError('Lütfen telefon numaranızın son 4 hanesini girin.'); return }

    setLoading(true)
    setError(null)

    // Fetch appointment to get businessId and customerName
    const supabase = createClient()
    const { data: appt } = await supabase
      .from('appointments')
      .select('business_id, customer_name')
      .eq('id', appointmentId)
      .single()

    if (!appt) {
      setError('Randevu bulunamadı.')
      setLoading(false)
      return
    }

    const result = await submitReview({
      appointmentId,
      businessId: appt.business_id as string,
      customerName: appt.customer_name as string,
      rating,
      comment: comment.trim() || undefined,
      phone,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--bg2)',
    border: '1px solid var(--line)',
    borderRadius: '3px',
    color: 'var(--white)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'DM Sans, sans-serif',
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

        {success ? (
          /* Success screen */
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s ease both' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--gold3)',
                border: '2px solid rgba(196,154,74,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '28px',
              }}
            >
              ★
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
              Teşekkürler!
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6' }}>
              Yorumunuz için teşekkür ederiz. Geri bildiriminiz işletmeye iletildi.
            </p>
          </div>
        ) : (
          /* Review form */
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
                Deneyiminizi Paylaşın
              </h1>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--muted)',
                  lineHeight: '1.6',
                  marginBottom: '28px',
                  textAlign: 'center',
                }}
              >
                Randevunuz hakkındaki düşüncelerinizi bizimle paylaşın.
              </p>

              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(196,74,74,0.1)',
                    border: '1px solid rgba(196,74,74,0.25)',
                    borderRadius: '3px',
                    marginBottom: '20px',
                    fontSize: '12px',
                    color: '#c44a4a',
                    textAlign: 'center',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Star rating */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    textAlign: 'center',
                  }}
                >
                  Puanınız
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= (hoverRating || rating)
                    return (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '36px',
                          color: filled ? 'var(--gold)' : 'var(--dim)',
                          cursor: 'pointer',
                          padding: '0 2px',
                          lineHeight: 1,
                          transition: 'color 0.1s, transform 0.1s',
                          transform: filled ? 'scale(1.1)' : 'scale(1)',
                        }}
                        aria-label={`${star} yıldız`}
                      >
                        ★
                      </button>
                    )
                  })}
                </div>
                {rating > 0 && (
                  <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: 'var(--gold)' }}>
                    {['', 'Çok kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'][rating]}
                  </div>
                )}
              </div>

              {/* Comment */}
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
                  }}
                >
                  Yorumunuz (isteğe bağlı)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Deneyiminizi kısaca anlatın..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--gold)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>

              {/* Phone verification */}
              <div style={{ marginBottom: '24px' }}>
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
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.3em', fontWeight: '700', fontSize: '16px' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--gold)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || rating === 0 || phone.length !== 4}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: (loading || rating === 0 || phone.length !== 4) ? 'var(--dim)' : 'var(--gold)',
                  border: 'none',
                  borderRadius: '3px',
                  color: (loading || rating === 0 || phone.length !== 4) ? 'var(--muted)' : '#0c0c0b',
                  fontSize: '13px',
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  cursor: (loading || rating === 0 || phone.length !== 4) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? 'Gönderiliyor...' : 'Gönder'}
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

export default function YorumPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Yükleniyor...</span>
      </div>
    }>
      <YorumContent />
    </Suspense>
  )
}
