import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { MessagesList } from '@/components/dashboard/messages-list'

export const metadata: Metadata = {
  title: 'Messages',
}

export default async function MessagesPage() {
  const user = await requireUser()
  const messages = await db.contactMessage.findMany({
    where: { userId: user.id },
    orderBy: [{ readAt: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, visitorName: true, visitorEmail: true, message: true, readAt: true, createdAt: true },
  })

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Messages visitors send you through the Contact section of your portfolio."
      />
      <MessagesList messages={messages} />
    </div>
  )
}
