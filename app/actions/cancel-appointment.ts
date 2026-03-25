'use server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function cancelAppointmentByToken(appointmentId: string, phone: string) {
  const admin = createAdminClient()

  // Verify the phone matches the appointment (security check)
  const { data: appt } = await admin
    .from('appointments')
    .select('id, customer_phone, status, business_id')
    .eq('id', appointmentId)
    .single()

  if (!appt) return { error: 'Randevu bulunamadı.' }
  if (appt.status === 'iptal') return { error: 'Bu randevu zaten iptal edilmiş.' }
  if (appt.status === 'tamamlandi') return { error: 'Tamamlanan randevu iptal edilemez.' }

  // Check last 4 digits of phone match
  const cleanInput = phone.replace(/\D/g, '').slice(-4)
  const cleanStored = appt.customer_phone.replace(/\D/g, '').slice(-4)
  if (cleanInput !== cleanStored) return { error: 'Telefon numarası eşleşmiyor.' }

  const { error } = await admin
    .from('appointments')
    .update({ status: 'iptal' })
    .eq('id', appt.id)

  if (error) return { error: 'İptal işlemi başarısız.' }
  return { success: true }
}
