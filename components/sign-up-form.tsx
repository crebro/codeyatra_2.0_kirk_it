"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/login");
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
          <h2 className="font-serif text-2xl font-bold text-vdf-deep-brown">Sign up</h2>
          <p className="font-sans text-sm text-vdf-dusty-rose">Create a new account</p>
        </div>
        <form onSubmit={handleSignUp}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-sans text-sm font-medium text-vdf-deep-brown">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-vdf-dusty-rose/30 bg-vdf-cream px-4 py-3 font-sans text-sm text-vdf-deep-brown placeholder:text-vdf-dusty-rose/50 transition-colors focus:border-vdf-warm-mauve focus:outline-none focus:ring-2 focus:ring-vdf-warm-mauve/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-sans text-sm font-medium text-vdf-deep-brown">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-vdf-dusty-rose/30 bg-vdf-cream px-4 py-3 font-sans text-sm text-vdf-deep-brown placeholder:text-vdf-dusty-rose/50 transition-colors focus:border-vdf-warm-mauve focus:outline-none focus:ring-2 focus:ring-vdf-warm-mauve/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="repeat-password" className="font-sans text-sm font-medium text-vdf-deep-brown">
                Repeat Password
              </label>
              <input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-vdf-dusty-rose/30 bg-vdf-cream px-4 py-3 font-sans text-sm text-vdf-deep-brown placeholder:text-vdf-dusty-rose/50 transition-colors focus:border-vdf-warm-mauve focus:outline-none focus:ring-2 focus:ring-vdf-warm-mauve/20"
              />
            </div>
            {error && <p className="font-sans text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-vdf-warm-mauve px-6 py-3 font-sans text-sm font-medium text-vdf-cream transition-all hover:bg-vdf-deep-brown hover:shadow-lg disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? "Creating an account..." : "Sign up"}
            </button>
          </div>
          <div className="mt-5 text-center font-sans text-sm text-vdf-dusty-rose">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-vdf-warm-mauve transition-colors hover:text-vdf-deep-brown">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
