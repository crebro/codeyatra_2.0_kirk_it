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
      <div className="rounded-xl border border-vdf-dusty-rose/15 bg-vdf-cream p-8 shadow-[0_2px_8px_rgba(89,69,69,0.08)]">
        <div className="mb-6 flex flex-col gap-1.5">
          <h2 className="font-serif text-2xl font-bold text-vdf-deep-brown">Reset Your Password</h2>
          <p className="font-sans text-sm text-vdf-dusty-rose">
            Please enter your new password below.
          </p>
        </div>
        <form onSubmit={handleForgotPassword}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-sans text-sm font-medium text-vdf-deep-brown">
                New password
              </label>
              <input
                id="password"
                type="password"
                placeholder="New password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-vdf-dusty-rose/30 bg-vdf-cream px-4 py-3 font-sans text-sm text-vdf-deep-brown placeholder:text-vdf-dusty-rose/50 transition-colors focus:border-vdf-warm-mauve focus:outline-none focus:ring-2 focus:ring-vdf-warm-mauve/20"
              />
            </div>
            {error && <p className="font-sans text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-vdf-warm-mauve px-6 py-3 font-sans text-sm font-medium text-vdf-cream transition-all hover:bg-vdf-deep-brown hover:shadow-lg disabled:opacity-60"
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
