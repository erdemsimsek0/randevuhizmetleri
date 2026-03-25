import { resend } from './resend'
import {
  newAppointmentEmail,
  appointmentConfirmedEmail,
  appointmentCancelledEmail,
} from './templates'
import { createAdminClient } from '@/lib/supabase/admin'

const FROM = 'randevuhizmetleri.com <onboarding@resend.dev>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://randevuhizmetleri.vercel.app'

const MONTHS_FULL_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]
const DAYS_FULL_TR = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi',
]

function formatDateTR(dateStr: string): string {
  // "2026-03-25" → "25 Mart 2026, Çarşamba"
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return `${day} ${MONTHS_FULL_TR[month - 1]} ${year}, ${DAYS_FULL_TR[d.getDay()]}`
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('tr-TR')} ₺`
}

type AppointmentRow = {
  id: string
  business_id: string
  date: string
  time: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  status: string
  service: { name: string; price: number } | null
  staff: { name: string } | null
  business: { name: string; slug: string; address: string | null } | null
}

async function fetchAppointment(appointmentId: string): Promise<AppointmentRow | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      business_id,
      date,
      time,
      customer_name,
      customer_phone,
      customer_email,
      status,
      service:services(name, price),
      staff:staff(name),
      business:businesses(name, slug, address)
    `)
    .eq('id', appointmentId)
    .single()

  if (error || !data) {
    console.error('[email] fetchAppointment error:', error?.message)
    return null
  }

  return data as unknown as AppointmentRow
}

async function getOwnerEmail(businessId: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('business_id', businessId)
    .single()

  if (error || !data) {
    console.error('[email] getOwnerEmail error:', error?.message)
    return null
  }

  return data.email ?? null
}

export async function notifyNewAppointment(appointmentId: string): Promise<void> {
  try {
    const apt = await fetchAppointment(appointmentId)
    if (!apt) return

    const ownerEmail = await getOwnerEmail(apt.business_id)
    if (!ownerEmail) {
      console.warn('[email] notifyNewAppointment: no owner email found for business', apt.business_id)
      return
    }

    const businessName = apt.business?.name ?? 'İşletme'
    const slug = apt.business?.slug ?? ''
    const bookingUrl = `${SITE_URL}/(dashboard)/admin/randevular`

    const html = newAppointmentEmail({
      businessName,
      customerName: apt.customer_name,
      customerPhone: apt.customer_phone,
      serviceName: apt.service?.name ?? '—',
      staffName: apt.staff?.name ?? 'Belirtilmedi',
      date: formatDateTR(apt.date),
      time: String(apt.time).slice(0, 5),
      price: apt.service?.price != null ? formatPrice(apt.service.price) : '—',
      bookingUrl,
    })

    const { error } = await resend.emails.send({
      from: FROM,
      to: ownerEmail,
      subject: `Yeni randevu — ${apt.customer_name} (${String(apt.time).slice(0, 5)}, ${formatDateTR(apt.date)})`,
      html,
    })

    if (error) {
      console.error('[email] notifyNewAppointment send error:', error)
    }

    // Send confirmation email to customer if they provided an email
    if (apt.customer_email) {
      const cancellationUrl = `${SITE_URL}/randevu-iptal?id=${apt.id}`
      const customerHtml = appointmentConfirmedEmail({
        customerName: apt.customer_name,
        businessName,
        serviceName: apt.service?.name ?? '—',
        staffName: apt.staff?.name ?? 'Belirtilmedi',
        date: formatDateTR(apt.date),
        time: String(apt.time).slice(0, 5),
        price: apt.service?.price != null ? formatPrice(apt.service.price) : '—',
        address: apt.business?.address ?? '',
        bookingUrl: `${SITE_URL}/${slug}`,
        cancellationUrl,
      })

      const { error: customerError } = await resend.emails.send({
        from: FROM,
        to: apt.customer_email,
        subject: `Randevunuz Alındı — ${businessName}`,
        html: customerHtml,
      })

      if (customerError) {
        console.error('[email] notifyNewAppointment customer send error:', customerError)
      }
    }
  } catch (err) {
    console.error('[email] notifyNewAppointment unexpected error:', err)
  }
}

export async function notifyStatusChange(appointmentId: string, newStatus: string): Promise<void> {
  try {
    if (newStatus !== 'onaylandi' && newStatus !== 'iptal') return

    const apt = await fetchAppointment(appointmentId)
    if (!apt) return

    // We need the customer email — but appointments only store phone.
    // For now, log a warning and skip if no email is available.
    // If customer_email column is added later, use that.
    // As a fallback, send to the business owner so they can inform the customer.
    const ownerEmail = await getOwnerEmail(apt.business_id)
    if (!ownerEmail) {
      console.warn('[email] notifyStatusChange: no owner email for business', apt.business_id)
      return
    }

    const businessName = apt.business?.name ?? 'İşletme'
    const slug = apt.business?.slug ?? ''
    const bookingUrl = `${SITE_URL}/${slug}`
    const dateFormatted = formatDateTR(apt.date)
    const timeFormatted = String(apt.time).slice(0, 5)

    if (newStatus === 'onaylandi') {
      const html = appointmentConfirmedEmail({
        customerName: apt.customer_name,
        businessName,
        serviceName: apt.service?.name ?? '—',
        staffName: apt.staff?.name ?? 'Belirtilmedi',
        date: dateFormatted,
        time: timeFormatted,
        price: apt.service?.price != null ? formatPrice(apt.service.price) : '—',
        address: apt.business?.address ?? '',
        bookingUrl,
      })

      const { error } = await resend.emails.send({
        from: FROM,
        to: ownerEmail,
        subject: `Randevu onaylandı — ${apt.customer_name}, ${dateFormatted} ${timeFormatted}`,
        html,
      })

      if (error) {
        console.error('[email] notifyStatusChange (onaylandi) send error:', error)
      }
    } else if (newStatus === 'iptal') {
      const html = appointmentCancelledEmail({
        customerName: apt.customer_name,
        businessName,
        serviceName: apt.service?.name ?? '—',
        date: dateFormatted,
        time: timeFormatted,
        bookingUrl,
      })

      const { error } = await resend.emails.send({
        from: FROM,
        to: ownerEmail,
        subject: `Randevu iptal edildi — ${apt.customer_name}, ${dateFormatted} ${timeFormatted}`,
        html,
      })

      if (error) {
        console.error('[email] notifyStatusChange (iptal) send error:', error)
      }
    }
  } catch (err) {
    console.error('[email] notifyStatusChange unexpected error:', err)
  }
}
