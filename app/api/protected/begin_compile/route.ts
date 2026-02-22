import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request
) {
  
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!user || error) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
  }

  // parse body
  let body: any
  try {
    body = await request.json()
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { video_id } = body ?? {}

  if (!video_id) {
    return new Response(JSON.stringify({ error: 'Missing video_id' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    // Create server-side supabase client with service role key for DB queries
    const supabase = await createClient();

    // Try to fetch the video row ensuring ownership by the authenticated user
    // Accept either primary key `id` or a `video_id` column
    const { data: videoRow, error: selectErr } = await supabase
      .from('video_urls')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', video_id)
      // .or(orFilter)
      // .eq('user_id', user.id)
      .maybeSingle()

    if (selectErr) {
      return new Response(JSON.stringify({ error: selectErr.message }), { status: 500, headers: { 'content-type': 'application/json' } })
    }

    if (!videoRow) {
      return new Response(JSON.stringify({ error: 'Video not found or not owned by user' }), { status: 403, headers: { 'content-type': 'application/json' } })
    }

    // Determine path/url field from the row
    const video_path = videoRow.video_path ?? videoRow.url ?? videoRow.video_url ?? videoRow.path

    if (!video_path) {
      return new Response(JSON.stringify({ error: 'Video path/url not available' }), { status: 500, headers: { 'content-type': 'application/json' } })
    }

    // Forward to compile service
    const serviceUrl = process.env.COMPILE_REQUEST_SERVICE_URL
    const compileHeaderValue = process.env.X_COMPILE_REQUEST_HEADER

    if (!serviceUrl) {
      return new Response(JSON.stringify({ error: 'COMPILE_REQUEST_SERVICE_URL not configured' }), { status: 500, headers: { 'content-type': 'application/json' } })
    }

    const headers: Record<string, string> = { 'content-type': 'application/json' }
    if (compileHeaderValue) headers['X-Compile-Request-Header'] = compileHeaderValue

    try {
      const res = await fetch(serviceUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ video_path, video_id }),
      })

      const text = await res.text()

      return new Response(JSON.stringify({ forwarded: true, status: res.status, body: text }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 502, headers: { 'content-type': 'application/json' } })
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}