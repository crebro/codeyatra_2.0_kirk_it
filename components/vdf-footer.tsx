export default function VDFFooter() {
  return (
    <footer className="w-full border-t border-[#9E7676]/15 bg-[#FFF8EA] px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span className="font-serif text-lg font-bold text-[#594545]">VDF</span>
          <span className="font-sans text-xs text-[#9E7676]">Study what matters.</span>
        </div>

        <span className="font-sans text-xs text-[#9E7676]">
          {`© ${new Date().getFullYear()} VDF`}
        </span>
      </div>
    </footer>
  )
}
