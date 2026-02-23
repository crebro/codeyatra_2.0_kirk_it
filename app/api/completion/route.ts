import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
    const incomingCode =
        request.headers.get('X-Completion-Header') || request.headers.get('x-completion-header')

    if (!incomingCode || incomingCode !== process.env.X_COMPLETION_HEADER) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
        })
    }

    let body: Record<string, unknown>
    try {
        body = await request.json()
    } catch {

        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
        })
    }

    // Accept either an array body or an object with `video_urls` array
    const rows = Array.isArray(body) ? body : Array.isArray(body?.video_urls) ? body.video_urls : null

    if (!rows || !rows.length) {
        return new Response(JSON.stringify({ error: 'No video URLs provided' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
        })
    }

    const supabase = await createAdminClient();

    const { data, error } = await supabase.from('video_frames').insert(rows)

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        })
    }

    return new Response(JSON.stringify({ inserted: data }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
    })
}