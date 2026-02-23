import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    console.error("[delete_video] auth failed:", error?.message);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body: { video_id?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { video_id } = body ?? {};

  if (!video_id) {
    return new Response(JSON.stringify({ error: "Missing video_id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    // Verify ownership first
    const { data: row, error: selectErr } = await supabase
      .from("video_urls")
      .select("id")
      .eq("id", video_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (selectErr) {
      console.error("[delete_video] select error:", selectErr);
    }

    if (!row) {
      return new Response(
        JSON.stringify({ error: "Video not found or not owned by user" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }

    // Delete all frames that reference this video_id
    const { error: framesErr } = await supabase
      .from("video_frames")
      .delete()
      .eq("video_id", video_id);

    if (framesErr) {
      console.error("[delete_video] frames delete error:", framesErr);
    }

    // Delete the video_urls entry
    const { error: deleteErr } = await supabase
      .from("video_urls")
      .delete()
      .eq("id", video_id)
      .eq("user_id", user.id);

    if (deleteErr) {
      console.error("[delete_video] video delete error:", deleteErr);
      return new Response(JSON.stringify({ error: deleteErr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[delete_video] exception:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
