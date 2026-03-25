'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'

// Generate mock daily revenue for last 30 days
function generateRevenueData() {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const day = d.getDate()
    const base = 800 + Math.random() * 1200
    data.push({
      day: String(day),
      gelir: Math.round(base),
    })
  }
  return data
}

const revenueData = generateRevenueData()

const serviceData = [
  { name: 'Saç Kesimi', value: 38 },
  { name: 'Manikür', value: 24 },
  { name: 'Masaj', value: 19 },
  { name: 'Cilt Bakımı', value: 13 },
  { name: 'Diğer', value: 6 },
]

const SERVICE_COLORS = ['#c49a4a', '#e8c06a', '#8A8478', '#D9D5CC', '#E8E4DC']

function generateWeeklyData() {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
  return days.map((d) => ({
    gun: d,
    randevu: Math.floor(Math.random() * 12) + 1,
  }))
}

const weeklyData = generateWeeklyData()

const tooltipStyle = {
  contentStyle: {
    background: '#F4F2EE',
    border: '1px solid #242422',
    borderRadius: '3px',
    fontSize: '11px',
    color: '#1C1A16',
  },
  labelStyle: { color: '#8A8478', fontSize: '10px' },
  itemStyle: { color: '#c49a4a' },
}

export default function RevenueCharts() {
  return (
    <div style={{ marginTop: '32px' }}>
      {/* Revenue Area Chart */}
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--line)',
          borderRadius: '3px',
          marginBottom: '20px',
          overflow: 'hidden',
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
            Gelir Grafiği
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Son 30 gün</span>
        </div>
        <div style={{ padding: '20px 8px 12px' }}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c49a4a" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#c49a4a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#242422" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#8A8478', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#8A8478', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
                itemStyle={tooltipStyle.itemStyle}
                formatter={(v: unknown) => [`₺${(v as number).toLocaleString('tr-TR')}`, 'Gelir']}
                labelFormatter={(l) => `Gün ${l}`}
              />
              <Area
                type="monotone"
                dataKey="gelir"
                stroke="#c49a4a"
                strokeWidth={1.5}
                fill="url(#goldGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#c49a4a', stroke: '#FAFAF8', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second row: Pie + Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pie Chart */}
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.01em' }}>
              Hizmet Dağılımı
            </h2>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {serviceData.map((_, idx) => (
                      <Cell key={idx} fill={SERVICE_COLORS[idx % SERVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle.contentStyle}
                    itemStyle={tooltipStyle.itemStyle}
                    formatter={(v: unknown) => [`%${v}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {serviceData.map((item, idx) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '2px',
                        background: SERVICE_COLORS[idx % SERVICE_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--muted)', flex: 1 }}>{item.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--white)', fontWeight: '600' }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', letterSpacing: '0.01em' }}>
              Haftalık Randevular
            </h2>
          </div>
          <div style={{ padding: '16px 8px 12px' }}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242422" vertical={false} />
                <XAxis
                  dataKey="gun"
                  tick={{ fill: '#8A8478', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8A8478', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={tooltipStyle.contentStyle}
                  labelStyle={tooltipStyle.labelStyle}
                  itemStyle={tooltipStyle.itemStyle}
                  formatter={(v: unknown) => [v as number, 'Randevu']}
                />
                <Bar dataKey="randevu" fill="#c49a4a" radius={[2, 2, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
