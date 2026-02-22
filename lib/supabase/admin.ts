import { createServerClient } from "@supabase/ssr";

/**
 * Creates a Supabase client with the secret key.
 * This client bypasses RLS and should ONLY be used in server-side API routes
 * that require administrative access.
 */
export async function createAdminClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll() {
                    // No-op: admin client doesn't need to manage browser cookies
                },
            },
        },
    );
}
