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
      <span className="font-sans text-sm text-[#815B5B]">
        Hey, {user.email}!
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="rounded-full border border-[#594545]/15 bg-[#FFF8EA] px-5 py-2 font-sans text-sm font-medium text-[#594545] transition-colors hover:bg-[#FFF0D6]"
      >
        Log in
      </Link>
      <Link
        href="/auth/sign-up"
        className="rounded-full bg-[#594545] px-5 py-2 font-sans text-sm font-medium text-[#FFF8EA] transition-colors hover:bg-[#815B5B]"
      >
        Sign up
      </Link>
    </div>
  );
}
