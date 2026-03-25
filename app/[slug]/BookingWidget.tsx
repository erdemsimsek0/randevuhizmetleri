'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Business, Service, Staff, WorkingHours } from '@/lib/types'
import { sendNewAppointmentNotification } from '@/app/actions/notifications'
import { createAppointment } from '@/app/actions/booking'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_active: boolean
}

interface Props {
  business: Business
  services: Service[]
  staff: Staff[]
  workingHours: WorkingHours[]
  products?: Product[]
}

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const MONTHS_FULL = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

function generateTimeSlots(openTime: string, closeTime: string, duration: number = 30): string[] {
  const slots: string[] = []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  let current = oh * 60 + om
  const end = ch * 60 + cm
  while (current + duration <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0')
    const m = (current % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += duration
  }
  return slots
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getNext7Days(): Date[] {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

export default function BookingWidget({ business, services, staff, workingHours, products = [] }: Props) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [confirmationId, setConfirmationId] = useState<string | null>(null)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  const supabase = createClient()
  const next7Days = getNext7Days()

  // Fetch booked slots when date/staff changes
  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    const dateStr = formatDate(selectedDate)

    let query = supabase
      .from('appointments')
      .select('time, staff_id')
      .eq('business_id', business.id)
      .eq('date', dateStr)
      .neq('status', 'iptal')

    if (selectedStaff) {
      query = query.eq('staff_id', selectedStaff.id)
    }

    query.then(({ data }) => {
      setBookedSlots((data ?? []).map((a) => String(a.time).slice(0, 5)))
      setLoadingSlots(false)
    })
  }, [selectedDate, selectedStaff, business.id, supabase])

  function getDayHours(d: Date): WorkingHours | null {
    return workingHours.find((h) => h.day === d.getDay()) ?? null
  }

  function isDayOpen(d: Date): boolean {
    const h = getDayHours(d)
    return h?.is_open ?? false
  }

  function getAllSlots(d: Date): string[] {
    const h = getDayHours(d)
    if (!h || !h.is_open) return []
    const duration = selectedService?.duration ?? 30
    return generateTimeSlots(h.open_time, h.close_time, duration)
  }

  async function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedTime) return
    if (!customerName.trim() || !customerPhone.trim()) {
      setBookingError('Ad ve telefon zorunludur.')
      return
    }

    setSubmitting(true)
    setBookingError(null)

    const result = await createAppointment({
      business_id: business.id,
      staff_id: selectedStaff?.id ?? null,
      service_id: selectedService.id,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || null,
      date: formatDate(selectedDate),
      time: selectedTime,
    })

    if (result.error || !result.data) {
      setBookingError('Randevu alınırken bir hata oluştu. Lütfen tekrar deneyin.')
      setSubmitting(false)
      return
    }

    const data = result.data

    setConfirmationId(data.id.slice(0, 8).toUpperCase())
    setConfirmed(true)
    setSubmitting(false)

    // Send email notification to business owner (fire-and-forget)
    sendNewAppointmentNotification(data.id).catch((err) =>
      console.error('[booking] notification error:', err)
    )
  }

  const progressSteps = [
    { n: 1, label: 'Hizmet' },
    { n: 2, label: 'Usta' },
    { n: 3, label: 'Tarih' },
    { n: 4, label: 'Bilgi' },
  ]

  const todayHours = workingHours.find((h) => h.is_open)
  const openTimeDisplay = workingHours
    .filter((h) => h.is_open)
    .map((h) => `${h.open_time}–${h.close_time}`)
    .slice(0, 1)[0] ?? '09:00–18:00'

  // Confirmed screen
  if (confirmed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '430px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
          <div
            style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              background: 'rgba(74,196,120,0.1)',
              border: '2px solid rgba(74,196,120,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ac478" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', color: 'var(--white)', marginBottom: '10px', letterSpacing: '-0.02em' }}>
            Randevu Alındı!
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '32px', lineHeight: '1.6' }}>
            {business.name} için randevunuz başarıyla oluşturuldu. İşletme size geri dönecektir.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Randevu Özeti</div>
            {[
              { label: 'Referans No', value: `#${confirmationId}` },
              { label: 'Hizmet', value: selectedService?.name },
              { label: 'Personel', value: selectedStaff?.name ?? 'Fark Etmez' },
              { label: 'Tarih', value: selectedDate ? `${selectedDate.getDate()} ${MONTHS_FULL[selectedDate.getMonth()]} ${selectedDate.getFullYear()}` : '' },
              { label: 'Saat', value: selectedTime },
              { label: 'Müşteri', value: customerName },
              { label: 'Telefon', value: customerPhone },
              ...(customerEmail.trim() ? [{ label: 'E-posta', value: customerEmail.trim() }] : []),
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ fontSize: '12px', color: 'var(--white)', fontWeight: '500' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--line)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Toplam</span>
              <span style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: '700' }}>₺{Number(selectedService?.price ?? 0).toLocaleString('tr-TR')}</span>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px',
              background: 'rgba(74,196,120,0.1)', border: '1px solid rgba(74,196,120,0.25)', borderRadius: '2px',
              fontSize: '11px', color: '#4ac478', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ac478', display: 'inline-block' }} />
            Onay Bekliyor
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', justifyContent: 'center', padding: '0' }}>
      <div style={{ width: '100%', maxWidth: '430px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Nav */}
        <nav style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                style={{ width: '32px', height: '32px', borderRadius: '3px', objectFit: 'cover', border: '1px solid var(--line2)' }}
              />
            ) : (
              <div
                style={{
                  width: '32px', height: '32px',
                  background: 'var(--gold3)', border: '1px solid var(--gold)',
                  borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '700', color: 'var(--gold)', fontFamily: 'DM Serif Display, serif',
                }}
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--white)' }}>{business.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(74,196,120,0.1)', border: '1px solid rgba(74,196,120,0.25)', borderRadius: '20px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ac478', display: 'inline-block', animation: 'blink 2s ease infinite' }} />
            <span style={{ fontSize: '11px', color: '#4ac478', fontWeight: '600' }}>Açık</span>
          </div>
        </nav>

        {/* Progress Bar */}
        <div style={{ padding: '16px 20px', background: 'var(--bg2)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {progressSteps.map((s, i) => {
              const done = step > s.n
              const active = step === s.n
              return (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <div
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: done ? 'var(--gold)' : active ? 'var(--bg3)' : 'var(--bg)',
                        border: `1px solid ${done || active ? 'var(--gold)' : 'var(--line2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: '700',
                        color: done ? 'var(--bg)' : active ? 'var(--gold)' : 'var(--muted)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : s.n}
                    </div>
                    <span style={{ fontSize: '9px', color: active ? 'var(--gold)' : done ? 'var(--gold)' : 'var(--muted)', fontWeight: active ? '600' : '400', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div style={{ flex: 1, height: '1px', background: step > s.n ? 'var(--gold)' : 'var(--line2)', transition: 'background 0.2s', marginBottom: '14px' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>

          {/* Hero (shown on step 1) */}
          {step === 1 && (
            <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease both' }}>

              {/* Logo + Business Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                {business.logo_url ? (
                  <div style={{
                    width: '72px', height: '72px', flexShrink: 0,
                    borderRadius: '4px', overflow: 'hidden',
                    border: '1px solid var(--line2)',
                    boxShadow: '0 0 0 1px rgba(196,154,74,0.15), 0 8px 32px rgba(0,0,0,0.5)',
                  }}>
                    <img src={business.logo_url} alt={business.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{
                    width: '72px', height: '72px', flexShrink: 0,
                    background: 'var(--gold3)', border: '1px solid rgba(196,154,74,0.4)',
                    borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 0 1px rgba(196,154,74,0.1), 0 8px 32px rgba(0,0,0,0.5)',
                  }}>
                    <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', color: 'var(--gold)', lineHeight: 1 }}>
                      {business.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Online Randevu
                  </div>
                  <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: '1.1', margin: 0 }}>
                    {business.name}
                  </h1>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {business.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ fontSize: '11px', color: 'var(--white)' }}>{business.address}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span style={{ fontSize: '11px', color: 'var(--white)' }}>{openTimeDisplay}</span>
                </div>
                {business.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span style={{ fontSize: '11px', color: 'var(--white)' }}>{business.phone}</span>
                  </div>
                )}
                {business.phone && (
                  <a
                    href={`https://wa.me/${business.phone.replace(/\D/g, '').replace(/^0/, '90')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                      background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '3px', textDecoration: 'none',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366" stroke="none">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                    <span style={{ fontSize: '11px', color: '#25D366' }}>WhatsApp</span>
                  </a>
                )}
                {business.instagram_url && (
                  <a
                    href={business.instagram_url.startsWith('http') ? business.instagram_url : `https://instagram.com/${business.instagram_url.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                      background: 'rgba(225,48,108,0.08)', border: '1px solid rgba(225,48,108,0.2)', borderRadius: '3px', textDecoration: 'none',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    <span style={{ fontSize: '11px', color: '#E1306C' }}>Instagram</span>
                  </a>
                )}
              </div>

              {business.about && (
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                  {business.about}
                </p>
              )}

              {/* Products Section */}
              {products.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.04em', marginBottom: '10px' }}>
                    Ürünlerimiz
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {products.map((p) => (
                      <div key={p.id}>
                        <div
                          onClick={() => setExpandedProduct(expandedProduct === p.id ? null : p.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                            background: 'var(--bg2)', border: `1px solid ${expandedProduct === p.id ? 'rgba(196,154,74,0.3)' : 'var(--line)'}`,
                            borderRadius: expandedProduct === p.id ? '3px 3px 0 0' : '3px',
                            cursor: 'pointer', transition: 'border-color 0.15s',
                          }}
                        >
                          {p.image_url && (
                            <img src={p.image_url} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '3px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--line2)' }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', marginBottom: '2px' }}>{p.name}</div>
                            {p.description && (
                              <div style={{ fontSize: '11px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gold)' }}>₺{Number(p.price).toLocaleString('tr-TR')}</span>
                            <svg
                              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              style={{ transition: 'transform 0.2s', transform: expandedProduct === p.id ? 'rotate(180deg)' : 'none' }}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        {expandedProduct === p.id && (
                          <div style={{
                            padding: '14px 14px 16px',
                            background: 'var(--bg3)', border: '1px solid rgba(196,154,74,0.3)', borderTop: 'none',
                            borderRadius: '0 0 3px 3px',
                          }}>
                            {p.image_url && (
                              <img src={p.image_url} alt={p.name} style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '3px', marginBottom: '12px', border: '1px solid var(--line2)' }} />
                            )}
                            {p.description && (
                              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>{p.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Service Selection */}
          {step === 1 && (
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.04em', marginBottom: '14px' }}>
                Hizmet Seçin
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {services.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Henüz hizmet eklenmemiş.</div>
                ) : services.map((svc) => {
                  const active = selectedService?.id === svc.id
                  return (
                    <div
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      style={{
                        padding: '14px 16px',
                        background: active ? 'var(--bg3)' : 'var(--bg2)',
                        border: `1px solid ${active ? 'var(--gold)' : 'var(--line)'}`,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: active ? 'var(--white)' : 'var(--white)', marginBottom: '4px' }}>
                          {svc.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {svc.duration} dakika
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gold)' }}>
                          ₺{Number(svc.price).toLocaleString('tr-TR')}
                        </span>
                        {active && (
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Staff Selection */}
          {step === 2 && (
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.04em', marginBottom: '14px' }}>
                Personel Seçin
              </div>

              {/* Any staff option */}
              <div
                onClick={() => setSelectedStaff(null)}
                style={{
                  padding: '14px 16px', marginBottom: '10px',
                  background: selectedStaff === null ? 'var(--bg3)' : 'var(--bg2)',
                  border: `1px solid ${selectedStaff === null ? 'var(--gold)' : 'var(--line)'}`,
                  borderRadius: '3px', cursor: 'pointer', transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'var(--dim)', border: '1px solid var(--line2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}
                >
                  ✨
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', marginBottom: '2px' }}>Fark Etmez</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>İlk uygun personel</div>
                </div>
                {selectedStaff === null && (
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              {staff.map((s) => {
                const active = selectedStaff?.id === s.id
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStaff(s)}
                    style={{
                      padding: '14px 16px', marginBottom: '10px',
                      background: active ? 'var(--bg3)' : 'var(--bg2)',
                      border: `1px solid ${active ? 'var(--gold)' : 'var(--line)'}`,
                      borderRadius: '3px', cursor: 'pointer', transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--dim)', border: `1px solid ${active ? 'var(--gold)' : 'var(--line2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: '700', color: 'var(--white)', flexShrink: 0,
                      }}
                    >
                      {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', marginBottom: '2px' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.role}</div>
                    </div>
                    {active && (
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* STEP 3: Date & Time */}
          {step === 3 && (
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>
              {/* Date Row */}
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.04em', marginBottom: '14px' }}>Tarih Seçin</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                {next7Days.map((d) => {
                  const open = isDayOpen(d)
                  const dateStr = formatDate(d)
                  const active = selectedDate ? formatDate(selectedDate) === dateStr : false
                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        if (!open) return
                        setSelectedDate(d)
                        setSelectedTime(null)
                      }}
                      style={{
                        minWidth: '52px',
                        padding: '10px 6px',
                        background: active ? 'var(--gold3)' : open ? 'var(--bg2)' : 'var(--bg)',
                        border: `1px solid ${active ? 'var(--gold)' : open ? 'var(--line)' : 'var(--line)'}`,
                        borderRadius: '3px',
                        cursor: open ? 'pointer' : 'not-allowed',
                        textAlign: 'center',
                        opacity: open ? 1 : 0.35,
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ fontSize: '9px', color: active ? 'var(--gold)' : 'var(--muted)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {DAYS_TR[d.getDay()]}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: active ? 'var(--gold)' : 'var(--white)', lineHeight: 1 }}>
                        {d.getDate()}
                      </div>
                      <div style={{ fontSize: '9px', color: active ? 'var(--gold)' : 'var(--muted)', marginTop: '3px' }}>
                        {MONTHS_TR[d.getMonth()]}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.04em', marginBottom: '14px' }}>Saat Seçin</div>
                  {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '12px' }}>Yükleniyor...</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {getAllSlots(selectedDate).length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '12px' }}>
                          Bu gün için uygun saat yok.
                        </div>
                      ) : getAllSlots(selectedDate).every((s) => bookedSlots.includes(s)) ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '12px' }}>
                          Bu gün tüm saatler dolu.
                        </div>
                      ) : getAllSlots(selectedDate).map((slot) => {
                        const isBooked = bookedSlots.includes(slot)
                        const active = selectedTime === slot
                        return (
                          <div
                            key={slot}
                            onClick={isBooked ? undefined : () => setSelectedTime(slot)}
                            style={{
                              padding: '10px 8px',
                              background: isBooked ? 'var(--bg)' : active ? 'var(--gold3)' : 'var(--bg2)',
                              border: `1px solid ${isBooked ? 'var(--line)' : active ? 'var(--gold)' : 'var(--line)'}`,
                              borderRadius: '3px',
                              cursor: isBooked ? 'not-allowed' : 'pointer',
                              textAlign: 'center',
                              fontSize: '13px',
                              fontWeight: active ? '700' : '500',
                              color: isBooked ? 'var(--muted)' : active ? 'var(--gold)' : 'var(--white)',
                              opacity: isBooked ? 0.45 : 1,
                              textDecoration: isBooked ? 'line-through' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {slot}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 4: Contact */}
          {step === 4 && (
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.04em', marginBottom: '14px' }}>İletişim Bilgileri</div>

              {bookingError && (
                <div style={{ padding: '10px 14px', background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: '3px', marginBottom: '16px', fontSize: '12px', color: '#c44a4a' }}>
                  {bookingError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    style={{
                      width: '100%', padding: '11px 14px',
                      background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px',
                      color: 'var(--white)', fontSize: '14px', outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--gold)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    E-posta <span style={{ color: 'var(--muted)', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(isteğe bağlı)</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    style={{
                      width: '100%', padding: '11px 14px',
                      background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px',
                      color: 'var(--white)', fontSize: '14px', outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--gold)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0532 000 00 00"
                    style={{
                      width: '100%', padding: '11px 14px',
                      background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px',
                      color: 'var(--white)', fontSize: '14px', outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--gold)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', padding: '16px', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Özet</div>
                {[
                  { label: 'Hizmet', value: selectedService?.name },
                  { label: 'Personel', value: selectedStaff?.name ?? 'Fark Etmez' },
                  { label: 'Tarih', value: selectedDate ? `${selectedDate.getDate()} ${MONTHS_FULL[selectedDate.getMonth()]}` : '' },
                  { label: 'Saat', value: selectedTime },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--white)', fontWeight: '500' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--line)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Toplam</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--gold)' }}>
                    ₺{Number(selectedService?.price ?? 0).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', background: 'var(--bg2)', position: 'sticky', bottom: 0 }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {step > 1 && (
              <button
                onClick={() => setStep((p) => p - 1)}
                style={{
                  flex: '0 0 auto',
                  padding: '12px 18px',
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '3px',
                  color: 'var(--muted)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ← Geri
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => {
                  if (step === 1 && !selectedService) return
                  if (step === 3 && (!selectedDate || !selectedTime)) return
                  setStep((p) => p + 1)
                }}
                disabled={(step === 1 && !selectedService) || (step === 3 && (!selectedDate || !selectedTime))}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: ((step === 1 && !selectedService) || (step === 3 && (!selectedDate || !selectedTime))) ? 'var(--dim)' : 'var(--gold)',
                  border: 'none',
                  borderRadius: '3px',
                  color: ((step === 1 && !selectedService) || (step === 3 && (!selectedDate || !selectedTime))) ? 'var(--muted)' : 'var(--bg)',
                  fontSize: '13px',
                  fontWeight: '600',
                  letterSpacing: '0.04em',
                  cursor: ((step === 1 && !selectedService) || (step === 3 && (!selectedDate || !selectedTime))) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {step === 2 ? 'Tarih Seç →' : step === 3 ? 'Bilgileri Gir →' : 'Devam Et →'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !customerName.trim() || !customerPhone.trim()}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: (submitting || !customerName.trim() || !customerPhone.trim()) ? 'var(--dim)' : 'var(--gold)',
                  border: 'none',
                  borderRadius: '3px',
                  color: (submitting || !customerName.trim() || !customerPhone.trim()) ? 'var(--muted)' : 'var(--bg)',
                  fontSize: '13px',
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  cursor: (submitting || !customerName.trim() || !customerPhone.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {submitting ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  'Randevu Al'
                )}
              </button>
            )}
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
