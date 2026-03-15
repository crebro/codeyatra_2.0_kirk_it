import { Link2, Search, BookOpen } from "lucide-react"

const steps = [
  {
    number: "1",
    icon: Link2,
    label: "Paste a link",
  },
  {
    number: "2",
    icon: Search,
    label: "We find the key moments",
  },
  {
    number: "3",
    icon: BookOpen,
    label: "You Study the Frames",
    locked: true,
  },
]

export default function VDFHowItWorks() {
  return (
    <section className="grain-overlay relative w-full px-6 py-20 md:px-12 md:py-28">
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-16">
          <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-vdf-dusty-rose">
            How it works
          </p>

          <div className="flex w-full flex-col items-center gap-8 md:flex-row md:gap-0">
            {steps.map((step, i) => (
              <div key={step.number} className="flex flex-1 w-full flex-col items-center gap-0 md:flex-row md:gap-0 align-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vdf-deep-brown">
                    <span className="font-sans text-sm font-semibold text-vdf-cream">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <step.icon className="h-4 w-4 text-vdf-dusty-rose" />
                    <p className="font-sans text-sm font-medium text-vdf-deep-brown">
                      {step.label}
                    </p>
                    {step.locked && (
                      <svg className="h-3.5 w-3.5 text-vdf-dusty-rose" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
