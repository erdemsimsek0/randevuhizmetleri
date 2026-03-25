'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Business, WorkingHours } from '@/lib/types'

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

export default function AyarlarPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [hours, setHours] = useState<WorkingHours[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingHours, setSavingHours] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '', about: '' })

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
    if (!profile?.business_id) { setLoading(false); return }

    const [{ data: biz }, { data: wh }] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', profile.business_id).single(),
      supabase.from('working_hours').select('*').eq('business_id', profile.business_id).order('day'),
    ])

    if (biz) {
      setBusiness(biz as Business)
      setForm({ name: biz.name, phone: biz.phone ?? '', address: biz.address ?? '', about: biz.about ?? '' })
    }

    if (wh && wh.length > 0) {
      setHours(wh as WorkingHours[])
    } else if (profile.business_id) {
      // Create default hours if none exist
      const defaults = Array.from({ length: 7 }, (_, i) => ({
        business_id: profile.business_id,
        day: i as 0|1|2|3|4|5|6,
        is_open: i !== 0,
        open_time: '09:00',
        close_time: '18:00',
      }))
      setHours(defaults as WorkingHours[])
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSaveBusiness() {
    if (!business) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    const { error: err } = await supabase
      .from('businesses')
      .update({ name: form.name, phone: form.phone || null, address: form.address || null, about: form.about || null })
      .eq('id', business.id)

    if (err) {
      setError('Kaydedilemedi: ' + err.message)
    } else {
      setSuccess('İşletme bilgileri kaydedildi.')
    }
    setSaving(false)
  }

  async function handleSaveHours() {
    if (!business) return
    setSavingHours(true)
    setError(null)
    setSuccess(null)

    for (const h of hours) {
      if (h.id) {
        await supabase
          .from('working_hours')
          .update({ is_open: h.is_open, open_time: h.open_time, close_time: h.close_time })
          .eq('id', h.id)
      } else {
        await supabase
          .from('working_hours')
          .insert({ business_id: business.id, day: h.day, is_open: h.is_open, open_time: h.open_time, close_time: h.close_time })
      }
    }

    setSuccess('Çalışma saatleri kaydedildi.')
    setSavingHours(false)
    await fetchData()
  }

  function updateHour(day: number, field: keyof WorkingHours, value: string | boolean) {
    setHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, [field]: value } : h))
    )
  }

  const inputStyle: React.CSSProperties = {
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

  const sectionStyle: React.CSSProperties = {
    background: 'var(--bg2)',
    border: '1px solid var(--line)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '20px',
  }

  const sectionHeaderStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderBottom: '1px solid var(--line)',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--white)',
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 36px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
        Yükleniyor...
      </div>
    )
  }

  if (!business) {
    return (
      <div style={{ padding: '32px 36px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
        İşletme bulunamadı.
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Ayarlar
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>İşletme bilgileri ve çalışma saatleri</p>
      </div>

      {success && (
        <div style={{ padding: '10px 14px', background: 'rgba(74,196,120,0.1)', border: '1px solid rgba(74,196,120,0.25)', borderRadius: '3px', marginBottom: '20px', fontSize: '12px', color: '#4ac478' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: '3px', marginBottom: '20px', fontSize: '12px', color: '#c44a4a' }}>
          {error}
        </div>
      )}

      {/* Business Info */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>İşletme Bilgileri</div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>İşletme Adı</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
          </div>
          <div>
            <label style={labelStyle}>URL Slug</label>
            <div style={{ padding: '10px 12px', background: 'var(--dim)', border: '1px solid var(--line)', borderRadius: '3px', fontSize: '12px', color: 'var(--muted)' }}>
              randevuhizmetleri.com/{business.slug} — (değiştirilemez)
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="0212 555 00 00" style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
            </div>
            <div>
              <label style={labelStyle}>Plan</label>
              <div style={{ padding: '10px 12px', background: 'var(--dim)', border: '1px solid var(--line)', borderRadius: '3px', fontSize: '12px', color: 'var(--gold)', textTransform: 'capitalize' }}>
                {business.plan}
              </div>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Adres</label>
            <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Mahalle, ilçe, şehir" style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
          </div>
          <div>
            <label style={labelStyle}>Hakkında</label>
            <textarea
              value={form.about}
              onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
              placeholder="İşletmeniz hakkında kısa bilgi..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
              onFocus={(e) => { e.target.style.borderColor = '#454540' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
            />
          </div>

          <button
            onClick={handleSaveBusiness}
            disabled={saving}
            style={{
              alignSelf: 'flex-start',
              padding: '9px 20px',
              background: saving ? 'var(--dim)' : 'var(--gold)',
              border: 'none',
              borderRadius: '3px',
              color: saving ? 'var(--muted)' : 'var(--bg)',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Working Hours */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Çalışma Saatleri</div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 7 }, (_, i) => {
              const h = hours.find((x) => x.day === i)
              if (!h) return null
              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 40px 1fr 16px 1fr',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    opacity: h.is_open ? 1 : 0.5,
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--white)', fontWeight: '500' }}>{DAYS[i]}</span>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                    <input
                      type="checkbox"
                      checked={h.is_open}
                      onChange={(e) => updateHour(i, 'is_open', e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--gold)' }}
                    />
                  </label>
                  <input
                    type="time"
                    value={h.open_time}
                    disabled={!h.is_open}
                    onChange={(e) => updateHour(i, 'open_time', e.target.value)}
                    style={{
                      padding: '6px 10px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--line)',
                      borderRadius: '3px',
                      color: 'var(--white)',
                      fontSize: '12px',
                      outline: 'none',
                      colorScheme: 'dark',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>—</span>
                  <input
                    type="time"
                    value={h.close_time}
                    disabled={!h.is_open}
                    onChange={(e) => updateHour(i, 'close_time', e.target.value)}
                    style={{
                      padding: '6px 10px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--line)',
                      borderRadius: '3px',
                      color: 'var(--white)',
                      fontSize: '12px',
                      outline: 'none',
                      colorScheme: 'dark',
                    }}
                  />
                </div>
              )
            })}
          </div>

          <button
            onClick={handleSaveHours}
            disabled={savingHours}
            style={{
              marginTop: '16px',
              padding: '9px 20px',
              background: savingHours ? 'var(--dim)' : 'var(--gold)',
              border: 'none',
              borderRadius: '3px',
              color: savingHours ? 'var(--muted)' : 'var(--bg)',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              cursor: savingHours ? 'not-allowed' : 'pointer',
            }}
          >
            {savingHours ? 'Kaydediliyor...' : 'Saatleri Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
