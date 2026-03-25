import { businesses, appointments, users } from '@/lib/mock-data'

const totalAppointmentsToday = appointments.filter((a) => a.date === '2026-03-25').length
const totalRevenue = businesses.reduce((s, b) => s + b.revenue, 0)
const newThisMonth = businesses.filter((b) => b.createdAt.startsWith('2026')).length
const activeBusinesses = businesses.filter((b) => b.status === 'Aktif').length

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    Temel: { bg: 'rgba(90,88,80,0.15)', color: 'var(--muted)', border: 'var(--line2)' },
    Pro: { bg: 'var(--gold3)', color: 'var(--gold)', border: 'rgba(196,154,74,0.25)' },
    Kurumsal: { bg: 'rgba(245,243,239,0.08)', color: 'var(--white)', border: 'rgba(245,243,239,0.2)' },
  }
  const s = styles[plan] || styles['Temel']
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '2px 8px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '2px',
        fontSize: '10px',
        fontWeight: '600',
        color: s.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {plan}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    Aktif: { bg: 'rgba(74,196,120,0.1)', color: '#4ac478', border: 'rgba(74,196,120,0.25)' },
    Pasif: { bg: 'rgba(90,88,80,0.1)', color: 'var(--muted)', border: 'var(--line)' },
    'Askı': { bg: 'rgba(196,74,74,0.1)', color: '#c44a4a', border: 'rgba(196,74,74,0.25)' },
  }
  const s = styles[status] || styles['Pasif']
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '2px',
        fontSize: '10px',
        fontWeight: '600',
        color: s.color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {status}
    </span>
  )
}

export default function SuperAdminDashboard() {
  return (
    <div style={{ padding: '32px 36px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>
            Super Admin
          </span>
          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Tam Erişim</span>
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
          Süper Admin Paneli
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          randevuhizmetleri.com — Platform genel bakışı
        </p>
      </div>

      {/* Big Stats */}
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
            label: 'Toplam İşletme',
            value: businesses.length,
            sub: `${activeBusinesses} aktif`,
            color: 'var(--gold)',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ),
          },
          {
            label: 'Bugünkü Randevular',
            value: totalAppointmentsToday,
            sub: 'tüm işletmeler',
            color: '#6ab4e8',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
          },
          {
            label: 'Aylık Gelir',
            value: `₺${totalRevenue.toLocaleString('tr-TR')}`,
            sub: 'tüm planlar',
            color: '#4ac478',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ),
          },
          {
            label: 'Bu Ay Kayıt',
            value: newThisMonth,
            sub: 'yeni işletme',
            color: '#e8906a',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            ),
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '500', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {card.label}
              </span>
              <span style={{ color: card.color, opacity: 0.7 }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Businesses Table */}
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
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)' }}>
              İşletmeler
            </h2>
            <a
              href="/superadmin/isletmeler"
              style={{ fontSize: '11px', color: 'var(--gold)', textDecoration: 'none' }}
            >
              Tümünü Gör →
            </a>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['İşletme', 'Plan', 'Durum', 'Randevular', 'Kayıt'].map((h) => (
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
              {businesses.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < businesses.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '3px',
                          background: 'var(--gold3)',
                          border: '1px solid rgba(196,154,74,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'var(--gold)',
                          flexShrink: 0,
                        }}
                      >
                        {b.logo}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--white)' }}>{b.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{b.owner}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <PlanBadge plan={b.plan} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={b.status} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--white)' }}>
                    {b.appointmentsCount.toLocaleString('tr-TR')}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--muted)' }}>
                    {b.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Registrations */}
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
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)' }}>
              Son Kayıtlar
            </h2>
          </div>
          <div>
            {businesses.map((b, i) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  borderBottom: i < businesses.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '3px',
                    background: 'var(--gold3)',
                    border: '1px solid rgba(196,154,74,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--gold)',
                    flexShrink: 0,
                    fontFamily: 'DM Serif Display, serif',
                  }}
                >
                  {b.logo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'var(--white)',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {b.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    {b.category} · {b.createdAt}
                  </div>
                </div>
                <PlanBadge plan={b.plan} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
