import { z } from 'zod'
import { isReservedUsername, USERNAME_PATTERN } from '@/lib/username'

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(80, 'Name is too long.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password is too long.'),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters.')
  .max(30, 'Username must be at most 30 characters.')
  .regex(USERNAME_PATTERN, 'Use only lowercase letters, numbers, and dashes.')
  .refine((value) => !isReservedUsername(value), 'This username is reserved.')
  .refine((value) => !/--|^-|-$/.test(value), 'Use letters, numbers, and single dashes.')

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(80, 'Name is too long.'),
  headline: z.string().trim().max(120, 'Headline is too long.').optional().or(z.literal('')),
  bio: z.string().trim().max(2000, 'Bio is too long.').optional().or(z.literal('')),
  avatarUrl: z.string().trim().url('Enter a valid image URL (https://…).').optional().or(z.literal('')),
  university: z.string().trim().max(120, 'University name is too long.').optional().or(z.literal('')),
  major: z.string().trim().max(120, 'Major is too long.').optional().or(z.literal('')),
  graduationYear: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === '' || value === undefined || value === null) return null
      const num = Number(value)
      if (Number.isNaN(num) || num < 1950 || num > 2100) return null
      return num
    }),
  location: z.string().trim().max(120, 'Location is too long.').optional().or(z.literal('')),
  contactEmail: z.string().trim().toLowerCase().email('Enter a valid email address.').optional().or(z.literal('')),
  websiteUrl: z.string().trim().url('Enter a valid URL (https://…).').optional().or(z.literal('')),
})

const optionalUrl = (message: string) =>
  z.string().trim().url(message).optional().or(z.literal(''))

export const projectSchema = z.object({
  name: z.string().trim().min(1, 'Give your project a name.').max(120, 'Name is too long.'),
  description: z.string().trim().max(5000, 'Description is too long.').optional().or(z.literal('')),
  coverImageUrl: optionalUrl('Enter a valid image URL (https://…).'),
  technologies: z
    .string()
    .trim()
    .max(500, 'Too many technologies.')
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 20)
        : []
    ),
  githubUrl: optionalUrl('Enter a valid GitHub URL (https://…).'),
  demoUrl: optionalUrl('Enter a valid demo URL (https://…).'),
  date: z.string().trim().max(50, 'Date is too long.').optional().or(z.literal('')),
  role: z.string().trim().max(80, 'Role is too long.').optional().or(z.literal('')),
  featured: z.boolean().optional(),
})

export const educationSchema = z.object({
  institution: z.string().trim().min(1, 'Enter the school or university.').max(120, 'Too long.'),
  degree: z.string().trim().max(160, 'Too long.').optional().or(z.literal('')),
  field: z.string().trim().max(120, 'Too long.').optional().or(z.literal('')),
  startYear: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === '' || value === undefined || value === null) return null
      const num = Number(value)
      if (Number.isNaN(num) || num < 1950 || num > 2100) return null
      return num
    }),
  endYear: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === '' || value === undefined || value === null) return null
      const num = Number(value)
      if (Number.isNaN(num) || num < 1950 || num > 2100) return null
      return num
    }),
  description: z.string().trim().max(2000, 'Too long.').optional().or(z.literal('')),
})

export const experienceSchema = z.object({
  organization: z.string().trim().min(1, 'Enter the company or organization.').max(120, 'Too long.'),
  position: z.string().trim().min(1, 'Enter your position.').max(120, 'Too long.'),
  description: z.string().trim().max(3000, 'Too long.').optional().or(z.literal('')),
  startMonth: z.string().trim().optional().or(z.literal('')),
  startYear: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === '' || value === undefined || value === null) return null
      const num = Number(value)
      if (Number.isNaN(num) || num < 1950 || num > 2100) return null
      return num
    }),
  endMonth: z.string().trim().optional().or(z.literal('')),
  endYear: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === '' || value === undefined || value === null) return null
      const num = Number(value)
      if (Number.isNaN(num) || num < 1950 || num > 2100) return null
      return num
    }),
  current: z.boolean().optional(),
})

export const skillSchema = z.object({
  name: z.string().trim().min(1, 'Enter a skill.').max(60, 'Skill name is too long.'),
})

export const socialSchema = z.object({
  type: z.enum(['GITHUB', 'LINKEDIN', 'INSTAGRAM', 'X', 'YOUTUBE', 'EMAIL', 'WEBSITE', 'OTHER']),
  url: z.string().trim().min(1, 'Enter the link.').max(500, 'Link is too long.'),
  label: z.string().trim().max(80, 'Label is too long.').optional().or(z.literal('')),
  visible: z.boolean().optional(),
})

export const accountEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters.')
    .max(128, 'New password is too long.'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password is too long.'),
})
