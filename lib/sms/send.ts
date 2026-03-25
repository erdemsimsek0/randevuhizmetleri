import twilio from 'twilio'

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('90')) return `+${digits}`
  if (digits.startsWith('0')) return `+90${digits.slice(1)}`
  return `+90${digits}`
}

export async function sendSMS(phone: string, message: string): Promise<void> {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: formatPhone(phone),
  })
}
