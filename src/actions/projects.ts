'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { projectSchema } from '@/lib/validation'
import type { FormState } from '@/actions/profile'

async function parseProject(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    description: formData.get('description'),
    coverImageUrl: formData.get('coverImageUrl'),
    technologies: formData.get('technologies'),
    githubUrl: formData.get('githubUrl'),
    demoUrl: formData.get('demoUrl'),
    date: formData.get('date'),
    role: formData.get('role'),
    featured: formData.get('featured') === 'on',
  }
  return projectSchema.safeParse(raw)
}

export async function createProject(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const parsed = await parseProject(formData)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const count = await db.project.count({ where: { userId: user.id } })

  try {
    await db.project.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        coverImageUrl: parsed.data.coverImageUrl || null,
        technologies: parsed.data.technologies,
        githubUrl: parsed.data.githubUrl || null,
        demoUrl: parsed.data.demoUrl || null,
        date: parsed.data.date || null,
        role: parsed.data.role || null,
        featured: parsed.data.featured ?? false,
        orderIndex: count,
      },
    })
  } catch (error) {
    console.error('createProject failed', error)
    return { message: 'Something went wrong while saving your project. Please try again.' }
  }

  revalidatePath('/dashboard/portfolio/projects')
  revalidatePath('/dashboard')
  redirect('/dashboard/portfolio/projects')
}

export async function updateProject(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const id = String(formData.get('id') ?? '')
  const parsed = await parseProject(formData)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const result = await db.project.updateMany({
    where: { id, userId: user.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      coverImageUrl: parsed.data.coverImageUrl || null,
      technologies: parsed.data.technologies,
      githubUrl: parsed.data.githubUrl || null,
      demoUrl: parsed.data.demoUrl || null,
      date: parsed.data.date || null,
      role: parsed.data.role || null,
      featured: parsed.data.featured ?? false,
    },
  })
  if (result.count === 0) return { message: 'Project not found.' }

  revalidatePath('/dashboard/portfolio/projects')
  revalidatePath('/dashboard')
  redirect('/dashboard/portfolio/projects')
}

export async function deleteProject(id: string): Promise<void> {
  const user = await requireUser()
  await db.project.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/dashboard/portfolio/projects')
  revalidatePath('/dashboard')
}

export async function toggleFeaturedProject(id: string): Promise<void> {
  const user = await requireUser()
  const project = await db.project.findFirst({
    where: { id, userId: user.id },
    select: { featured: true },
  })
  if (!project) return
  await db.project.updateMany({
    where: { id, userId: user.id },
    data: { featured: !project.featured },
  })
  revalidatePath('/dashboard/portfolio/projects')
  revalidatePath('/dashboard')
}

export async function reorderProjects(ids: string[]): Promise<void> {
  const user = await requireUser()
  
  // Prevent DoS with excessive array sizes
  if (ids.length > 100) {
    throw new Error('Too many items to reorder')
  }
  
  const projects = await db.project.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  })
  const owned = new Set(projects.map((p) => p.id))
  const ordered = ids.filter((id) => owned.has(id))
  await db.$transaction(
    ordered.map((id, index) =>
      db.project.updateMany({ where: { id, userId: user.id }, data: { orderIndex: index } })
    )
  )
  revalidatePath('/dashboard/portfolio/projects')
  revalidatePath('/dashboard')
}
