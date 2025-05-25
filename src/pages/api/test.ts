import type { APIRoute, APIContext } from 'astro'

export const prerender = false

export const GET: APIRoute = (context: APIContext) => api(context)
export const POST: APIRoute = (context: APIContext) => api(context)
export const PUT: APIRoute = (context: APIContext) => api(context)
export const DELETE: APIRoute = (context: APIContext) => api(context)

export async function api({ request }: APIContext) {
    const { method } = request

    switch (method) {
        case 'GET': {
            const get = Object.fromEntries(new URL(request.url).searchParams.entries())
            return new Response(JSON.stringify({ get }), { status: 200 })
        }
        case 'POST': {
            const isJson = request.headers.get('Content-Type') === 'application/json'
            if (isJson) {
                const [error, post] = await (async () => {
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
                if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
                return new Response(JSON.stringify({ post }), { status: 200 })
            }
            return new Response('Content-Type must be application/json', { status: 400 })
        }
        default:
            return new Response('Method not allowed', { status: 405 })
    }
}
