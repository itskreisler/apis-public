import type { APIRoute } from 'astro'
import { instagramGetUrl } from 'instagram-url-direct'
import { z } from 'astro:schema'

const SchemaParamsIg = z.object({
    url: z.string().url(),
    retries: z.coerce.number().int().min(0).default(5).optional(),
    delay: z.coerce.number().int().min(0).default(1000).optional()
})

export const prerender = false
const headers = { 'content-type': 'application/json' }

export const GET: APIRoute = async ({ request }) => {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries())
    console.log('🚀 ~ constGET:APIRoute= ~ searchParams:', searchParams)
    const { success, error, data } = SchemaParamsIg.safeParse(searchParams)
    if (!success) {
        return new Response(JSON.stringify(error), { status: 400, headers })
    }

    try {
        const res = await instagramGetUrl(data.url)
        return new Response(JSON.stringify(res), { status: 200, headers })
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500, headers })
    }
}
