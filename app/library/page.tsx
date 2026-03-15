"use client";

import { VDFLocalLibrary } from "@/components/vdf-local-library";
import VDFHeader from "@/components/vdf-header";
import VDFFooter from "@/components/vdf-footer";

export default function LibraryPage() {
  return (
    <div className="bg-vdf-cream min-h-screen flex flex-col">
      <VDFHeader fixed={false} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <VDFLocalLibrary />
      </main>
      <VDFFooter />
    </div>
  );
}
