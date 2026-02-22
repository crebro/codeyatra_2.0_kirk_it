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
      className="rounded-full border border-[#594545]/15 bg-[#FFF8EA] px-5 py-2 font-sans text-sm font-medium text-[#594545] transition-colors hover:bg-[#FFF0D6]"
    >
      Logout
    </button>
  );
}
