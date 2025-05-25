import type { APIContext, APIRoute } from 'astro'
import { instagramGetUrl } from 'instagram-url-direct'
import { z } from 'astro:schema'

const SchemaParamsIg = z.object({
    url: z.string().url(),
    retries: z.coerce.number().int().min(0).default(5),
    delay: z.coerce.number().int().min(0).default(1000)
})
const parseParamsIg = (data: unknown) => SchemaParamsIg.safeParse(data)

export const prerender = false
const headers = { 'content-type': 'application/json' }

export const GET: APIRoute = (context: APIContext) => api(context)
export const POST: APIRoute = (context: APIContext) => api(context)

export async function api({ request }: APIContext) {
    const { method } = request

    switch (method) {
        case 'GET': {
            const getParams = Object.fromEntries(new URL(request.url).searchParams.entries())
            return getInstagramUrl(getParams)
        }
        case 'POST': {
            const isJson = request.headers.get('Content-Type') === 'application/json'
            if (isJson) {
                const [errorJson, postParams] = await (async () => {
                    try {
                        const json = await request.json()
                        return [null, json]
                    } catch (error) {
                        if (error instanceof SyntaxError) {
                            console.log('SyntaxError')
                            return [new Error(error.message), null]
                        }
                        return [error as Error, null]
                    }
                })()
                if (errorJson) return new Response(JSON.stringify({ error: errorJson.message }), { status: 400 })

                return getInstagramUrl(postParams)

            }
            return new Response('Content-Type must be application/json', { status: 400 })
        }
        default:
            return new Response('Method not allowed', { status: 405 })
    }

}

async function getInstagramUrl(content: any) {
    const { success, error, data } = parseParamsIg(content)
    if (!success) {
        return new Response(JSON.stringify(error), { status: 400, headers })
    }

    try {
        const { url, retries, delay } = data
        const res = await instagramGetUrl(url, { delay, retries })
        return new Response(JSON.stringify(res), { status: 200, headers })
    } catch (error) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
        }
        return new Response(JSON.stringify({ error: 'Unknown error' }), { status: 500, headers })
    }
}
