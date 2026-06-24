'use server'

export async function createGeneration(prevState: unknown, formData: FormData): Promise<string | null> {
  const title = formData.get('title') as string
  if (!title || title.trim() === '') {
    return 'Title is required'
  }
  return null
}
