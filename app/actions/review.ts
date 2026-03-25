'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function submitReview(data: {
  appointmentId: string
  businessId: string
  customerName: string
  rating: number
  comment?: string
  phone: string // last 4 digits verification
}) {
  const admin = createAdminClient()

  // Verify appointment exists and phone matches
  const { data: appt } = await admin
    .from('appointments')
    .select('id, customer_phone, customer_name, status')
    .eq('id', data.appointmentId)
    .single()

  if (!appt) return { error: 'Randevu bulunamadı.' }
  if (appt.status !== 'tamamlandi') return { error: 'Sadece tamamlanan randevular için yorum yapılabilir.' }

  const cleanInput = data.phone.replace(/\D/g, '').slice(-4)
  const cleanStored = (appt.customer_phone as string).replace(/\D/g, '').slice(-4)
  if (cleanInput !== cleanStored) return { error: 'Telefon numarası eşleşmiyor.' }

  // Check if already reviewed
  const { data: existing } = await admin
    .from('reviews')
    .select('id')
    .eq('appointment_id', data.appointmentId)
    .single()

  if (existing) return { error: 'Bu randevu için zaten yorum yapılmış.' }

  const { error } = await admin.from('reviews').insert({
    business_id: data.businessId,
    appointment_id: data.appointmentId,
    customer_name: data.customerName,
    rating: data.rating,
    comment: data.comment || null,
  })

  if (error) return { error: 'Yorum gönderilemedi.' }
  return { success: true }
}

export async function getBusinessReviews(businessId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
  return data ?? []
}
