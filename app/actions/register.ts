'use server'

import { createAdminClient } from '@/lib/supabase/admin'

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  }
  return text
    .split('')
    .map((c) => trMap[c] ?? c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function registerBusiness(formData: {
  email: string
  password: string
  ownerName: string
  businessName: string
  phone: string
  plan: string
}) {
  const admin = createAdminClient()

  // 1. Kullanıcıyı email onayı olmadan oluştur
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      full_name: formData.ownerName,
      role: 'isletme',
    },
  })

  if (userError) {
    if (userError.message.includes('already been registered') || userError.message.includes('already exists')) {
      return { error: 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.' }
    }
    return { error: 'Kayıt hatası: ' + userError.message }
  }

  const userId = userData.user.id
  const slug = slugify(formData.businessName)

  // 2. Business ekle
  const { data: business, error: bizError } = await admin
    .from('businesses')
    .insert({
      name: formData.businessName,
      slug,
      owner_id: userId,
      phone: formData.phone || null,
      plan: formData.plan,
      status: 'aktif',
    })
    .select()
    .single()

  if (bizError) {
    return { error: 'İşletme oluşturulamadı: ' + bizError.message }
  }

  const businessId = business.id

  // 3. Profile güncelle
  await admin.from('profiles').update({ business_id: businessId }).eq('id', userId)

  // 4. Çalışma saatleri
  const hours = Array.from({ length: 7 }, (_, day) => ({
    business_id: businessId,
    day,
    is_open: day !== 0,
    open_time: '09:00',
    close_time: '18:00',
  }))
  await admin.from('working_hours').insert(hours)

  // 5. Varsayılan hizmetler
  await admin.from('services').insert([
    { business_id: businessId, name: 'Hizmet 1', duration: 30, price: 150, is_active: true },
    { business_id: businessId, name: 'Hizmet 2', duration: 45, price: 250, is_active: true },
    { business_id: businessId, name: 'Hizmet 3', duration: 20, price: 120, is_active: true },
  ])

  return { success: true }
}
