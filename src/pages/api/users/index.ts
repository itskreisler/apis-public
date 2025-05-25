
import type { APIContext } from 'astro'
import { z } from 'astro:schema'
export const prerender = false
// Define the user schema with Zod for validation
const userSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be less than 50 characters' }),
  email: z.string()
    .email({ message: 'Invalid email address' }),
  age: z.number()
    .int()
    .min(18, { message: 'You must be at least 18 years old' })
    .max(120, { message: 'Age must be less than 120' }),
  bio: z.string()
    .max(500, { message: 'Bio must be less than 500 characters' })
    .optional()
})

// Mock database
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

export async function GET({ request }: APIContext) {
  // Get query parameters for pagination
  const get: {
    limit?: string
    offset?: string
  } = Object.fromEntries(new URL(request.url).searchParams.entries())
  const limitParam = get.limit
  const offsetParam = get.offset
  console.log({ limitParam, offsetParam }, get)

  // Parse and validate query parameters
  const querySchema = z.object({
    limit: z.string().regex(/^\d+$/).transform(Number)
      .refine(val => val >= 1 && val <= 100, { message: 'Limit must be between 1 and 100' })
      .optional()
      .default('10'),
    offset: z.string().regex(/^\d+$/).transform(Number)
      .refine(val => val >= 0, { message: 'Offset must be at least 0' })
      .optional()
      .default('0')
  })

  try {
    const { limit, offset } = querySchema.parse({
      limit: limitParam,
      offset: offsetParam
    })

    // Get paginated users
    const paginatedUsers = users.slice(offset, offset + limit)

    return new Response(
      JSON.stringify({
        users: paginatedUsers.map(({ id, name, email, age }) => ({ id, name, email, age })),
        total: users.length
      }),
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
          error: 'Invalid query parameters',
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

export async function POST({ request }: APIContext) {
  try {
    const body = await request.json()

    // Validate the request body against our schema
    const validatedData = userSchema.parse(body)

    // In a real app, you would save this to a database
    const newUser = {
      id: crypto.randomUUID(),
      ...validatedData,
      bio: validatedData.bio ?? '',
      createdAt: new Date().toISOString()
    }

    // Add to our mock database
    users.push(newUser)

    return new Response(
      JSON.stringify(newUser),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
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
