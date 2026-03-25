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
}): string {
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
