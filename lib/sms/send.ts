function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('0')) return `90${digits.slice(1)}`
  return `90${digits}`
}

export async function sendSMS(phone: string, message: string): Promise<void> {
  const usercode = process.env.NETGSM_USERCODE!
  const password = process.env.NETGSM_PASSWORD!
  const header = process.env.NETGSM_HEADER! // Onaylı başlık (örn: RANDEVUAPP)

  const params = new URLSearchParams({
    usercode,
    password,
    gsmno: formatPhone(phone),
    message,
    msgheader: header,
  })

  const res = await fetch(`https://api.netgsm.com.tr/sms/send/get/?${params.toString()}`)
  const text = await res.text()

  // Netgsm başarı kodları: 00, 01, 02
  if (!text.startsWith('00') && !text.startsWith('01') && !text.startsWith('02')) {
    throw new Error(`Netgsm hata kodu: ${text}`)
  }
}
