import { db } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * Veritabanına bildirim kaydet
 */
export async function createNotification(params: CreateNotificationParams) {
  return db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data ? JSON.stringify(params.data) : null,
    },
  })
}

/**
 * Randevu onaylandı bildirimi
 */
export async function notifyAppointmentConfirmed(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: true,
      pet: true,
      business: true,
      service: true,
    },
  })

  if (!appointment) return

  const date = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(appointment.date)

  const time = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(appointment.date)

  // In-app bildirim
  await createNotification({
    userId: appointment.userId,
    type: 'APPOINTMENT_CONFIRMED',
    title: 'Randevunuz Onaylandı',
    body: `${appointment.business.name} randevunuzu onayladı. ${date}, ${time}`,
    data: { appointmentId },
  })

  // Email
  if (appointment.user.email) {
    const template = emailTemplates.appointmentConfirmed({
      petOwnerName: appointment.user.name || 'Değerli Müşteri',
      petName: appointment.pet.name,
      businessName: appointment.business.name,
      date,
      time,
      serviceName: appointment.service?.name || 'Belirtilmedi',
    })
    await sendEmail({
      to: appointment.user.email,
      ...template,
    })
  }
}

/**
 * Randevu reddedildi bildirimi
 */
export async function notifyAppointmentRejected(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: true,
      business: true,
    },
  })

  if (!appointment) return

  const date = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(appointment.date)

  await createNotification({
    userId: appointment.userId,
    type: 'APPOINTMENT_REJECTED',
    title: 'Randevu Talebi Reddedildi',
    body: `${appointment.business.name} randevu talebinizi reddetti.`,
    data: { appointmentId },
  })

  if (appointment.user.email) {
    const template = emailTemplates.appointmentRejected({
      petOwnerName: appointment.user.name || 'Değerli Müşteri',
      businessName: appointment.business.name,
      date,
    })
    await sendEmail({
      to: appointment.user.email,
      ...template,
    })
  }
}

/**
 * Bakım tamamlandı bildirimi
 */
export async function notifyGroomingCompleted(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: true,
      pet: true,
      business: true,
    },
  })

  if (!appointment) return

  await createNotification({
    userId: appointment.userId,
    type: 'GROOMING_COMPLETED',
    title: `${appointment.pet.name} Hazır!`,
    body: `${appointment.pet.name} bakımı tamamlandı! ${appointment.business.name}'den alabilirsiniz.`,
    data: { appointmentId },
  })

  if (appointment.user.email) {
    const template = emailTemplates.groomingCompleted({
      petOwnerName: appointment.user.name || 'Değerli Müşteri',
      petName: appointment.pet.name,
      businessName: appointment.business.name,
    })
    await sendEmail({
      to: appointment.user.email,
      ...template,
    })
  }
}

/**
 * Yeni randevu talebi (kuaföre)
 */
export async function notifyNewAppointmentRequest(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      pet: true,
      business: {
        include: { owner: true },
      },
    },
  })

  if (!appointment?.business.owner) return

  const date = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(appointment.date)

  await createNotification({
    userId: appointment.business.owner.id,
    type: 'NEW_APPOINTMENT_REQUEST',
    title: 'Yeni Randevu Talebi',
    body: `${appointment.pet.name} için ${date} tarihinde randevu talebi var.`,
    data: { appointmentId },
  })
}
