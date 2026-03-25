import { appointments, staff, currentBusiness } from '@/lib/mock-data'

const todayAppointments = appointments.filter((a) => a.date === '2026-03-25')
const pendingAppointments = appointments.filter((a) => a.status === 'Bekliyor')
const activeStaff = staff.filter((s) => s.status === 'Aktif')
const monthlyRevenue = appointments
  .filter((a) => a.status !== 'İptal')
  .reduce((sum, a) => sum + a.price, 0)

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    'Onaylandı': { bg: 'rgba(74,196,120,0.1)', color: '#4ac478', border: 'rgba(74,196,120,0.25)' },
    'Bekliyor': { bg: 'var(--gold3)', color: 'var(--gold)', border: 'rgba(196,154,74,0.25)' },
    'İptal': { bg: 'rgba(196,74,74,0.1)', color: '#c44a4a', border: 'rgba(196,74,74,0.25)' },
    'Tamamlandı': { bg: 'rgba(100,100,100,0.1)', color: 'var(--muted)', border: 'var(--line)' },
  }
  const c = colors[status] || colors['Tamamlandı']
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '2px',
        fontSize: '10px',
        fontWeight: '600',
        color: c.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  )
}

export default function AdminDashboard() {
  return (
    <div style={{ padding: '32px 36px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            İyi günler
          </span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#4ac478',
              display: 'inline-block',
            }}
          />
        </div>
        <h1
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '28px',
            color: 'var(--white)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          {currentBusiness.name}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          25 Mart 2026, Çarşamba — Platform durumu normal
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {[
          {
            label: 'Bugünkü Randevular',
            value: todayAppointments.length,
            trend: '+2',
            trendUp: true,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
            color: 'var(--gold)',
          },
          {
            label: 'Aylık Gelir',
            value: `₺${monthlyRevenue.toLocaleString('tr-TR')}`,
            trend: '+12%',
            trendUp: true,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ),
            color: '#4ac478',
          },
          {
            label: 'Aktif Personel',
            value: activeStaff.length,
            trend: 'Sabit',
            trendUp: null,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
            color: '#6ab4e8',
          },
          {
            label: 'Bekleyen Randevular',
            value: pendingAppointments.length,
            trend: '+1',
            trendUp: false,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ),
            color: 'var(--gold)',
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '500', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {card.label}
              </span>
              <span style={{ color: card.color, opacity: 0.7 }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {card.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {card.trendUp !== null && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{ color: card.trendUp ? '#4ac478' : '#c44a4a' }}
                >
                  {card.trendUp ? (
                    <path d="M6 2l4 4H8v4H4V6H2l4-4z" fill="currentColor" />
                  ) : (
                    <path d="M6 10L2 6h2V2h4v4h2L6 10z" fill="currentColor" />
                  )}
                </svg>
              )}
              <span
                style={{
                  fontSize: '11px',
                  color: card.trendUp === true ? '#4ac478' : card.trendUp === false ? '#c44a4a' : 'var(--muted)',
                  fontWeight: '500',
                }}
              >
                {card.trend} geçen aya göre
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        {/* Recent Appointments Table */}
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '3px',
          }}
        >
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.01em' }}>
              Son Randevular
            </h2>
            <a
              href="/admin/randevular"
              style={{
                fontSize: '11px',
                color: 'var(--gold)',
                textDecoration: 'none',
                letterSpacing: '0.04em',
              }}
            >
              Tümünü Gör →
            </a>
          </div>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Müşteri', 'Hizmet', 'Personel', 'Saat', 'Durum'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 20px',
                        textAlign: 'left',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'var(--muted)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid var(--line)',
                        background: 'var(--bg)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 6).map((apt, i) => (
                  <tr
                    key={apt.id}
                    style={{
                      borderBottom: i < 5 ? '1px solid var(--line)' : 'none',
                    }}
                  >
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>
                        {apt.customerName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {apt.customerPhone}
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--white)' }}>
                      {apt.service}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--muted)' }}>
                      {apt.staff}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--white)' }}>{apt.time}</div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{apt.date}</div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '20px',
            }}
          >
            <h2 style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Hızlı Eylemler
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  label: 'Randevu Ekle',
                  href: '/admin/randevular',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  ),
                },
                {
                  label: 'Personel Ekle',
                  href: '/admin/personel',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                  ),
                },
                {
                  label: 'Hizmet Ekle',
                  href: '/admin/hizmetler',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  ),
                },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    textDecoration: 'none',
                    color: 'var(--white)',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ color: 'var(--gold)' }}>{action.icon}</span>
                  {action.label}
                  <span style={{ marginLeft: 'auto', color: 'var(--muted)' }}>→</span>
                </a>
              ))}
            </div>
          </div>

          {/* Today's Staff */}
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '20px',
            }}
          >
            <h2 style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Bugün Çalışan
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {staff.filter((s) => s.status === 'Aktif').slice(0, 4).map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--dim)',
                      border: '1px solid var(--line2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'var(--white)',
                      flexShrink: 0,
                    }}
                  >
                    {s.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--white)' }}>{s.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{s.appointmentsToday} randevu</div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#4ac478',
                      background: 'rgba(74,196,120,0.1)',
                      border: '1px solid rgba(74,196,120,0.2)',
                      padding: '1px 6px',
                      borderRadius: '2px',
                    }}
                  >
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
