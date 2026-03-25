'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function createAppointment(data: {
  business_id: string
  staff_id: string | null
  service_id: string
  customer_name: string
  customer_phone: string
  date: string
  time: string
}) {
  const admin = createAdminClient()

  const { data: appointment, error } = await admin
    .from('appointments')
    .insert({
      business_id: data.business_id,
      staff_id: data.staff_id,
      service_id: data.service_id,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      date: data.date,
      time: data.time,
      status: 'bekliyor',
      notes: null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: appointment }
}
