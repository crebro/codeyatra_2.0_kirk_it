import Link from "next/link";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="font-sans text-sm text-[#815B5B] leading-relaxed">
          Code error: {params.error}
        </p>
      ) : (
        <p className="font-sans text-sm text-[#815B5B] leading-relaxed">
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
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
          <div className="rounded-xl border border-[#9E7676]/15 bg-[#FFF8EA] p-8 shadow-[0_2px_8px_rgba(89,69,69,0.08)]">
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-bold text-[#594545]">
                Sorry, something went wrong.
              </h2>
            </div>
            <Suspense>
              <ErrorContent searchParams={searchParams} />
            </Suspense>
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="block w-full rounded-full bg-[#815B5B] px-6 py-3 text-center font-sans text-sm font-medium text-[#FFF8EA] transition-all hover:bg-[#594545] hover:shadow-lg"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
