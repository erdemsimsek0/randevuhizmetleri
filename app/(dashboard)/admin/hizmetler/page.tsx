'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/lib/types'

const EMPTY_FORM = { name: '', duration: 30, price: 0 }

export default function HizmetlerPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Service | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const fetchServices = useCallback(async (bId: string) => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', bId)
      .order('created_at', { ascending: true })
    setServices((data as Service[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
      if (profile?.business_id) {
        setBusinessId(profile.business_id)
        await fetchServices(profile.business_id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [supabase, fetchServices])

  function openAdd() {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setError(null)
    setShowModal(true)
  }

  function openEdit(s: Service) {
    setEditItem(s)
    setForm({ name: s.name, duration: s.duration, price: s.price })
    setError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditItem(null)
    setError(null)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Hizmet adı zorunludur.'); return }
    if (form.duration < 1) { setError('Süre en az 1 dakika olmalıdır.'); return }
    if (!businessId) return
    setSaving(true)
    setError(null)

    if (editItem) {
      const { error: err } = await supabase
        .from('services')
        .update({ name: form.name, duration: form.duration, price: form.price })
        .eq('id', editItem.id)
      if (err) { setError('Kaydedilemedi: ' + err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase
        .from('services')
        .insert({ business_id: businessId, name: form.name, duration: form.duration, price: form.price, is_active: true })
      if (err) { setError('Eklenemedi: ' + err.message); setSaving(false); return }
    }

    await fetchServices(businessId)
    setSaving(false)
    closeModal()
  }

  async function handleToggleActive(s: Service) {
    await supabase.from('services').update({ is_active: !s.is_active }).eq('id', s.id)
    setServices((prev) => prev.map((x) => x.id === s.id ? { ...x, is_active: !s.is_active } : x))
  }

  async function handleDelete(id: string) {
    await supabase.from('services').delete().eq('id', id)
    setServices((prev) => prev.filter((x) => x.id !== id))
    setDeleteConfirm(null)
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

  return (
    <div style={{ padding: isMobile ? '16px' : '32px 36px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Hizmetler
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{services.length} hizmet</p>
        </div>
        <button
          onClick={openAdd}
          style={{
            padding: '9px 18px',
            background: 'var(--gold)',
            border: 'none',
            borderRadius: '3px',
            color: 'var(--bg)',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Hizmet Ekle
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>Yükleniyor...</div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>
          Henüz hizmet yok. Yukarıdan ekleyebilirsiniz.
        </div>
      ) : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '480px' : 'auto' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Hizmet', 'Süre', 'Fiyat', 'Durum', 'İşlemler'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'var(--muted)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < services.length - 1 ? '1px solid var(--line)' : 'none', opacity: s.is_active ? 1 : 0.6 }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>{s.name}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--muted)' }}>
                    {s.duration} dk
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--gold)' }}>
                    ₺{Number(s.price).toLocaleString('tr-TR')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '2px',
                        background: s.is_active ? 'rgba(74,196,120,0.1)' : 'rgba(90,88,80,0.1)',
                        color: s.is_active ? '#4ac478' : 'var(--muted)',
                        border: `1px solid ${s.is_active ? 'rgba(74,196,120,0.25)' : 'var(--line)'}`,
                        fontWeight: '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {s.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openEdit(s)}
                        style={{
                          padding: '5px 10px',
                          background: 'transparent',
                          border: '1px solid var(--line)',
                          borderRadius: '3px',
                          color: 'var(--muted)',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleToggleActive(s)}
                        style={{
                          padding: '5px 10px',
                          background: 'transparent',
                          border: '1px solid var(--line)',
                          borderRadius: '3px',
                          color: 'var(--muted)',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        {s.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(s.id)}
                        style={{
                          padding: '5px 10px',
                          background: 'transparent',
                          border: '1px solid rgba(196,74,74,0.3)',
                          borderRadius: '3px',
                          color: '#c44a4a',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '28px', maxWidth: '360px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--white)', marginBottom: '12px' }}>Hizmeti Sil</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
              Bu hizmeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '3px', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer' }}>İptal</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '9px', background: 'rgba(196,74,74,0.15)', border: '1px solid rgba(196,74,74,0.3)', borderRadius: '3px', color: '#c44a4a', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', zIndex: 50, padding: isMobile ? '0' : '24px' }} onClick={closeModal}>
          <div style={{ background: 'var(--bg2)', border: isMobile ? 'none' : '1px solid var(--line)', borderRadius: isMobile ? '0' : '4px', padding: '28px', maxWidth: isMobile ? '100%' : '440px', width: '100%', height: isMobile ? '100%' : 'auto', maxHeight: isMobile ? '100%' : '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--white)', marginBottom: '24px' }}>
              {editItem ? 'Hizmeti Düzenle' : 'Yeni Hizmet'}
            </h3>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: '3px', marginBottom: '16px', fontSize: '12px', color: '#c44a4a' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Hizmet Adı</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Örn: Saç Kesimi" style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Süre (Dakika)</label>
                  <input type="number" value={form.duration} min={1} onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))} style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
                </div>
                <div>
                  <label style={labelStyle}>Fiyat (₺)</label>
                  <input type="number" value={form.price} min={0} step={0.01} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '3px', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer' }}>İptal</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', background: saving ? 'var(--dim)' : 'var(--gold)', border: 'none', borderRadius: '3px', color: saving ? 'var(--muted)' : 'var(--bg)', fontSize: '12px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Kaydediliyor...' : editItem ? 'Kaydet' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
