import 'server-only'
import { db } from '@/lib/db'

/**
 * Database-backed rate limiter for production use.
 * Tracks rate limits in a persistent RateLimit table.
 */

const CLEANUP_PROBABILITY = 0.01 // 1% chance to cleanup expired records

interface RateLimitConfig {
  /** Unique identifier for the rate limit bucket (e.g., 'login:user@example.com') */
  key: string
  /** Maximum number of attempts allowed */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: Date
}

/**
 * Check if a rate limit has been exceeded and increment the counter.
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowMs)
  const resetAt = new Date(now.getTime() + config.windowMs)

  // Periodically cleanup expired records to prevent table growth
  if (Math.random() < CLEANUP_PROBABILITY) {
    void cleanupExpiredRateLimits().catch((err) =>
      console.error('Rate limit cleanup failed:', err)
    )
  }

  try {
    // Count recent attempts within the window
    const attempts = await db.rateLimit.count({
      where: {
        key: config.key,
        createdAt: { gte: windowStart },
      },
    })

    if (attempts >= config.limit) {
      return {
        success: false,
        remaining: 0,
        resetAt,
      }
    }

    // Record this attempt
    await db.rateLimit.create({
      data: {
        key: config.key,
        expiresAt: resetAt,
      },
    })

    return {
      success: true,
      remaining: config.limit - attempts - 1,
      resetAt,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open in case of database errors to avoid blocking legitimate users
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt,
    }
  }
}

/**
 * Remove expired rate limit records from the database.
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
  const now = new Date()
  await db.rateLimit.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  })
}

/**
 * Helper function for login rate limiting.
 */
export async function checkLoginRateLimit(email: string): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `login:${email}`,
    limit: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Helper function for signup rate limiting (by IP).
 */
export async function checkSignupRateLimit(ip: string): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `signup:${ip}`,
    limit: 3, // 3 signups
    windowMs: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Helper function for password reset rate limiting.
 */
export async function checkPasswordResetRateLimit(email: string): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `password-reset:${email}`,
    limit: 3, // 3 attempts
    windowMs: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Helper function for contact form rate limiting (by IP).
 */
export async function checkContactFormRateLimit(ip: string): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `contact:${ip}`,
    limit: 5, // 5 messages
    windowMs: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Helper function for email verification rate limiting.
 */
export async function checkEmailVerificationRateLimit(
  userId: string
): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `email-verify:${userId}`,
    limit: 3, // 3 attempts
    windowMs: 60 * 60 * 1000, // 1 hour
  })
}
