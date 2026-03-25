'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

interface Appointment {
  id: string
  date: string
  time: string
  customer_name: string
  customer_phone: string
  status: string
  service: { name: string } | null
  staff: { name: string } | null
}

function getWeekStart(offsetWeeks: number): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  // Monday = 1, getDay() returns 0=Sun, 1=Mon...
  const day = now.getDay()
  const diffToMon = (day === 0 ? -6 : 1 - day)
  now.setDate(now.getDate() + diffToMon + offsetWeeks * 7)
  return now
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; border: string; label: string }> = {
    bekliyor: { color: 'var(--gold)', bg: 'var(--gold3)', border: 'rgba(196,154,74,0.25)', label: 'Bekliyor' },
    onaylandi: { color: '#4ac478', bg: 'rgba(74,196,120,0.1)', border: 'rgba(74,196,120,0.25)', label: 'Onaylandı' },
    iptal: { color: '#c44a4a', bg: 'rgba(196,74,74,0.1)', border: 'rgba(196,74,74,0.25)', label: 'İptal' },
    tamamlandi: { color: 'var(--muted)', bg: 'rgba(100,100,100,0.1)', border: 'var(--line)', label: 'Tamamlandı' },
  }
  const s = map[status] ?? map['tamamlandi']
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '2px',
        fontSize: '9px',
        fontWeight: '600',
        color: s.color,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        textDecoration: status === 'iptal' ? 'line-through' : 'none',
      }}
    >
      {s.label}
    </span>
  )
}

export default function TakvimPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState<string | null>(null)

  const supabase = createClient()

  const weekStart = getWeekStart(weekOffset)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const weekEnd = weekDays[6]
  const weekLabel = `${weekDays[0].getDate()} ${MONTHS_TR[weekDays[0].getMonth()]} – ${weekEnd.getDate()} ${MONTHS_TR[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`

  const fetchAppointments = useCallback(async (bizId: string, start: Date) => {
    setLoading(true)
    const startStr = formatDate(start)
    const endDate = new Date(start)
    endDate.setDate(start.getDate() + 6)
    const endStr = formatDate(endDate)

    const { data } = await supabase
      .from('appointments')
      .select('id, date, time, customer_name, customer_phone, status, service:services(name), staff:staff(name)')
      .eq('business_id', bizId)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('time')

    setAppointments((data as unknown as Appointment[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
      if (!profile?.business_id) { setLoading(false); return }
      setBusinessId(profile.business_id)
      await fetchAppointments(profile.business_id, getWeekStart(0))
    }
    init()
  }, [supabase, fetchAppointments])

  useEffect(() => {
    if (businessId) {
      fetchAppointments(businessId, getWeekStart(weekOffset))
    }
  }, [weekOffset, businessId, fetchAppointments])

  const today = formatDate(new Date())

  function getAptsForDay(d: Date): Appointment[] {
    const ds = formatDate(d)
    return appointments.filter((a) => a.date === ds)
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: '26px',
              color: 'var(--white)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Takvim
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{weekLabel}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            style={{
              padding: '8px 14px',
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              color: 'var(--white)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ← Önceki
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            style={{
              padding: '8px 14px',
              background: weekOffset === 0 ? 'var(--gold3)' : 'var(--bg2)',
              border: `1px solid ${weekOffset === 0 ? 'rgba(196,154,74,0.3)' : 'var(--line)'}`,
              borderRadius: '3px',
              color: weekOffset === 0 ? 'var(--gold)' : 'var(--muted)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            Bu Hafta
          </button>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            style={{
              padding: '8px 14px',
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              color: 'var(--white)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Sonraki →
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))',
          gap: '8px',
          overflowX: 'auto',
          minWidth: 0,
        }}
      >
        {weekDays.map((d, i) => {
          const ds = formatDate(d)
          const isToday = ds === today
          const dayApts = getAptsForDay(d)

          return (
            <div
              key={ds}
              style={{
                background: 'var(--bg2)',
                border: `1px solid ${isToday ? 'rgba(196,154,74,0.4)' : 'var(--line)'}`,
                borderRadius: '3px',
                overflow: 'hidden',
                minHeight: '200px',
              }}
            >
              {/* Day header */}
              <div
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--line)',
                  background: isToday ? 'var(--gold3)' : 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isToday ? 'var(--gold)' : 'var(--muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {DAY_NAMES[i]}
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: isToday ? 'var(--gold)' : 'var(--white)',
                    lineHeight: 1,
                  }}
                >
                  {d.getDate()}
                </span>
              </div>

              {/* Appointments */}
              <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {loading ? (
                  <div style={{ padding: '12px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>...</div>
                  </div>
                ) : dayApts.length === 0 ? (
                  <div
                    style={{
                      padding: '20px 0',
                      textAlign: 'center',
                      fontSize: '11px',
                      color: 'var(--line2)',
                      fontStyle: 'italic',
                    }}
                  >
                    Randevu yok
                  </div>
                ) : (
                  dayApts.map((apt) => (
                    <div
                      key={apt.id}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '3px',
                        padding: '8px 10px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: 'var(--gold)',
                          marginBottom: '3px',
                        }}
                      >
                        {String(apt.time).slice(0, 5)}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: 'var(--white)',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {apt.customer_name}
                      </div>
                      {apt.service?.name && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: 'var(--muted)',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {apt.service.name}
                        </div>
                      )}
                      {apt.staff?.name && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: 'var(--muted)',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {apt.staff.name}
                        </div>
                      )}
                      <StatusBadge status={apt.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
