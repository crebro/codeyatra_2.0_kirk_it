import { SignUpForm } from "@/components/sign-up-form";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-[#FFF8EA]">
      <header className="w-full border-b border-[#9E7676]/15 bg-[#FFF8EA]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="font-serif text-xl font-bold text-[#594545]">
            VDF
          </Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
