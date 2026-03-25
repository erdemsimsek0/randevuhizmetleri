'use client'

import { useState } from 'react'
import { currentBusiness } from '@/lib/mock-data'

const tabs = ['Genel', 'Çalışma Saatleri', 'Görünüm', 'Bildirimler']

const days = [
  { key: 'mon', label: 'Pazartesi' },
  { key: 'tue', label: 'Salı' },
  { key: 'wed', label: 'Çarşamba' },
  { key: 'thu', label: 'Perşembe' },
  { key: 'fri', label: 'Cuma' },
  { key: 'sat', label: 'Cumartesi' },
  { key: 'sun', label: 'Pazar' },
]

const defaultSchedule = {
  mon: { open: true, start: '09:00', end: '18:00' },
  tue: { open: true, start: '09:00', end: '18:00' },
  wed: { open: true, start: '09:00', end: '18:00' },
  thu: { open: true, start: '09:00', end: '18:00' },
  fri: { open: true, start: '09:00', end: '20:00' },
  sat: { open: true, start: '10:00', end: '17:00' },
  sun: { open: false, start: '10:00', end: '15:00' },
}

const accentColors = [
  '#c49a4a', '#6ab4e8', '#4ac478', '#c44a4a', '#9b6ae8', '#e8906a', '#e8c06a',
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  borderRadius: '3px',
  color: 'var(--white)',
  fontSize: '13px',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: '500',
  color: 'var(--muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '6px',
}

