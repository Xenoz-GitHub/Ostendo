import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getRequiredEnv } from './env'

export type SessionPayload = {
  userId: string
}

const getSecretKey = () => {
  const secretKey = getRequiredEnv('SESSION_SECRET')
  if (secretKey.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters long for security')
  }
  return new TextEncoder().encode(secretKey)
}

export const SESSION_COOKIE = 'ostendo_session'
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

export async function createSession(userId: string): Promise<void> {
  const token = await encryptSession({ userId })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  const encodedKey = getSecretKey()
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(encodedKey)
}

export async function decryptSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const encodedKey = getSecretKey()
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    })
    if (typeof payload.userId !== 'string') return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}
