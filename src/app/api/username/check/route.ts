import type { NextRequest } from 'next/server'
import { isReservedUsername, USERNAME_PATTERN } from '@/lib/username'
import { isUsernameAvailable } from '@/lib/portfolio'

export async function GET(request: NextRequest) {
  const username = (request.nextUrl.searchParams.get('username') ?? '').trim().toLowerCase()
  if (!username) {
    return Response.json({ available: false, reason: 'empty' })
  }
  if (!USERNAME_PATTERN.test(username) || isReservedUsername(username)) {
    return Response.json({ available: false, reason: 'invalid' })
  }
  const available = await isUsernameAvailable(username)
  return Response.json({ available, reason: available ? null : 'taken' })
}
