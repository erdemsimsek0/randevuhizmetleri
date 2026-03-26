import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Appointment, Staff } from '@/lib/types'
import Link from 'next/link'
import RevenueCharts from '@/components/charts/RevenueChart'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string; border: string; label: string }> = {
    onaylandi: { bg: 'rgba(74,196,120,0.1)', color: '#4ac478', border: 'rgba(74,196,120,0.25)', label: 'Onaylandı' },
    bekliyor: { bg: 'var(--gold3)', color: 'var(--gold)', border: 'rgba(196,154,74,0.25)', label: 'Bekliyor' },
    iptal: { bg: 'rgba(196,74,74,0.1)', color: '#c44a4a', border: 'rgba(196,74,74,0.25)', label: 'İptal' },
    tamamlandi: { bg: 'rgba(100,100,100,0.1)', color: 'var(--muted)', border: 'var(--line)', label: 'Tamamlandı' },
  }
  const c = colors[status] || colors['tamamlandi']
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
      {c.label}
    </span>
  )
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.business_id) {
    return (
      <div style={{ padding: '32px 36px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>İşletme bulunamadı. Lütfen kayıt işlemini tamamlayın.</p>
      </div>
    )
  }

  const businessId = profile.business_id
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  // Monday of current week
  const nowD = new Date()
  const dayOfWeek = nowD.getDay()
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(nowD)
  weekStart.setDate(nowD.getDate() + diffToMon)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const [
    { data: business },
    { data: todayAppointments },
    { data: monthAppointments },
    { data: staffList },
    { data: recentAppointments },
    { data: pendingAppointments },
    { data: rawRevenue },
    { data: rawWeekly },
    { data: rawServiceDist },
  ] = await Promise.all([
    supabase.from('businesses').select('name, slug').eq('id', businessId).single(),
    supabase.from('appointments').select('id').eq('business_id', businessId).eq('date', today),
    supabase.from('appointments').select('id').eq('business_id', businessId).gte('date', monthStart),
    supabase.from('staff').select('*').eq('business_id', businessId).eq('is_active', true),
    supabase
      .from('appointments')
      .select('*, service:services(name), staff:staff(name)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('appointments')
      .select('id')
      .eq('business_id', businessId)
      .eq('status', 'bekliyor'),
    supabase
      .from('appointments')
      .select('date, service:services(price)')
      .eq('business_id', businessId)
      .gte('date', thirtyDaysAgoStr)
      .neq('status', 'iptal'),
    supabase
      .from('appointments')
      .select('date')
      .eq('business_id', businessId)
      .gte('date', weekStartStr)
      .lte('date', today)
      .neq('status', 'iptal'),
    supabase
      .from('appointments')
      .select('service:services(name)')
      .eq('business_id', businessId)
      .gte('date', thirtyDaysAgoStr)
      .neq('status', 'iptal'),
  ])

  // Build revenue chart data (last 30 days, grouped by date)
  const revenueByDate: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    revenueByDate[d.toISOString().split('T')[0]] = 0
  }
  for (const apt of rawRevenue ?? []) {
    const price = (apt.service as { price: number } | null)?.price ?? 0
    if (revenueByDate[apt.date] !== undefined) revenueByDate[apt.date] += price
  }
  const revenueChartData = Object.entries(revenueByDate).map(([date, gelir]) => ({
    day: String(new Date(date + 'T12:00:00').getDate()),
    gelir,
  }))

  // Build weekly chart data (Mon–Sun)
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
  const weeklyByDay = [0, 0, 0, 0, 0, 0, 0]
  for (const apt of rawWeekly ?? []) {
    const d = new Date(apt.date + 'T12:00:00').getDay()
    const idx = d === 0 ? 6 : d - 1
    weeklyByDay[idx]++
  }
  const weeklyChartData = dayNames.map((gun, i) => ({ gun, randevu: weeklyByDay[i] }))

  // Build service distribution data
  const serviceCount: Record<string, number> = {}
  for (const apt of rawServiceDist ?? []) {
    const name = (apt.service as { name: string } | null)?.name ?? 'Diğer'
    serviceCount[name] = (serviceCount[name] ?? 0) + 1
  }
  const total = Object.values(serviceCount).reduce((a, b) => a + b, 0)
  const serviceChartData = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
    }))

  const todayCount = todayAppointments?.length ?? 0
  const monthCount = monthAppointments?.length ?? 0
  const staffCount = staffList?.length ?? 0
  const pendingCount = pendingAppointments?.length ?? 0
  const businessName = business?.name ?? 'İşletme'

  const now = new Date()
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${days[now.getDay()]}`

  return (
    <div className="admin-dashboard-page">
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            İyi günler
          </span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ac478', display: 'inline-block' }} />
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
          {businessName}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {dateStr} — Platform durumu normal
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        {[
          {
            label: 'Bugünkü Randevular',
            value: todayCount,
            sub: 'bugün',
            color: 'var(--gold)',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
          },
          {
            label: 'Aylık Randevular',
            value: monthCount,
            sub: 'bu ay',
            color: '#4ac478',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ),
          },
          {
            label: 'Aktif Personel',
            value: staffCount,
            sub: 'çalışan',
            color: '#6ab4e8',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
          },
          {
            label: 'Bekleyen Randevular',
            value: pendingCount,
            sub: 'onay bekliyor',
            color: 'var(--gold)',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
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
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <RevenueCharts revenueData={revenueChartData} weeklyData={weeklyChartData} serviceData={serviceChartData} />

      <div className="dashboard-bottom-grid">
        {/* Recent Appointments Table */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.01em' }}>
              Son Randevular
            </h2>
            <Link href="/admin/randevular" style={{ fontSize: '11px', color: 'var(--gold)', textDecoration: 'none', letterSpacing: '0.04em' }}>
              Tümünü Gör →
            </Link>
          </div>
          {recentAppointments && recentAppointments.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
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
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(recentAppointments as (Appointment & { service?: { name: string }; staff?: { name: string } | null })[]).map((apt, i) => (
                    <tr key={apt.id} style={{ borderBottom: i < recentAppointments.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)' }}>{apt.customer_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{apt.customer_phone}</div>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--white)' }}>
                        {apt.service?.name ?? '—'}
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--muted)' }}>
                        {apt.staff?.name ?? '—'}
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
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              Henüz randevu yok
            </div>
          )}
        </div>

        {/* Quick Actions + Staff */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', padding: '20px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Hızlı Eylemler
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  label: 'Randevular',
                  href: '/admin/randevular',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  ),
                },
                {
                  label: 'Personel Yönet',
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
                  label: 'Hizmetler',
                  href: '/admin/hizmetler',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  ),
                },
                {
                  label: 'Ayarlar',
                  href: '/admin/ayarlar',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  ),
                },
              ].map((action) => (
                <Link
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
                </Link>
              ))}
            </div>
          </div>

          {/* Active Staff */}
          {staffList && staffList.length > 0 && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '3px', padding: '20px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Aktif Personel
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(staffList as Staff[]).slice(0, 4).map((s) => (
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
                      {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--white)' }}>{s.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{s.role}</div>
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
          )}
        </div>
      </div>

      <style>{`
        .admin-dashboard-page {
          padding: 32px 36px;
          max-width: 1100px;
        }
        .stat-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .dashboard-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 20px;
          margin-top: 32px;
        }
        @media (max-width: 768px) {
          .admin-dashboard-page {
            padding: 16px;
          }
          .stat-cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .dashboard-bottom-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
