'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Staff } from '@/lib/types'

const EMPTY_FORM = { name: '', role: 'Uzman', avatar_url: '' }

export default function PersonelPage() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Staff | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchStaff = useCallback(async (bId: string) => {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', bId)
      .order('created_at', { ascending: true })
    setStaffList((data as Staff[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
      if (profile?.business_id) {
        setBusinessId(profile.business_id)
        await fetchStaff(profile.business_id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [supabase, fetchStaff])

  function openAdd() {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setError(null)
    setShowModal(true)
  }

  function openEdit(s: Staff) {
    setEditItem(s)
    setForm({ name: s.name, role: s.role, avatar_url: s.avatar_url ?? '' })
    setError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditItem(null)
    setError(null)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('İsim zorunludur.'); return }
    if (!businessId) return
    setSaving(true)
    setError(null)

    if (editItem) {
      const { error: err } = await supabase
        .from('staff')
        .update({ name: form.name, role: form.role, avatar_url: form.avatar_url || null })
        .eq('id', editItem.id)
      if (err) { setError('Kaydedilemedi: ' + err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase
        .from('staff')
        .insert({ business_id: businessId, name: form.name, role: form.role, avatar_url: form.avatar_url || null, is_active: true })
      if (err) { setError('Eklenemedi: ' + err.message); setSaving(false); return }
    }

    await fetchStaff(businessId)
    setSaving(false)
    closeModal()
  }

  async function handleToggleActive(s: Staff) {
    await supabase.from('staff').update({ is_active: !s.is_active }).eq('id', s.id)
    setStaffList((prev) => prev.map((x) => x.id === s.id ? { ...x, is_active: !s.is_active } : x))
  }

  async function handleDelete(id: string) {
    await supabase.from('staff').delete().eq('id', id)
    setStaffList((prev) => prev.filter((x) => x.id !== id))
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
    <div style={{ padding: '32px 36px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Personel
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{staffList.length} personel</p>
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
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Personel Ekle
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>Yükleniyor...</div>
      ) : staffList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>
          Henüz personel yok. Yukarıdan ekleyebilirsiniz.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {staffList.map((s) => (
            <div
              key={s.id}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: '3px',
                padding: '20px',
                opacity: s.is_active ? 1 : 0.6,
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--dim)',
                    border: '1px solid var(--line2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--white)',
                    flexShrink: 0,
                  }}
                >
                  {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--white)', marginBottom: '2px' }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.role}</div>
                </div>
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
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openEdit(s)}
                  style={{
                    flex: 1,
                    padding: '7px',
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    color: 'var(--muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Düzenle
                </button>
                <button
                  onClick={() => handleToggleActive(s)}
                  style={{
                    flex: 1,
                    padding: '7px',
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
                    padding: '7px 10px',
                    background: 'transparent',
                    border: '1px solid rgba(196,74,74,0.3)',
                    borderRadius: '3px',
                    color: '#c44a4a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px',
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '4px',
              padding: '28px', maxWidth: '360px', width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--white)', marginBottom: '12px' }}>
              Personeli Sil
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
              Bu personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '3px', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, padding: '9px', background: 'rgba(196,74,74,0.15)', border: '1px solid rgba(196,74,74,0.3)', borderRadius: '3px', color: '#c44a4a', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '4px',
              padding: '28px', maxWidth: '440px', width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--white)', marginBottom: '24px' }}>
              {editItem ? 'Personeli Düzenle' : 'Yeni Personel'}
            </h3>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: '3px', marginBottom: '16px', fontSize: '12px', color: '#c44a4a' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Ad Soyad</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Personel adı"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Unvan / Rol</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  placeholder="Örn: Berber, Stilist, Uzman"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#454540' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={closeModal}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '3px', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: '10px',
                  background: saving ? 'var(--dim)' : 'var(--gold)',
                  border: 'none', borderRadius: '3px',
                  color: saving ? 'var(--muted)' : 'var(--bg)',
                  fontSize: '12px', fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Kaydediliyor...' : editItem ? 'Kaydet' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
