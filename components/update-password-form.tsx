"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="rounded-xl border border-[#9E7676]/15 bg-[#FFF8EA] p-8 shadow-[0_2px_8px_rgba(89,69,69,0.08)]">
        <div className="mb-6 flex flex-col gap-1.5">
          <h2 className="font-serif text-2xl font-bold text-[#594545]">Reset Your Password</h2>
          <p className="font-sans text-sm text-[#9E7676]">
            Please enter your new password below.
          </p>
        </div>
        <form onSubmit={handleForgotPassword}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-sans text-sm font-medium text-[#594545]">
                New password
              </label>
              <input
                id="password"
                type="password"
                placeholder="New password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-[#9E7676]/30 bg-[#FFF8EA] px-4 py-3 font-sans text-sm text-[#594545] placeholder:text-[#9E7676]/50 transition-colors focus:border-[#815B5B] focus:outline-none focus:ring-2 focus:ring-[#815B5B]/20"
              />
            </div>
            {error && <p className="font-sans text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-[#815B5B] px-6 py-3 font-sans text-sm font-medium text-[#FFF8EA] transition-all hover:bg-[#594545] hover:shadow-lg disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save new password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
