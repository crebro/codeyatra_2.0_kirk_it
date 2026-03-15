"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={logout}
      className="rounded-full border border-vdf-deep-brown/15 bg-vdf-cream px-5 py-2 font-sans text-sm font-medium text-vdf-deep-brown transition-colors hover:bg-vdf-cream-alt"
    >
      Logout
    </button>
  );
}
