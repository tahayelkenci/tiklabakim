import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Tıkla Bakım <noreply@tiklabakim.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    return true
  } catch (error) {
    console.error('Email gönderilemedi:', error)
    return false
  }
}

// Email şablonları
export const emailTemplates = {
  appointmentConfirmed: (data: {
    petOwnerName: string
    petName: string
    businessName: string
    date: string
    time: string
    serviceName: string
  }) => ({
    subject: `Randevunuz Onaylandı — ${data.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF6B35; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🐾 Tıkla Bakım</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Merhaba ${data.petOwnerName}!</h2>
          <p>Randevunuz onaylandı. İşte detaylar:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FF6B35;">
            <p><strong>İşletme:</strong> ${data.businessName}</p>
            <p><strong>Pet:</strong> ${data.petName}</p>
            <p><strong>Hizmet:</strong> ${data.serviceName}</p>
            <p><strong>Tarih:</strong> ${data.date}</p>
            <p><strong>Saat:</strong> ${data.time}</p>
          </div>
          <p style="margin-top: 20px;">Randevunuzu yönetmek için <a href="${process.env.NEXT_PUBLIC_SITE_URL}/hesabim/randevularim">buraya tıklayın</a>.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>Tıkla Bakım — Türkiye'nin Pet Kuaför Platformu</p>
        </div>
      </div>
    `,
  }),

  appointmentRejected: (data: {
    petOwnerName: string
    businessName: string
    date: string
  }) => ({
    subject: `Randevu Talebi Reddedildi`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF6B35; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🐾 Tıkla Bakım</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Merhaba ${data.petOwnerName},</h2>
          <p>Maalesef ${data.businessName} işletmesine ${data.date} tarihindeki randevu talebiniz kabul edilemedi.</p>
          <p>Farklı bir tarih veya kuaför için yeni randevu alabilirsiniz.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/pet-kuafor" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Kuaför Ara</a>
        </div>
      </div>
    `,
  }),

  groomingCompleted: (data: {
    petOwnerName: string
    petName: string
    businessName: string
  }) => ({
    subject: `${data.petName} Hazır! 🐾`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2EC4B6; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🐾 Tıkla Bakım</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #2EC4B6;">Harika Haber! 🎉</h2>
          <p>Merhaba ${data.petOwnerName},</p>
          <p><strong>${data.petName}</strong> bakımını tamamladı! ${data.businessName}'den alabilirsiniz.</p>
          <p>Bakım sonrası fotoğraflarını görmek için hesabınıza giriş yapın.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/hesabim/randevularim" style="display: inline-block; background: #2EC4B6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Fotoğrafları Gör</a>
        </div>
      </div>
    `,
  }),

  appointmentReminder: (data: {
    petOwnerName: string
    petName: string
    businessName: string
    date: string
    time: string
  }) => ({
    subject: `Hatırlatma: Yarın Randevunuz Var`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF6B35; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🐾 Tıkla Bakım</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hatırlatma!</h2>
          <p>Merhaba ${data.petOwnerName},</p>
          <p>Yarın <strong>${data.petName}</strong> için ${data.businessName}'de randevunuz var.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FF6B35;">
            <p><strong>Tarih:</strong> ${data.date}</p>
            <p><strong>Saat:</strong> ${data.time}</p>
          </div>
          <p style="margin-top: 20px; color: #999; font-size: 14px;">
            Gelemeyecekseniz lütfen randevuyu önceden iptal edin.
          </p>
        </div>
      </div>
    `,
  }),
}
