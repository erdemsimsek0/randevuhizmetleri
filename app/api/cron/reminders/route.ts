import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms/send'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Güvenlik: Vercel cron Authorization header veya query param secret
  const authHeader = req.headers.get('authorization')
  const querySecret = req.nextUrl.searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET
  const authorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && querySecret === cronSecret)
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Şu andan 5.5 - 6.5 saat sonraki randevuları bul (hatırlatma penceresi)
  const now = new Date()
  const windowStart = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 6.5 * 60 * 60 * 1000)

  // Tarih ve saat aralığını hesapla
  function toDateStr(d: Date) {
    return d.toISOString().slice(0, 10)
  }
  function toTimeStr(d: Date) {
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  }

  const startDate = toDateStr(windowStart)
  const endDate = toDateStr(windowEnd)
  const startTime = toTimeStr(windowStart)
  const endTime = toTimeStr(windowEnd)

  // Hatırlatma gönderilmemiş, iptal edilmemiş randevuları getir
  let query = admin
    .from('appointments')
    .select('id, date, time, customer_name, customer_phone, reminder_sent')
    .eq('reminder_sent', false)
    .neq('status', 'iptal')

  if (startDate === endDate) {
    query = query.eq('date', startDate).gte('time', startTime).lte('time', endTime)
  } else {
    query = query.gte('date', startDate).lte('date', endDate)
  }

  const { data: appointments, error } = await query

  if (error) {
    console.error('[cron/reminders] DB error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  let failed = 0

  for (const apt of appointments ?? []) {
    const message = `Sayın ${apt.customer_name}, bugün saat ${String(apt.time).slice(0, 5)} randevunuz bulunmaktadır. İyi günler dileriz.`

    try {
      await sendSMS(apt.customer_phone, message)
      await admin.from('appointments').update({ reminder_sent: true }).eq('id', apt.id)
      sent++
    } catch (err) {
      console.error(`[cron/reminders] SMS gönderilemedi: ${apt.id}`, err)
      failed++
    }
  }

  return NextResponse.json({ ok: true, sent, failed, checked: appointments?.length ?? 0 })
}
