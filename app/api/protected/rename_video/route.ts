import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    console.error("[rename_video] auth failed:", error?.message);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body: { video_id?: string; title?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { video_id, title } = body ?? {};

  if (!video_id || !title?.trim()) {
    return new Response(
      JSON.stringify({ error: "Missing video_id or title" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  try {
    const { data, error: updateErr } = await supabase
      .from("video_urls")
      .update({ video_title: title.trim() })
      .eq("id", video_id)
      .eq("user_id", user.id)
      .select();

    if (updateErr) {
      console.error("[rename_video] update error:", updateErr);
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    if (!data || data.length === 0) {
      console.error("[rename_video] no rows updated for video_id:", video_id);
      return new Response(
        JSON.stringify({ error: "Video not found or not owned by user" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[rename_video] exception:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