export default function AyarlarPage() {
  const [activeTab, setActiveTab] = useState('Genel')
  const [schedule, setSchedule] = useState(defaultSchedule)
  const [selectedColor, setSelectedColor] = useState('#c49a4a')
  const [logoDragOver, setLogoDragOver] = useState(false)
  const [coverDragOver, setCoverDragOver] = useState(false)
  const [form, setForm] = useState({
    name: currentBusiness.name,
    phone: currentBusiness.phone,
    address: currentBusiness.address,
    about: currentBusiness.about,
  })
  const [notifications, setNotifications] = useState({
    emailNew: true,
    emailCancel: true,
    smsNew: false,
    smsReminder: false,
    pushNew: true,
  })

  const toggleDay = (key: string) => {
    setSchedule((p) => ({
      ...p,
      [key]: { ...p[key as keyof typeof p], open: !p[key as keyof typeof p].open },
    }))
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '24px',
            color: 'var(--white)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          Ayarlar
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          İşletme bilgilerini ve tercihlerinizi yönetin
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '24px',
          background: 'var(--bg2)',
          border: '1px solid var(--line)',
          borderRadius: '3px',
          padding: '4px',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: activeTab === tab ? 'var(--bg3)' : 'transparent',
              border: activeTab === tab ? '1px solid var(--line2)' : '1px solid transparent',
              borderRadius: '2px',
              color: activeTab === tab ? 'var(--white)' : 'var(--muted)',
              fontSize: '12px',
              fontWeight: activeTab === tab ? '500' : '400',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Genel */}
      {activeTab === 'Genel' && (
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Logo Upload */}
          <div>
            <label style={labelStyle}>İşletme Logosu</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true) }}
              onDragLeave={() => setLogoDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setLogoDragOver(false) }}
              style={{
                height: '100px',
                background: logoDragOver ? 'var(--bg3)' : 'var(--bg)',
                border: `2px dashed ${logoDragOver ? 'var(--gold)' : 'var(--line2)'}`,
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--gold3)',
                  border: '1px solid var(--gold)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontFamily: 'DM Serif Display, serif',
                  color: 'var(--gold)',
                }}
              >
                {currentBusiness.logo}
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--white)', marginBottom: '2px' }}>
                  Logo yüklemek için tıklayın veya sürükleyin
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>PNG, JPG, SVG — Maks. 2MB</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>İşletme Adı</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Adres</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Hakkında</label>
            <textarea
              value={form.about}
              onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="İşletmeniz hakkında kısa bilgi..."
            />
          </div>

          <button
            style={{
              padding: '10px 20px',
              background: 'var(--white)',
              border: 'none',
              borderRadius: '3px',
              color: 'var(--bg)',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      )}

      {/* Tab: Çalışma Saatleri */}
      {activeTab === 'Çalışma Saatleri' && (
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          {days.map((day, i) => {
            const config = schedule[day.key as keyof typeof schedule]
            return (
              <div
                key={day.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 20px',
                  borderBottom: i < days.length - 1 ? '1px solid var(--line)' : 'none',
                  opacity: config.open ? 1 : 0.5,
                }}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleDay(day.key)}
                  style={{
                    width: '36px',
                    height: '20px',
                    borderRadius: '10px',
                    background: config.open ? 'var(--gold)' : 'var(--dim)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: config.open ? '18px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'var(--bg)',
                      transition: 'left 0.2s ease',
                    }}
                  />
                </button>

                {/* Day name */}
                <div style={{ width: '100px', fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>
                  {day.label}
                </div>

                {/* Times */}
                {config.open ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <input
                      type="time"
                      value={config.start}
                      onChange={(e) => setSchedule((p) => ({
                        ...p,
                        [day.key]: { ...p[day.key as keyof typeof p], start: e.target.value },
                      }))}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '2px',
                        color: 'var(--white)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>—</span>
                    <input
                      type="time"
                      value={config.end}
                      onChange={(e) => setSchedule((p) => ({
                        ...p,
                        [day.key]: { ...p[day.key as keyof typeof p], end: e.target.value },
                      }))}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '2px',
                        color: 'var(--white)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--muted)', flex: 1 }}>Kapalı</span>
                )}
              </div>
            )
          })}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
            <button
              style={{
                padding: '9px 18px',
                background: 'var(--white)',
                border: 'none',
                borderRadius: '3px',
                color: 'var(--bg)',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Çalışma Saatlerini Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Tab: Görünüm */}
      {activeTab === 'Görünüm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', marginBottom: '16px' }}>
              Vurgu Rengi
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {accentColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: color,
                    border: selectedColor === color ? `3px solid var(--white)` : '3px solid transparent',
                    cursor: 'pointer',
                    outline: selectedColor === color ? `2px solid ${color}` : 'none',
                    outlineOffset: '2px',
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px dashed var(--line2)',
                  background: 'var(--bg)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              />
            </div>
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '3px',
                  background: selectedColor,
                }}
              />
              <span style={{ fontSize: '12px', color: 'var(--white)' }}>Seçilen renk: </span>
              <span style={{ fontSize: '12px', color: selectedColor, fontWeight: '600' }}>{selectedColor}</span>
            </div>
          </div>

          {/* Cover Photo */}
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', marginBottom: '16px' }}>
              Kapak Fotoğrafı
            </h3>
            <div
              onDragOver={(e) => { e.preventDefault(); setCoverDragOver(true) }}
              onDragLeave={() => setCoverDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setCoverDragOver(false) }}
              style={{
                height: '160px',
                background: coverDragOver ? 'var(--bg3)' : 'var(--bg)',
                border: `2px dashed ${coverDragOver ? 'var(--gold)' : 'var(--line2)'}`,
                borderRadius: '3px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={coverDragOver ? 'var(--gold)' : 'var(--muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: coverDragOver ? 'var(--gold)' : 'var(--muted)' }}>
                  Kapak fotoğrafı yükle
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                  Önerilen boyut: 1200×400px
                </div>
              </div>
            </div>
          </div>

          <button
            style={{
              padding: '10px 20px',
              background: 'var(--white)',
              border: 'none',
              borderRadius: '3px',
              color: 'var(--bg)',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            Görünümü Kaydet
          </button>
        </div>
      )}

      {/* Tab: Bildirimler */}
      {activeTab === 'Bildirimler' && (
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          {[
            { key: 'emailNew', label: 'Yeni randevu — E-posta', desc: 'Müşteri randevu aldığında e-posta alın' },
            { key: 'emailCancel', label: 'İptal bildirimi — E-posta', desc: 'Randevu iptal edildiğinde e-posta alın' },
            { key: 'smsNew', label: 'Yeni randevu — SMS', desc: 'Müşteri randevu aldığında SMS alın' },
            { key: 'smsReminder', label: 'Randevu hatırlatma — SMS', desc: 'Müşterilere otomatik hatırlatma gönderin' },
            { key: 'pushNew', label: 'Anlık bildirim', desc: 'Tarayıcı push bildirimleri alın' },
          ].map((item, i) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: i < 4 ? '1px solid var(--line)' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)', marginBottom: '2px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.desc}</div>
              </div>
              <button
                onClick={() => setNotifications((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  background: notifications[item.key as keyof typeof notifications] ? 'var(--gold)' : 'var(--dim)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: notifications[item.key as keyof typeof notifications] ? '21px' : '3px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--bg)',
                    transition: 'left 0.2s ease',
                  }}
                />
              </button>
            </div>
          ))}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
            <button
              style={{
                padding: '9px 18px',
                background: 'var(--white)',
                border: 'none',
                borderRadius: '3px',
                color: 'var(--bg)',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Bildirimleri Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
