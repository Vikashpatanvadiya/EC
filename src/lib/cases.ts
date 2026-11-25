export type CaseDesign = {
  id: string;
  /** Uppercase micro-label above the name, e.g. "WOLF SPIRIT" */
  label: string;
  name: string;
  image: string;
  /** Flat tile colour, drawn from the reference palette. */
  tint: string;
  /** Slight tilt on a few tiles, as the reference does. */
  tilt?: number;
};

const SKY = "#cfe0fa";
const LIME = "#d6ef78";
const PINK = "#f8bbd1";
const YELLOW = "#f9e88d";
const SAND = "#e8dcc4";

export const CASES: CaseDesign[] = [
  { id: "i-am-a-wolf", label: "Wolf Spirit", name: "I Am A Wolf", image: "/cases/1.webp", tint: YELLOW, tilt: -7 },
  { id: "love-letters", label: "Paper Hearts", name: "Love Letters", image: "/cases/2.webp", tint: PINK },
  { id: "har-har-mahadev", label: "Divine Night", name: "Har Har Mahadev", image: "/cases/3.webp", tint: SKY },
  { id: "manga-mode", label: "Ink & Panels", name: "Manga Mode", image: "/cases/4.webp", tint: LIME, tilt: 6 },
  { id: "the-end", label: "Wild West", name: "The End", image: "/cases/5.webp", tint: SAND },
  { id: "love-story", label: "Your Photo", name: "Love Story", image: "/cases/6.webp", tint: PINK },
  { id: "smile-for-the-camera", label: "Shutter Club", name: "Smile For The Camera", image: "/cases/7.webp", tint: SKY, tilt: -6 },
  { id: "dare-to-dream", label: "Vintage Reel", name: "Dare To Dream", image: "/cases/8.webp", tint: YELLOW },
  { id: "blue-gingham", label: "Pocket Friend", name: "Blue Gingham", image: "/cases/9.webp", tint: LIME },
];

const byId = (id: string) => CASES.find((c) => c.id === id)!;

/** The three cases inside the hero's arch. */
export const HERO_CASES = [
  byId("manga-mode"),
  byId("the-end"),
  byId("blue-gingham"),
];

/** Shown inside the blue "make it personal" card. */
export const PHOTO_CASE = byId("love-story");
