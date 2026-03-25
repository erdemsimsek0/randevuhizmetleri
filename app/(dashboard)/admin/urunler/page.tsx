'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type Product = {
  id: string
  business_id: string
  name: string
  price: number
  image_url: string | null
  stock: number
  is_active: boolean
  created_at: string
}

const EMPTY_FORM = { name: '', price: 0, image_url: '', stock: 0 }

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProducts = useCallback(async (bId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', bId)
      .order('created_at', { ascending: true })
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
      if (profile?.business_id) {
        setBusinessId(profile.business_id)
        await fetchProducts(profile.business_id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [supabase, fetchProducts])

  function openAdd() {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setError(null)
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditItem(p)
    setForm({ name: p.name, price: p.price, image_url: p.image_url ?? '', stock: p.stock })
    setError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditItem(null)
    setError(null)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Ürün adı zorunludur.'); return }
    if (!businessId) return
    setSaving(true)
    setError(null)

    if (editItem) {
      const { error: err } = await supabase
        .from('products')
        .update({ name: form.name, price: form.price, image_url: form.image_url || null, stock: form.stock })
        .eq('id', editItem.id)
      if (err) { setError('Kaydedilemedi: ' + err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase
        .from('products')
        .insert({ business_id: businessId, name: form.name, price: form.price, image_url: form.image_url || null, stock: form.stock, is_active: true })
      if (err) { setError('Eklenemedi: ' + err.message); setSaving(false); return }
    }

    await fetchProducts(businessId)
    setSaving(false)
    closeModal()
  }

  async function handleToggleActive(p: Product) {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id)
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_active: !p.is_active } : x))
  }

  async function handleDelete(id: string) {
    await supabase.from('products').delete().eq('id', id)
    setProducts((prev) => prev.filter((x) => x.id !== id))
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
    <div style={{ padding: '32px 36px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Ürünler
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{products.length} ürün</p>
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
          Ürün Ekle
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>Yükleniyor...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>
          Henüz ürün yok. Yukarıdan ekleyebilirsiniz.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: '3px',
                overflow: 'hidden',
                opacity: p.is_active ? 1 : 0.6,
                transition: 'opacity 0.2s',
              }}
            >
              {/* Image placeholder */}
              <div
                style={{
                  height: '120px',
                  background: 'var(--bg3)',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--line2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>

              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', flex: 1 }}>{p.name}</div>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '2px',
                      background: p.is_active ? 'rgba(74,196,120,0.1)' : 'rgba(90,88,80,0.1)',
                      color: p.is_active ? '#4ac478' : 'var(--muted)',
                      border: `1px solid ${p.is_active ? 'rgba(74,196,120,0.25)' : 'var(--line)'}`,
                      fontWeight: '600',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      marginLeft: '8px',
                    }}
                  >
                    {p.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gold)' }}>
                    ₺{Number(p.price).toLocaleString('tr-TR')}
                  </span>
                  <span style={{ fontSize: '11px', color: p.stock === 0 ? '#c44a4a' : 'var(--muted)' }}>
                    Stok: {p.stock}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEdit(p)}
                    style={{ flex: 1, padding: '6px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '3px', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleToggleActive(p)}
                    style={{ flex: 1, padding: '6px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '3px', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {p.is_active ? 'Pasif' : 'Aktif'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(p.id)}
                    style={{ padding: '6px 10px', background: 'transparent', border: '1px solid rgba(196,74,74,0.3)', borderRadius: '3px', color: '#c44a4a', cursor: 'pointer' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '28px', maxWidth: '360px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--white)', marginBottom: '12px' }}>Ürünü Sil</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>Bu ürünü silmek istediğinizden emin misiniz?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '3px', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer' }}>İptal</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '9px', background: 'rgba(196,74,74,0.15)', border: '1px solid rgba(196,74,74,0.3)', borderRadius: '3px', color: '#c44a4a', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }} onClick={closeModal}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '28px', maxWidth: '440px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--white)', marginBottom: '24px' }}>
              {editItem ? 'Ürünü Düzenle' : 'Yeni Ürün'}
            </h3>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(196,74,74,0.1)', border: '1px solid rgba(196,74,74,0.25)', borderRadius: '3px', marginBottom: '16px', fontSize: '12px', color: '#c44a4a' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Ürün Adı</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Örn: Argan Şampuan" style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Fiyat (₺)</label>
                  <input type="number" value={form.price} min={0} step={0.01} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
                </div>
                <div>
                  <label style={labelStyle}>Stok</label>
                  <input type="number" value={form.stock} min={0} onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))} style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Görsel URL (İsteğe Bağlı)</label>
                <input type="url" value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} placeholder="https://..." style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#454540' }} onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }} />
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
