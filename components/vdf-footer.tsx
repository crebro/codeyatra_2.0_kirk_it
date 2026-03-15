export default function VDFFooter() {
  return (
    <footer className="w-full border-t border-vdf-dusty-rose/15 bg-vdf-cream px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <img src="/vdf-logo.png" alt="Logo" className="h-8" />
          <span className="font-sans text-xs text-vdf-dusty-rose">Study what matters.</span>
        </div>

        <span className="font-sans text-xs text-vdf-dusty-rose">
          {`© ${new Date().getFullYear()} VDF`}
        </span>
      </div>
    </footer>
  )
}
