(async () => {
    const url = new URL('http://localhost:4321/api/services/ig')

    const links = await (await globalThis.fetch(url, {
        method: 'POST',
        body: JSON.stringify({ url: 'https://www.instagram.com/p/DKDK8TUx6nW/?utm_source=ig_web_copy_link' }), headers: { 'Content-Type': 'application/json' }
    })).json()
    console.log({
        links
    })
})()
