import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      <span className="font-sans text-sm text-vdf-warm-mauve">
        Hey, {user.email?.split("@")[0]}!
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="rounded-full border border-vdf-deep-brown/15 bg-vdf-cream px-5 py-2 font-sans text-sm font-medium text-vdf-deep-brown transition-colors hover:bg-vdf-cream-alt"
      >
        Log in
      </Link>
      <Link
        href="/auth/sign-up"
        className="rounded-full bg-vdf-deep-brown px-5 py-2 font-sans text-sm font-medium text-vdf-cream transition-colors hover:bg-vdf-warm-mauve"
      >
        Sign up
      </Link>
    </div>
  );
}
