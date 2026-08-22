import 'server-only'

/**
 * Environment variable validation and type-safe access.
 * This runs at build time and runtime to ensure all required variables are set.
 */

type EnvVar = {
  key: string
  required: boolean
  description: string
}

const ENV_VARS: EnvVar[] = [
  {
    key: 'DATABASE_URL',
    required: true,
    description: 'Database connection string (MySQL)',
  },
  {
    key: 'SESSION_SECRET',
    required: true,
    description: 'Secret key for session encryption (min 32 characters)',
  },
  {
    key: 'APP_URL',
    required: false,
    description: 'Base URL of the application (fallback: auto-detect from headers)',
  },
  {
    key: 'EMAIL_PROVIDER',
    required: false,
    description: 'Email provider: "console" or "resend" (default: console)',
  },
  {
    key: 'IMGBB_API_KEYS',
    required: true,
    description: 'Comma-separated ImgBB API keys for image uploads',
  },
  {
    key: 'NODE_ENV',
    required: false,
    description: 'Node environment: development, production, or test',
  },
]

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvValidationError'
  }
}

/**
 * Validates all environment variables and throws if any required ones are missing.
 * Call this early in the application startup (e.g., in middleware or root layout).
 */
export function validateEnv(): void {
  const errors: string[] = []

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.key]

    if (envVar.required && !value) {
      errors.push(`Missing required environment variable: ${envVar.key}`)
      errors.push(`  → ${envVar.description}`)
    }

    // Additional validation for specific variables
    if (envVar.key === 'SESSION_SECRET' && value && value.length < 32) {
      errors.push(`SESSION_SECRET must be at least 32 characters long (current: ${value.length})`)
    }

    if (envVar.key === 'DATABASE_URL' && value && !value.startsWith('mysql://')) {
      errors.push(`DATABASE_URL must be a valid MySQL connection string (mysql://...)`)
    }

    if (envVar.key === 'IMGBB_API_KEYS' && value && value.split(',').length === 0) {
      errors.push(`IMGBB_API_KEYS must contain at least one API key`)
    }
  }

  if (errors.length > 0) {
    const errorMessage = [
      '❌ Environment variable validation failed:',
      '',
      ...errors,
      '',
      '📝 Please check your .env file and ensure all required variables are set.',
      '   See .env.example for reference.',
    ].join('\n')

    throw new EnvValidationError(errorMessage)
  }
}

/**
 * Get an environment variable with a fallback value.
 * Use this for optional environment variables.
 */
export function getEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

/**
 * Get a required environment variable. Throws if not set.
 * Use this for critical environment variables.
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new EnvValidationError(
      `Required environment variable ${key} is not set. Check your .env file.`
    )
  }
  return value
}

/**
 * Check if the application is running in production.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if the application is running in development.
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}
