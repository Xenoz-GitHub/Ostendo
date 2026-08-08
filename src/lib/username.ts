export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/

export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'login',
  'signup',
  'register',
  'logout',
  'dashboard',
  'settings',
  'account',
  'profile',
  'portfolio',
  'templates',
  'template',
  'preview',
  'onboarding',
  'api',
  'app',
  'www',
  'ostendo',
  'home',
  'about',
  'contact',
  'help',
  'support',
  'status',
  'privacy',
  'terms',
  'blog',
  'docs',
  'mail',
  'root',
  'system',
  'adminpanel',
])

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username)
}
