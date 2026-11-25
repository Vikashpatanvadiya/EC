import Link from "next/link";
export function ClosingCta() {
  return (
    <section className="bg-yellow py-20 text-center lg:py-24">
      <div className="shell">
        <p className="micro">Your phone called.</p>

        <h2 className="mx-auto mt-6 max-w-[24ch]">
          It wants a little character.
        </h2>

        <p className="lede mx-auto mt-5 max-w-[46ch]">
          Start with a design. End with something unmistakably you.
        </p>

        <Link href="/shop" className="pill mt-9">
          Find your case personality
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
