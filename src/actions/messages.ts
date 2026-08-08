'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export async function markContactMessageRead(messageId: string): Promise<void> {
  const user = await requireUser()
  await db.contactMessage.updateMany({
    where: { id: messageId, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  })
  revalidatePath('/dashboard/messages')
}

export async function deleteContactMessage(messageId: string): Promise<void> {
  const user = await requireUser()
  await db.contactMessage.deleteMany({
    where: { id: messageId, userId: user.id },
  })
  revalidatePath('/dashboard/messages')
}
