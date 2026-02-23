import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    console.error("[delete_frames] auth failed:", error?.message);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body: { frame_ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { frame_ids } = body ?? {};

  if (!frame_ids || !Array.isArray(frame_ids) || frame_ids.length === 0) {
    return new Response(
      JSON.stringify({ error: "Missing or empty frame_ids array" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  try {
    // Verify the frames belong to a video owned by this user
    const { data: frameRows, error: frameSelErr } = await supabase
      .from("video_frames")
      .select("id, video_id")
      .in("id", frame_ids);

    if (frameSelErr) {
      console.error("[delete_frames] frame select error:", frameSelErr);
    }

    if (!frameRows || frameRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Frames not found" }),
        { status: 404, headers: { "content-type": "application/json" } }
      );
    }

    // Get unique video_ids and verify ownership
    const videoIds = [...new Set(frameRows.map((f) => f.video_id))];
    const { data: ownedVideos } = await supabase
      .from("video_urls")
      .select("id")
      .in("id", videoIds)
      .eq("user_id", user.id);

    const ownedVideoIds = new Set((ownedVideos ?? []).map((v) => v.id));
    const authorizedFrameIds = frameRows
      .filter((f) => ownedVideoIds.has(f.video_id))
      .map((f) => f.id);

    if (authorizedFrameIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Not authorized to delete these frames" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }

    const { error: deleteErr } = await supabase
      .from("video_frames")
      .delete()
      .in("id", authorizedFrameIds);

    if (deleteErr) {
      console.error("[delete_frames] delete error:", deleteErr);
      return new Response(JSON.stringify({ error: deleteErr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, deleted: authorizedFrameIds.length }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[delete_frames] exception:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
