'use server'

import { notifyNewAppointment, notifyStatusChange } from '@/lib/email/send-notifications'

export async function sendNewAppointmentNotification(appointmentId: string): Promise<void> {
  await notifyNewAppointment(appointmentId)
}

export async function sendStatusChangeNotification(appointmentId: string, newStatus: string): Promise<void> {
  await notifyStatusChange(appointmentId, newStatus)
}
