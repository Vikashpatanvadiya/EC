export function Story() {
  return (
    <section id="our-story" className="bg-cream py-16 lg:py-24">
      <div className="shell grid items-center gap-12 lg:grid-cols-[544fr_480fr] lg:gap-16">
        {/* Black block carrying the EC monogram, as in the reference. */}
        <div className="flex aspect-[544/335] items-center justify-center overflow-hidden rounded-[24px] bg-black">
          <span
            aria-hidden="true"
            className="bg-gradient-to-b from-[#a8c8ff] via-[#2f6bff] to-[#0b1f6b] bg-clip-text text-[clamp(4rem,14vw,9rem)] font-semibold italic leading-none tracking-[-0.06em] text-transparent"
          >
            EC
          </span>
          <span className="sr-only">Exquisite Craft monogram</span>
        </div>

        <div>
          <p className="micro">03 / Exquisite, by you</p>

          <h2 className="mt-5 max-w-[12ch]">Ordinary isn&rsquo;t our thing.</h2>

          <p className="mt-6 max-w-[48ch] text-[0.9375rem] leading-relaxed tracking-[-0.02em]">
            We&rsquo;re EXQUISITE CRAFT. We see a phone case as more than a
            cover. It&rsquo;s a tiny canvas for big ideas, a mood you can hold,
            and a little reminder that everyday things don&rsquo;t have to feel
            everyday.
          </p>

          <h3 className="mt-7 max-w-[26ch]">
            Thoughtful design. A playful spirit. Room for you.
          </h3>
        </div>
      </div>
    </section>
  );
}
