export function Marquee() {
  return (
    <div className="bg-blue py-5">
      <div className="shell flex items-center justify-center gap-6 text-cream sm:gap-10">
        <p className="micro">Not another boring case</p>
        <span aria-hidden="true" className="text-base leading-none">
          ✦
        </span>
        <p className="micro">A pocket-sized personality</p>
      </div>
    </div>
  );
}
