/**
 * Secure database wrapper that enforces user-scoped queries
 * This prevents unauthorized access to other users' data
 */

import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export type UserId = string

/**
 * Creates a secure database client scoped to a specific user
 * All queries automatically filter by userId
 */
export function createSecureDb(userId: UserId) {
  return {
    // User queries
    user: {
      findUnique: () => db.user.findUnique({ where: { id: userId } }),
      update: (data: Prisma.UserUpdateInput) =>
        db.user.update({ where: { id: userId }, data }),
    },

    // Profile queries (auto-scoped to userId)
    profile: {
      findUnique: () => db.profile.findUnique({ where: { userId } }),
      upsert: (data: Omit<Prisma.ProfileCreateInput, 'user'>) =>
        db.profile.upsert({
          where: { userId },
          create: { ...data, user: { connect: { id: userId } } },
          update: data,
        }),
      update: (data: Prisma.ProfileUpdateInput) =>
        db.profile.update({ where: { userId }, data }),
      delete: () => db.profile.delete({ where: { userId } }),
    },

    // Project queries (auto-scoped to userId)
    project: {
      findMany: (args?: Omit<Prisma.ProjectFindManyArgs, 'where'>) =>
        db.project.findMany({ ...args, where: { userId } }),
      findUnique: (id: string) =>
        db.project.findUnique({ where: { id, userId } }),
      create: (data: Omit<Prisma.ProjectCreateInput, 'user'>) =>
        db.project.create({ data: { ...data, user: { connect: { id: userId } } } }),
      update: (id: string, data: Prisma.ProjectUpdateInput) =>
        db.project.update({ where: { id, userId }, data }),
      delete: (id: string) => db.project.delete({ where: { id, userId } }),
      count: () => db.project.count({ where: { userId } }),
    },

    // Education queries (auto-scoped to userId)
    education: {
      findMany: (args?: Omit<Prisma.EducationFindManyArgs, 'where'>) =>
        db.education.findMany({ ...args, where: { userId } }),
      findUnique: (id: string) =>
        db.education.findUnique({ where: { id, userId } }),
      create: (data: Omit<Prisma.EducationCreateInput, 'user'>) =>
        db.education.create({ data: { ...data, user: { connect: { id: userId } } } }),
      update: (id: string, data: Prisma.EducationUpdateInput) =>
        db.education.update({ where: { id, userId }, data }),
      delete: (id: string) => db.education.delete({ where: { id, userId } }),
      count: () => db.education.count({ where: { userId } }),
    },

    // Experience queries (auto-scoped to userId)
    experience: {
      findMany: (args?: Omit<Prisma.ExperienceFindManyArgs, 'where'>) =>
        db.experience.findMany({ ...args, where: { userId } }),
      findUnique: (id: string) =>
        db.experience.findUnique({ where: { id, userId } }),
      create: (data: Omit<Prisma.ExperienceCreateInput, 'user'>) =>
        db.experience.create({ data: { ...data, user: { connect: { id: userId } } } }),
      update: (id: string, data: Prisma.ExperienceUpdateInput) =>
        db.experience.update({ where: { id, userId }, data }),
      delete: (id: string) => db.experience.delete({ where: { id, userId } }),
      count: () => db.experience.count({ where: { userId } }),
    },

    // Skill queries (auto-scoped to userId)
    skill: {
      findMany: (args?: Omit<Prisma.SkillFindManyArgs, 'where'>) =>
        db.skill.findMany({ ...args, where: { userId } }),
      findUnique: (id: string) =>
        db.skill.findUnique({ where: { id, userId } }),
      create: (data: Omit<Prisma.SkillCreateInput, 'user'>) =>
        db.skill.create({ data: { ...data, user: { connect: { id: userId } } } }),
      update: (id: string, data: Prisma.SkillUpdateInput) =>
        db.skill.update({ where: { id, userId }, data }),
      delete: (id: string) => db.skill.delete({ where: { id, userId } }),
      count: () => db.skill.count({ where: { userId } }),
    },

    // Social link queries (auto-scoped to userId)
    socialLink: {
      findMany: (args?: Omit<Prisma.SocialLinkFindManyArgs, 'where'>) =>
        db.socialLink.findMany({ ...args, where: { userId } }),
      findUnique: (id: string) =>
        db.socialLink.findUnique({ where: { id, userId } }),
      create: (data: Omit<Prisma.SocialLinkCreateInput, 'user'>) =>
        db.socialLink.create({ data: { ...data, user: { connect: { id: userId } } } }),
      update: (id: string, data: Prisma.SocialLinkUpdateInput) =>
        db.socialLink.update({ where: { id, userId }, data }),
      delete: (id: string) => db.socialLink.delete({ where: { id, userId } }),
    },

    // Portfolio queries (auto-scoped to userId)
    portfolio: {
      findUnique: () => db.portfolio.findUnique({ where: { userId } }),
      upsert: (data: Omit<Prisma.PortfolioCreateInput, 'user'>) =>
        db.portfolio.upsert({
          where: { userId },
          create: { ...data, user: { connect: { id: userId } } },
          update: data,
        }),
      update: (data: Prisma.PortfolioUpdateInput) =>
        db.portfolio.update({ where: { userId }, data }),
    },

    // Contact messages (user can only see their own)
    contactMessage: {
      findMany: (args?: Omit<Prisma.ContactMessageFindManyArgs, 'where'>) =>
        db.contactMessage.findMany({ ...args, where: { recipientId: userId } }),
      count: () => db.contactMessage.count({ where: { recipientId: userId } }),
    },
  }
}

/**
 * Usage example:
 * 
 * const user = await requireUser()
 * const secureDb = createSecureDb(user.id)
 * 
 * // All queries are automatically scoped to this user
 * const projects = await secureDb.project.findMany()
 * const profile = await secureDb.profile.findUnique()
 */
