import { Check } from "lucide-react"

const plans = [
  {
    name: "Explorer",
    price: "Free",
    period: "",
    description: "Get started with the basics",
    features: [
      "Free unique frames extraction",
      "3 videos per day",
      "Basic timestamps and captions",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Scholar",
    price: "NPR 300",
    period: "/mo",
    description: "For serious students",
    features: [
      "Unlimited videos",
      "Priority processing",
      "AI Summarizations",
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
          <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-vdf-dusty-rose mb-4">
            Pricing
          </p>
          <h2 className="font-serif text-3xl font-bold text-vdf-deep-brown md:text-4xl" style={{ textWrap: "balance" }}>
            Simple, honest pricing
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-8 transition-shadow ${plan.popular
                ? "border-vdf-warm-mauve/30 bg-vdf-cream shadow-[0_4px_24px_rgba(89,69,69,0.1)]"
                : "border-vdf-dusty-rose/15 bg-vdf-cream"
                }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-vdf-warm-mauve px-3 py-1 font-sans text-xs font-medium text-vdf-cream">
                  Popular
                </span>
              )}

              <h3 className="font-serif text-xl font-bold text-vdf-deep-brown">
                {plan.name}
              </h3>
              <p className="mt-1 font-sans text-sm text-vdf-dusty-rose">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold text-vdf-deep-brown">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="font-sans text-sm text-vdf-dusty-rose">{plan.period}</span>
                )}
              </div>

              <ul className="mt-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-vdf-warm-mauve shrink-0" />
                    <span className="font-sans text-sm text-vdf-deep-brown">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full rounded-full py-3 font-sans text-sm font-medium transition-all ${plan.popular
                  ? "bg-vdf-warm-mauve text-vdf-cream hover:bg-vdf-deep-brown hover:shadow-lg"
                  : "border border-vdf-deep-brown/20 bg-transparent text-vdf-deep-brown hover:bg-vdf-cream-alt"
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
