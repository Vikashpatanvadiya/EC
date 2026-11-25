# Brand — EXQUISITE CRAFT

Short form: **EC**

The design system is matched 1:1 to the supplied reference
(`https://consistent-plans-659425.framer.app/`). Colours and type below are the
reference's own computed values, measured from the live page — not approximations.

## Colour

| Token    | Hex       | Used for                                      |
| -------- | --------- | --------------------------------------------- |
| `cream`  | `#FFFDF5` | Page background, header, body text on dark    |
| `lime`   | `#D6EF78` | Hero block, footer wordmark, blue-card heading |
| `ink`    | `#17231C` | All body/heading text, pill buttons, footer   |
| `blue`   | `#244BE8` | Marquee band, "make it personal" card         |
| `yellow` | `#F9E88D` | Closing CTA block                             |
| `pink`   | `#F8BBD1` | Steps section, hero arch backdrop             |

Tile tints for the product grid (`src/lib/cases.ts`): lime, pink, yellow,
plus `#CFE0FA` (sky) and `#E8DCC4` (sand).

## Typography

**Clash Display** throughout, self-hosted from Fontshare in
`src/fonts/` and loaded via `next/font/local` (weights 400 / 500 / 600).

| Role    | Size (1440 → 800)  | Weight | Line height | Tracking |
| ------- | ------------------ | ------ | ----------- | -------- |
| h1      | 100px → 64px       | 600    | 0.95        | -0.055em |
| h2      | 56px → 40px        | 600    | 1.0         | -0.02em  |
| h3      | 25px               | 500    | 1.15        | -0.02em  |
| body    | 18px (`.lede`)     | 400    | 1.5         | -0.02em  |
| micro   | 13px (`.micro`)    | 500    | 1.3         | -0.02em  |

`h1`/`h2` scale fluidly with `clamp()` between the two measured breakpoints.

## Layout

- Content grid: **1104px** max width, centred, 24px side gutters.
- Product tiles: 352 × 420, `border-radius: 20px`.
- Feature blocks (blue card, black monogram block): `border-radius: 24px`.
- Hero arch: `border-radius: 180px 180px 24px 24px` — the cases are scaled past
  the bottom edge so they crop, as in the reference.
- Header is **not** sticky, matching the reference.

## Voice

Short, playful, second person. Sentence case for headlines, UPPERCASE for the
13px eyebrow labels. Section eyebrows are numbered: `01 / THE GOOD STUFF`.

## Notes

- The nine product photographs are transparent PNG cutouts, cropped to the case
  body plus 10% and exported to WebP in `public/cases/`. Source files stay in
  `images/`. Re-run the crop by adjusting the Pillow script if new photos arrive.
- The reference shows three product tiles; this build uses the identical tile
  design but renders all nine real products in the same 3-across grid.
