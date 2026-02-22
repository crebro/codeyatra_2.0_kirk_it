import { Check } from "lucide-react"

const plans = [
  {
    name: "Explorer",
    price: "Free",
    period: "",
    description: "Get started with the basics",
    features: [
      "Frame extraction",
      "1 video per day",
      "Key moment detection",
      "Basic timestamps",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Scholar",
    price: "$9",
    period: "/mo",
    description: "For serious students",
    features: [
      "Unlimited videos",
      "Detailed breakdowns",
      "Chapter detection",
      "Export to notes",
      "Priority processing",
    ],
    cta: "Upgrade",
    popular: true,
  },
]

export default function VDFPricing() {
  return (
    <section id="pricing" className="grain-overlay relative w-full px-6 py-20 md:px-12 md:py-28">
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[#9E7676] mb-4">
            Pricing
          </p>
          <h2 className="font-serif text-3xl font-bold text-[#594545] md:text-4xl" style={{ textWrap: "balance" }}>
            Simple, honest pricing
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-8 transition-shadow ${
                plan.popular
                  ? "border-[#815B5B]/30 bg-[#FFF8EA] shadow-[0_4px_24px_rgba(89,69,69,0.1)]"
                  : "border-[#9E7676]/15 bg-[#FFF8EA]"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-[#815B5B] px-3 py-1 font-sans text-xs font-medium text-[#FFF8EA]">
                  Popular
                </span>
              )}

              <h3 className="font-serif text-xl font-bold text-[#594545]">
                {plan.name}
              </h3>
              <p className="mt-1 font-sans text-sm text-[#9E7676]">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold text-[#594545]">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="font-sans text-sm text-[#9E7676]">{plan.period}</span>
                )}
              </div>

              <ul className="mt-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#815B5B] shrink-0" />
                    <span className="font-sans text-sm text-[#594545]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full rounded-full py-3 font-sans text-sm font-medium transition-all ${
                  plan.popular
                    ? "bg-[#815B5B] text-[#FFF8EA] hover:bg-[#594545] hover:shadow-lg"
                    : "border border-[#594545]/20 bg-transparent text-[#594545] hover:bg-[#FFF0D6]"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
