'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms/send'

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function sendVerificationCode(phone: string): Promise<{ error?: string }> {
  if (!phone || phone.replace(/\D/g, '').length < 10) {
    return { error: 'Geçerli bir telefon numarası giriniz.' }
  }

  const admin = createAdminClient()

  // Rate limit: max 3 codes per phone in 10 minutes
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await admin
    .from('sms_verifications')
    .select('*', { count: 'exact', head: true })
    .eq('phone', phone)
    .gte('created_at', tenMinsAgo)

  if ((count ?? 0) >= 3) {
    return { error: 'Çok fazla deneme yaptınız. 10 dakika sonra tekrar deneyin.' }
  }

  // Invalidate previous unused codes
  await admin
    .from('sms_verifications')
    .update({ used: true })
    .eq('phone', phone)
    .eq('used', false)

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error: insertErr } = await admin.from('sms_verifications').insert({
    phone,
    code,
    expires_at: expiresAt,
  })

  if (insertErr) return { error: 'Kod oluşturulamadı.' }

  try {
    await sendSMS(phone, `Randevu doğrulama kodunuz: ${code}. Kod 10 dakika geçerlidir.`)
  } catch {
    return { error: 'SMS gönderilemedi. Telefon numaranızı kontrol edin.' }
  }

  return {}
}

export async function verifyCode(phone: string, code: string): Promise<{ error?: string }> {
  const admin = createAdminClient()

  const { data } = await admin
    .from('sms_verifications')
    .select('id')
    .eq('phone', phone)
    .eq('code', code.trim())
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (!data) return { error: 'Kod geçersiz veya süresi dolmuş.' }

  await admin.from('sms_verifications').update({ used: true }).eq('id', data.id)

  return {}
}
