function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #0c0c0b; font-family: 'Helvetica Neue', Arial, sans-serif; }
  .container { max-width: 560px; margin: 0 auto; background: #0c0c0b; }
  .header { padding: 32px 32px 24px; border-bottom: 1px solid #242422; }
  .logo { font-size: 18px; color: #f5f3ef; }
  .logo em { color: #c49a4a; font-style: italic; }
  .body { padding: 32px; }
  .footer { padding: 20px 32px; border-top: 1px solid #242422; font-size: 11px; color: #5a5850; text-align: center; }
  h1 { font-size: 22px; color: #f5f3ef; margin: 0 0 8px; font-weight: 600; }
  p { font-size: 14px; color: #5a5850; line-height: 1.7; margin: 0 0 16px; }
  .card { background: #141413; border: 1px solid #242422; border-radius: 4px; padding: 20px; margin: 20px 0; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #242422; }
  .row:last-child { border-bottom: none; }
  .label { font-size: 12px; color: #5a5850; }
  .value { font-size: 13px; color: #f5f3ef; font-weight: 500; }
  .btn { display: inline-block; background: #f5f3ef; color: #0c0c0b; padding: 12px 28px; border-radius: 3px; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 8px; }
  .gold { color: #c49a4a; }
  .badge { display: inline-block; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 2px; font-weight: 600; }
  .badge-gold { background: rgba(196,154,74,0.12); color: #c49a4a; border: 1px solid rgba(196,154,74,0.3); }
  .badge-green { background: rgba(76,175,80,0.1); color: #4caf50; border: 1px solid rgba(76,175,80,0.3); }
  .badge-red { background: rgba(239,83,80,0.1); color: #ef5350; border: 1px solid rgba(239,83,80,0.3); }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">randevu<em>hizmetleri</em><span style="color:#5a5850">.com</span></div>
  </div>
  ${content}
  <div class="footer">
    randevuhizmetleri.com — Türkiye'nin randevu platformu<br>
    Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayın.
  </div>
</div>
</body>
</html>`
}

export function newAppointmentEmail(data: {
  businessName: string
  customerName: string
  customerPhone: string
  serviceName: string
  staffName: string
  date: string
  time: string
  price: string
  bookingUrl: string
  whatsappUrl?: string
}): string {
  const waMessage = `Merhaba ${data.customerName}, ${data.businessName}'dan randevunuz onaylanmıştır. 📅 ${data.date} saat ${data.time} ✂️ ${data.serviceName} Görüşmek üzere!`
  const waUrl = data.whatsappUrl ?? `https://wa.me/${data.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`

  const content = `
  <div class="body">
    <span class="badge badge-gold">Yeni Randevu</span>
    <h1 style="margin-top:16px;">Yeni bir randevu aldınız</h1>
    <p>${data.businessName} işletmenize <strong style="color:#f5f3ef;">${data.customerName}</strong> tarafından yeni bir randevu oluşturuldu.</p>

    <div class="card">
      <div class="row">
        <span class="label">Müşteri</span>
        <span class="value">${data.customerName}</span>
      </div>
      <div class="row">
        <span class="label">Telefon</span>
        <span class="value">${data.customerPhone}</span>
      </div>
      <div class="row">
        <span class="label">Hizmet</span>
        <span class="value">${data.serviceName}</span>
      </div>
      <div class="row">
        <span class="label">Personel</span>
        <span class="value">${data.staffName}</span>
      </div>
      <div class="row">
        <span class="label">Tarih</span>
        <span class="value">${data.date}</span>
      </div>
      <div class="row">
        <span class="label">Saat</span>
        <span class="value">${data.time}</span>
      </div>
      <div class="row">
        <span class="label">Ücret</span>
        <span class="value gold">${data.price}</span>
      </div>
    </div>

    <p style="font-size:13px;">Randevuyu onaylamak veya iptal etmek için yönetim panelinizi ziyaret edin.</p>
    <a href="${data.bookingUrl}" class="btn">Randevuları Yönet</a>

    <div style="margin-top:20px; padding:14px 16px; background:#141413; border:1px solid #242422; border-radius:4px;">
      <p style="font-size:12px; color:#5a5850; margin:0 0 10px;">Müşteriyi WhatsApp'tan bildir:</p>
      <a href="${waUrl}" style="display:inline-flex; align-items:center; gap:8px; background:#25D366; color:#fff; padding:10px 20px; border-radius:3px; text-decoration:none; font-size:12px; font-weight:700; letter-spacing:0.04em;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        WhatsApp Gönder
      </a>
    </div>
  </div>`
  return emailWrapper(content)
}

export function appointmentConfirmedEmail(data: {
  customerName: string
  businessName: string
  serviceName: string
  staffName: string
  date: string
  time: string
  price: string
  address: string
  bookingUrl: string
  cancellationUrl?: string
}): string {
  const content = `
  <div class="body">
    <span class="badge badge-green">Onaylandı</span>
    <h1 style="margin-top:16px;">Randevunuz onaylandı</h1>
    <p>Merhaba <strong style="color:#f5f3ef;">${data.customerName}</strong>, <strong style="color:#f5f3ef;">${data.businessName}</strong> randevunuzu onayladı. Sizi bekliyoruz!</p>

    <div class="card">
      <div class="row">
        <span class="label">İşletme</span>
        <span class="value">${data.businessName}</span>
      </div>
      <div class="row">
        <span class="label">Hizmet</span>
        <span class="value">${data.serviceName}</span>
      </div>
      <div class="row">
        <span class="label">Personel</span>
        <span class="value">${data.staffName}</span>
      </div>
      <div class="row">
        <span class="label">Tarih</span>
        <span class="value">${data.date}</span>
      </div>
      <div class="row">
        <span class="label">Saat</span>
        <span class="value gold">${data.time}</span>
      </div>
      <div class="row">
        <span class="label">Ücret</span>
        <span class="value">${data.price}</span>
      </div>
      ${data.address ? `
      <div class="row">
        <span class="label">Adres</span>
        <span class="value">${data.address}</span>
      </div>` : ''}
    </div>

    <p style="font-size:13px;">Randevu detaylarınızı görüntülemek için aşağıdaki butonu kullanabilirsiniz.</p>
    <a href="${data.bookingUrl}" class="btn">Randevu Detayı</a>

    ${data.cancellationUrl ? `
    <div style="margin-top:24px; padding-top:16px; border-top:1px solid #242422; text-align:center;">
      <p style="font-size:11px; color:#5a5850; margin:0 0 8px;">Randevunuza gelemeyecek misiniz?</p>
      <a href="${data.cancellationUrl}" style="font-size:11px; color:#5a5850; text-decoration:underline;">Randevuyu İptal Et</a>
    </div>` : ''}
  </div>`
  return emailWrapper(content)
}

export function appointmentCancelledEmail(data: {
  customerName: string
  businessName: string
  serviceName: string
  date: string
  time: string
  reason?: string
  bookingUrl: string
}): string {
  const content = `
  <div class="body">
    <span class="badge badge-red">İptal Edildi</span>
    <h1 style="margin-top:16px;">Randevunuz iptal edildi</h1>
    <p>Merhaba <strong style="color:#f5f3ef;">${data.customerName}</strong>, ne yazık ki <strong style="color:#f5f3ef;">${data.businessName}</strong> randevunuz iptal edildi.</p>

    <div class="card">
      <div class="row">
        <span class="label">İşletme</span>
        <span class="value">${data.businessName}</span>
      </div>
      <div class="row">
        <span class="label">Hizmet</span>
        <span class="value">${data.serviceName}</span>
      </div>
      <div class="row">
        <span class="label">Tarih</span>
        <span class="value">${data.date}</span>
      </div>
      <div class="row">
        <span class="label">Saat</span>
        <span class="value">${data.time}</span>
      </div>
      ${data.reason ? `
      <div class="row">
        <span class="label">Neden</span>
        <span class="value">${data.reason}</span>
      </div>` : ''}
    </div>

    <p style="font-size:13px;">Yeni bir randevu oluşturmak ister misiniz?</p>
    <a href="${data.bookingUrl}" class="btn">Yeni Randevu Al</a>
  </div>`
  return emailWrapper(content)
}

export function requestReviewEmail(data: {
  customerName: string
  businessName: string
  reviewUrl: string
}): string {
  const content = `
  <div class="body">
    <span class="badge badge-gold">Randevu Tamamlandı</span>
    <h1 style="margin-top:16px;">Deneyiminizi paylaşır mısınız?</h1>
    <p>Merhaba <strong style="color:#f5f3ef;">${data.customerName}</strong>, <strong style="color:#f5f3ef;">${data.businessName}</strong> randevunuz tamamlandı. Deneyiminizi paylaşmak ister misiniz?</p>
    <p style="font-size:13px;">Yorumunuz işletmemizin daha iyi hizmet vermesine yardımcı olur.</p>
    <a href="${data.reviewUrl}" class="btn">Yorum Yap</a>
    <div style="margin-top:24px; padding-top:16px; border-top:1px solid #242422; text-align:center;">
      <p style="font-size:11px; color:#5a5850; margin:0;">Bu e-posta randevunuz tamamlandığı için gönderilmiştir.</p>
    </div>
  </div>`
  return emailWrapper(content)
}

export function appointmentReminderEmail(data: {
  customerName: string
  businessName: string
  serviceName: string
  staffName: string
  date: string
  time: string
  address: string
}): string {
  const content = `
  <div class="body">
    <span class="badge badge-gold">Hatırlatma</span>
    <h1 style="margin-top:16px;">Yarın randevunuz var</h1>
    <p>Merhaba <strong style="color:#f5f3ef;">${data.customerName}</strong>, yarın <strong style="color:#f5f3ef;">${data.businessName}</strong> için randevunuz olduğunu hatırlatmak istedik.</p>

    <div class="card">
      <div class="row">
        <span class="label">İşletme</span>
        <span class="value">${data.businessName}</span>
      </div>
      <div class="row">
        <span class="label">Hizmet</span>
        <span class="value">${data.serviceName}</span>
      </div>
      <div class="row">
        <span class="label">Personel</span>
        <span class="value">${data.staffName}</span>
      </div>
      <div class="row">
        <span class="label">Tarih</span>
        <span class="value">${data.date}</span>
      </div>
      <div class="row">
        <span class="label">Saat</span>
        <span class="value gold">${data.time}</span>
      </div>
      ${data.address ? `
      <div class="row">
        <span class="label">Adres</span>
        <span class="value">${data.address}</span>
      </div>` : ''}
    </div>

    <p style="font-size:13px;">Randevuya zamanında gelmenizi tavsiye ederiz. İyi günler dileriz!</p>
  </div>`
  return emailWrapper(content)
}
