'use client'

import { useState } from 'react'
import { products as productsData } from '@/lib/mock-data'

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
  marginBottom: '5px',
}

export default function UrunlerPage() {
  const [showModal, setShowModal] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    status: 'Aktif',
  })

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: '24px',
              color: 'var(--white)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Ürünler
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {productsData.filter((p) => p.status === 'Aktif').length} aktif ürün
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ürün Ekle
        </button>
      </div>

      {/* Products Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {productsData.map((product) => (
          <div
            key={product.id}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            {/* Image placeholder */}
            <div
              style={{
                height: '140px',
                background: 'var(--bg3)',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {/* Status */}
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    padding: '2px 7px',
                    background: product.status === 'Aktif' ? 'rgba(74,196,120,0.15)' : 'rgba(100,100,100,0.15)',
                    border: `1px solid ${product.status === 'Aktif' ? 'rgba(74,196,120,0.3)' : 'var(--line)'}`,
                    borderRadius: '2px',
                    fontSize: '9px',
                    fontWeight: '600',
                    color: product.status === 'Aktif' ? '#4ac478' : 'var(--muted)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {product.status}
                </span>
              </div>
              {/* Stock warning */}
              {product.stock === 0 && (
                <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 7px',
                      background: 'rgba(196,74,74,0.15)',
                      border: '1px solid rgba(196,74,74,0.3)',
                      borderRadius: '2px',
                      fontSize: '9px',
                      fontWeight: '600',
                      color: '#c44a4a',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Stok Yok
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ padding: '14px' }}>
              <div style={{ marginBottom: '10px' }}>
                <div
                  style={{
                    fontSize: '9px',
                    fontWeight: '600',
                    color: 'var(--muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  {product.category}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', marginBottom: '4px' }}>
                  {product.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--gold)' }}>
                    ₺{product.price}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: product.stock <= 5 && product.stock > 0 ? '#f0a840' : product.stock === 0 ? '#c44a4a' : 'var(--muted)',
                    }}
                  >
                    {product.stock === 0 ? 'Tükendi' : `${product.stock} adet`}
                  </span>
                </div>
              </div>

              <div
                style={{
                  height: '1px',
                  background: 'var(--line)',
                  margin: '10px 0',
                }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '7px',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '2px',
                    color: 'var(--white)',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  Düzenle
                </button>
                <button
                  style={{
                    padding: '7px 10px',
                    background: 'rgba(196,74,74,0.08)',
                    border: '1px solid rgba(196,74,74,0.2)',
                    borderRadius: '2px',
                    color: '#c44a4a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '4px',
              padding: '28px',
              width: '100%',
              maxWidth: '460px',
              animation: 'fadeUp 0.25s ease both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--white)' }}>Yeni Ürün</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Image Upload Zone */}
              <div>
                <label style={labelStyle}>Ürün Görseli</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
                  style={{
                    height: '120px',
                    background: dragOver ? 'var(--bg3)' : 'var(--bg)',
                    border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--line2)'}`,
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dragOver ? 'var(--gold)' : 'var(--muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: dragOver ? 'var(--gold)' : 'var(--muted)' }}>
                      Görseli buraya sürükleyin
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                      veya <span style={{ color: 'var(--gold)' }}>dosya seçin</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Ürün Adı</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  style={inputStyle}
                  placeholder="Ürün adı"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Fiyat (₺)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                    style={inputStyle}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Stok Adedi</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))}
                    style={inputStyle}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Kategori</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                  style={inputStyle}
                  placeholder="Saç Bakımı, Cilt Bakımı..."
                />
              </div>

              <div>
                <label style={labelStyle}>Durum</label>
                <select
                  value={newProduct.status}
                  onChange={(e) => setNewProduct((p) => ({ ...p, status: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    color: 'var(--muted)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  İptal
                </button>
                <button
                  style={{
                    flex: 2,
                    padding: '10px',
                    background: 'var(--white)',
                    border: 'none',
                    borderRadius: '3px',
                    color: 'var(--bg)',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}
                >
                  Ürün Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
