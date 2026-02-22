import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EA]">
      {/* VDF-themed header with improved padding */}
      <header className="w-full border-b border-[#9E7676]/15 bg-[#FFF8EA]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3 md:px-14 lg:px-20">
          <div className="flex items-center gap-10">
            <Link href="/protected" className="font-serif text-xl font-bold text-[#594545]">
              VDF
            </Link>
            {/* Navigation tabs */}
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/protected"
                className="rounded-md px-4 py-2 font-sans text-sm font-medium text-[#815B5B] transition-colors hover:bg-[#9E7676]/10 hover:text-[#594545]"
              >
                Home
              </Link>
              <Link
                href="/protected/files"
                className="rounded-md px-4 py-2 font-sans text-sm font-medium text-[#815B5B] transition-colors hover:bg-[#9E7676]/10 hover:text-[#594545]"
              >
                Files
              </Link>
            </nav>
          </div>
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      {/* VDF-themed footer */}
      <footer className="w-full border-t border-[#9E7676]/15 bg-[#FFF8EA] px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span className="font-serif text-lg font-bold text-[#594545]">VDF</span>
            <span className="font-sans text-xs text-[#9E7676]">Study what matters.</span>
          </div>
          <span className="font-sans text-xs text-[#9E7676]">
            {`© ${new Date().getFullYear()} VDF`}
          </span>
        </div>
      </footer>
    </div>
  );
}
