import type { APIContext } from 'astro'
import { z } from 'astro:schema'
export const prerender = false
// Mock database - shared with the main users endpoint
const users = [
  {
    id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    name: 'Jane Doe',
    email: 'jane@example.com',
    age: 28,
    bio: 'Software engineer and open-source contributor',
    createdAt: '2023-04-12T09:15:00Z'
  }
]

// Validate UUID format
const uuidSchema = z.string().uuid({ message: 'Invalid user ID format' })

export async function GET({ params }: APIContext) {
  try {
    // Validate the ID parameter
    const validatedId = uuidSchema.parse(params.id)

    // Find the user
    const user = users.find(user => user.id === validatedId)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new Response(
      JSON.stringify(user),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid user ID',
          issues: error.errors
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
