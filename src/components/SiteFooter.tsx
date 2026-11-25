export function SiteFooter() {
  return (
    <footer className="bg-ink py-12 lg:py-14">
      <div className="shell flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lime">EXQUISITE CRAFT</h2>
          <p className="lede mt-4 text-cream/80">
            Small canvas. Endless character.
          </p>
        </div>

        <p className="micro text-cream/70">
          © {new Date().getFullYear()} Exquisite Craft
        </p>
      </div>
    </footer>
  );
}
