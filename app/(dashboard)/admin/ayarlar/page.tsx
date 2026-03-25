'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Business, WorkingHours } from '@/lib/types'
import { BUSINESS_TYPES } from '@/lib/business-types'

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

export default function AyarlarPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [hours, setHours] = useState<WorkingHours[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingHours, setSavingHours] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '', about: '', business_type: 'diger' })

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false)
  const [logoDragOver, setLogoDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setForm({
        name: biz.name,
        phone: biz.phone ?? '',
        address: biz.address ?? '',
        about: biz.about ?? '',
        business_type: biz.business_type ?? 'diger',
      })
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
      .update({
        name: form.name,
        phone: form.phone || null,
        address: form.address || null,
        about: form.about || null,
        business_type: form.business_type,
      })
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

  async function handleLogoFile(file: File) {
    if (!business) return

    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir görsel dosyası seçin.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Dosya boyutu en fazla 2MB olabilir.')
      return
    }

    setLogoUploading(true)
    setError(null)
    setLogoUploadSuccess(false)

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const path = `${business.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Logo yüklenemedi: ' + uploadError.message)
      setLogoUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
    const publicUrl = urlData.publicUrl

    const { error: updateError } = await supabase
      .from('businesses')
      .update({ logo_url: publicUrl })
      .eq('id', business.id)

    if (updateError) {
      setError('Logo URL kaydedilemedi: ' + updateError.message)
    } else {
      setBusiness((prev) => prev ? { ...prev, logo_url: publicUrl } : prev)
      setLogoUploadSuccess(true)
      setTimeout(() => setLogoUploadSuccess(false), 3000)
    }

    setLogoUploading(false)
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleLogoFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setLogoDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleLogoFile(file)
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

          {/* Logo Upload */}
          <div>
            <label style={labelStyle}>Logo</label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {business.logo_url && (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '3px',
                    border: '1px solid var(--line)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={business.logo_url}
                    alt="Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div
                  onClick={() => !logoUploading && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true) }}
                  onDragLeave={() => setLogoDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    padding: '20px',
                    background: logoDragOver ? 'rgba(196,154,74,0.06)' : 'var(--bg)',
                    border: `1px dashed ${logoDragOver ? 'var(--gold)' : logoUploading ? 'var(--line2)' : 'var(--line2)'}`,
                    borderRadius: '3px',
                    textAlign: 'center',
                    cursor: logoUploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {logoUploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Yükleniyor...</span>
                    </div>
                  ) : logoUploadSuccess ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ac478" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ fontSize: '12px', color: '#4ac478' }}>Logo yüklendi!</span>
                    </div>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={logoDragOver ? 'var(--gold)' : 'var(--muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <div style={{ fontSize: '12px', color: logoDragOver ? 'var(--gold)' : 'var(--muted)' }}>
                        Sürükle & bırak veya tıkla
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px', opacity: 0.7 }}>
                        Görsel dosyası — maks. 2MB
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

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
          <div>
            <label style={labelStyle}>İşletme Türü</label>
            <select
              value={form.business_type}
              onChange={(e) => setForm((p) => ({ ...p, business_type: e.target.value }))}
              style={{
                ...inputStyle,
                appearance: 'none',
                cursor: 'pointer',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)' }}
            >
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>{bt.label}</option>
              ))}
            </select>
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

      {/* Notifications */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Bildirimler</div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ padding: '12px 16px', background: 'var(--bg)', border: '1px solid rgba(196,154,74,0.2)', borderRadius: '3px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--white)', fontWeight: '500', marginBottom: '3px' }}>E-posta bildirimleri aktif</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.6' }}>
                Bildirimler hesabınıza kayıtlı e-posta adresine gönderilir:{' '}
                <span style={{ color: 'var(--gold)' }}>{business?.name ? `${business.name} hesabı` : '—'}</span>
              </div>
            </div>
          </div>

          {[
            { label: 'Yeni randevu bildirimi al', desc: 'Yeni bir randevu oluşturulduğunda e-posta alırsınız.' },
            { label: 'Müşterilere onay emaili gönder', desc: 'Randevu onaylandığında müşteriye bildirim gönderilir.' },
            { label: 'Müşterilere iptal emaili gönder', desc: 'Randevu iptal edildiğinde müşteriye bildirim gönderilir.' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '14px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '3px',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', color: 'var(--white)', fontWeight: '500', marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.desc}</div>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  width: '36px',
                  height: '20px',
                  background: 'rgba(196,154,74,0.15)',
                  border: '1px solid rgba(196,154,74,0.35)',
                  borderRadius: '10px',
                  position: 'relative',
                  cursor: 'default',
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    background: 'var(--gold)',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    transition: 'right 0.2s',
                  }}
                />
              </div>
            </div>
          ))}

          <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0, lineHeight: '1.6' }}>
            Bildirim tercihleri yakında özelleştirilebilir olacak. Şu anda tüm bildirimler aktiftir.
          </p>
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
