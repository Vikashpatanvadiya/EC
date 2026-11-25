
const STEPS = [
  {
    n: "01",
    title: "Find your starting point",
    body: "Go bold, keep it minimal, or bring an idea that's entirely your own.",
  },
  {
    n: "02",
    title: "Add your signature",
    body: "A name, an illustration, a favourite colour. The details are the difference.",
  },
  {
    n: "03",
    title: "Make it your everyday",
    body: "A little piece of self-expression, ready to go wherever you do.",
  },
];

export function Steps() {
  return (
    <section id="make-it-yours" className="bg-pink py-16 lg:py-24">
      <div className="shell grid items-center gap-12 lg:grid-cols-[560fr_480fr] lg:gap-16">
        {/* Blue concept card */}
        <div className="relative overflow-hidden rounded-[24px] bg-blue px-8 py-10 sm:px-10 sm:py-12 lg:aspect-[560/460] lg:flex lg:flex-col lg:justify-center">
          <span aria-hidden="true" className="block text-2xl text-lime">
            ✎
          </span>

          <h2 className="mt-6 text-lime">Your name. Your art. Your rules.</h2>

          <p className="lede mt-5 text-cream/85">A one-of-you kind of case.</p>
        </div>

        {/* Steps */}
        <div>
          <p className="micro">02 / Make it personal</p>

          <h2 className="mt-5 max-w-[16ch]">
            You bring the spark. We bring the craft.
          </h2>

          <ol className="mt-10">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-ink/20 py-6"
              >
                <span className="micro pt-1">{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p className="mt-2 max-w-[46ch] text-[0.9375rem] leading-relaxed tracking-[-0.02em]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
