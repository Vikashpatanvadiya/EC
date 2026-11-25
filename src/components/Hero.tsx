import Link from "next/link";
import Image from "next/image";
import { HERO_CASES } from "@/lib/cases";

// Tuned so the three cases read as one group: the centre case leads and
// sits highest, the outer two fan away and drop just enough that their
// tops form an arc echoing the frame above them.
const ARRANGEMENT = [
  { tilt: -12, drop: 12, width: "50%", z: 1 },
  { tilt: 0, drop: 2, width: "54%", z: 2 },
  { tilt: 12, drop: 12, width: "50%", z: 1 },
];

export function Hero() {
  return (
    <section id="top" className="bg-lime">
      <div className="shell grid items-center gap-10 py-12 sm:py-14 lg:grid-cols-2 lg:gap-16">
        {/* Left column — copy */}
        <div>
          <p className="micro">Custom cases. Unfiltered you.</p>

          <h1 className="mt-5 max-w-[11ch] sm:mt-6">A little case. A lot of you.</h1>

          <p className="lede mt-6 max-w-[420px] sm:mt-7">
            Your colours. Your chaos. Your everyday canvas. Custom phone cases
            that turn the thing you carry into a thing you love.
          </p>

          <Link href="/shop" className="pill mt-8 sm:mt-9">
            Explore the designs
            <span aria-hidden="true">↗</span>
          </Link>

          <p className="micro mt-8 sm:mt-10">
            Designed to stand out. Made to be yours.
          </p>
        </div>

        {/* Right column — the arch, as in the reference. Cases are anchored
            to the bottom and overflow is clipped, so they crop cleanly on
            the frame's edge at every width. */}
        <div
          className="relative mx-auto flex aspect-[536/560] w-full max-w-[536px] items-end justify-center overflow-hidden bg-pink"
          style={{ borderRadius: "180px 180px 24px 24px" }}
        >
          {HERO_CASES.map((c, i) => {
            const { tilt, drop, width, z } = ARRANGEMENT[i];
            return (
              <div
                key={c.id}
                className="relative -mx-[6%]"
                style={{
                  width,
                  zIndex: z,
                  transform: `rotate(${tilt}deg) translateY(${drop}%)`,
                  transformOrigin: "bottom center",
                }}
              >
                <Image
                  src={c.image}
                  alt={`${c.name} custom phone case`}
                  width={684}
                  height={1223}
                  priority={i === 1}
                  sizes="(max-width: 1024px) 42vw, 250px"
                  className="h-auto w-full drop-shadow-[0_16px_26px_rgba(23,35,28,0.22)]"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
