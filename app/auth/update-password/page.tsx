import { UpdatePasswordForm } from "@/components/update-password-form";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-vdf-cream">
      <header className="w-full border-b border-vdf-dusty-rose/15 bg-vdf-cream/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <Link href="/">
            <img src="/vdf-logo.png" alt="Logo" className="h-8" />
          </Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  );
}
