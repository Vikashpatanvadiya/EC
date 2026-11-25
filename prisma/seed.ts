import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SKY = "#cfe0fa";
const LIME = "#d6ef78";
const PINK = "#f8bbd1";
const YELLOW = "#f9e88d";
const SAND = "#e8dcc4";

const PRODUCTS = [
  {
    slug: "i-am-a-wolf",
    name: "I Am A Wolf",
    label: "Wolf Spirit",
    description:
      "Torn-paper collage, ink wash and a stare that does not blink. Printed edge to edge on a clear shell.",
    pricePaise: 49900,
    image: "/cases/1.webp",
    tint: YELLOW,
    collection: "Wild",
    tilt: -7,
  },
  {
    slug: "love-letters",
    name: "Love Letters",
    label: "Paper Hearts",
    description:
      "Pressed poetry, a paper butterfly and the quiet part of a love story.",
    pricePaise: 49900,
    image: "/cases/2.webp",
    tint: PINK,
    collection: "Vintage",
    tilt: 0,
  },
  {
    slug: "har-har-mahadev",
    name: "Har Har Mahadev",
    label: "Divine Night",
    description:
      "Moonlit devotion — trishul, damaru and a sky full of Om, in deep indigo.",
    pricePaise: 54900,
    image: "/cases/3.webp",
    tint: SKY,
    collection: "Devotion",
    tilt: 0,
  },
  {
    slug: "manga-mode",
    name: "Manga Mode",
    label: "Ink & Panels",
    description:
      "A full wall of panels in black and white, with your hero up front in colour.",
    pricePaise: 54900,
    image: "/cases/4.webp",
    tint: LIME,
    collection: "Anime",
    tilt: 6,
  },
  {
    slug: "the-end",
    name: "The End",
    label: "Wild West",
    description:
      "Sun-bleached americana, bull skull and stickers that earned their place.",
    pricePaise: 49900,
    image: "/cases/5.webp",
    tint: SAND,
    collection: "Wild",
    tilt: 0,
  },
  {
    slug: "love-story",
    name: "Love Story",
    label: "Your Photo",
    description:
      "Send us the picture. We set it in gingham, type and one orange butterfly.",
    pricePaise: 59900,
    image: "/cases/6.webp",
    tint: PINK,
    collection: "Your Photo",
    tilt: 0,
  },
  {
    slug: "smile-for-the-camera",
    name: "Smile For The Camera",
    label: "Shutter Club",
    description:
      "For the one who is always behind the lens and never in the frame.",
    pricePaise: 54900,
    image: "/cases/7.webp",
    tint: SKY,
    collection: "Vintage",
    tilt: -6,
  },
  {
    slug: "dare-to-dream",
    name: "Dare To Dream",
    label: "Vintage Reel",
    description:
      "Film strips, torn kraft and a hand holding the whole thing steady.",
    pricePaise: 54900,
    image: "/cases/8.webp",
    tint: YELLOW,
    collection: "Vintage",
    tilt: 0,
  },
  {
    slug: "blue-gingham",
    name: "Blue Gingham",
    label: "Pocket Friend",
    description:
      "Soft checks and a cartoon that has been cheering you on since forever.",
    pricePaise: 49900,
    image: "/cases/9.webp",
    tint: LIME,
    collection: "Anime",
    tilt: 0,
  },
];

const BRANDS: {
  name: string;
  slug: string;
  models: { name: string; extraPaise?: number }[];
}[] = [
  {
    name: "Apple",
    slug: "apple",
    models: [
      { name: "iPhone 17 Pro Max", extraPaise: 5000 },
      { name: "iPhone 17 Pro", extraPaise: 5000 },
      { name: "iPhone 17" },
      { name: "iPhone 16 Pro Max", extraPaise: 5000 },
      { name: "iPhone 16 Pro" },
      { name: "iPhone 16 Plus" },
      { name: "iPhone 16" },
      { name: "iPhone 15 Pro Max", extraPaise: 5000 },
      { name: "iPhone 15 Pro" },
      { name: "iPhone 15" },
      { name: "iPhone 14 Pro Max" },
      { name: "iPhone 14" },
      { name: "iPhone 13" },
      { name: "iPhone 12" },
      { name: "iPhone 11" },
    ],
  },
  {
    name: "Samsung",
    slug: "samsung",
    models: [
      { name: "Galaxy S25 Ultra", extraPaise: 5000 },
      { name: "Galaxy S25+" },
      { name: "Galaxy S25" },
      { name: "Galaxy S24 Ultra", extraPaise: 5000 },
      { name: "Galaxy S24+" },
      { name: "Galaxy S24" },
      { name: "Galaxy S23 Ultra" },
      { name: "Galaxy S23" },
      { name: "Galaxy A55" },
      { name: "Galaxy A35" },
      { name: "Galaxy A15" },
      { name: "Galaxy M35" },
    ],
  },
  {
    name: "OnePlus",
    slug: "oneplus",
    models: [
      { name: "OnePlus 13" },
      { name: "OnePlus 12" },
      { name: "OnePlus 12R" },
      { name: "OnePlus Nord 4" },
      { name: "OnePlus Nord CE 4" },
    ],
  },
  {
    name: "Xiaomi",
    slug: "xiaomi",
    models: [
      { name: "Xiaomi 14" },
      { name: "Redmi Note 14 Pro+" },
      { name: "Redmi Note 14" },
      { name: "Redmi 13C" },
      { name: "Poco X6 Pro" },
    ],
  },
  {
    name: "Google",
    slug: "google",
    models: [
      { name: "Pixel 9 Pro XL", extraPaise: 5000 },
      { name: "Pixel 9 Pro" },
      { name: "Pixel 9" },
      { name: "Pixel 8a" },
      { name: "Pixel 8" },
    ],
  },
  {
    name: "Vivo",
    slug: "vivo",
    models: [
      { name: "Vivo V40 Pro" },
      { name: "Vivo V40" },
      { name: "Vivo T3" },
      { name: "Vivo Y28" },
    ],
  },
  {
    name: "Oppo",
    slug: "oppo",
    models: [
      { name: "Oppo Reno 12 Pro" },
      { name: "Oppo Reno 12" },
      { name: "Oppo F27 Pro+" },
      { name: "Oppo A78" },
    ],
  },
  {
    name: "Realme",
    slug: "realme",
    models: [
      { name: "Realme 13 Pro+" },
      { name: "Realme 13 Pro" },
      { name: "Realme Narzo 70" },
      { name: "Realme C65" },
    ],
  },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function main() {
  // Products
  for (const [i, p] of PRODUCTS.entries()) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p, sortOrder: i },
      create: { ...p, sortOrder: i },
    });
  }
  console.log(`✓ ${PRODUCTS.length} products`);

  // Brands + models
  let modelCount = 0;
  for (const [bi, b] of BRANDS.entries()) {
    const brand = await prisma.phoneBrand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, sortOrder: bi },
      create: { name: b.name, slug: b.slug, sortOrder: bi },
    });

    for (const [mi, m] of b.models.entries()) {
      const slug = slugify(m.name);
      await prisma.phoneModel.upsert({
        where: { brandId_slug: { brandId: brand.id, slug } },
        update: { name: m.name, extraPaise: m.extraPaise ?? 0, sortOrder: mi },
        create: {
          brandId: brand.id,
          name: m.name,
          slug,
          extraPaise: m.extraPaise ?? 0,
          sortOrder: mi,
        },
      });
      modelCount++;
    }
  }
  console.log(`✓ ${BRANDS.length} brands, ${modelCount} models`);

  // Admin account. Password is overridable so it isn't a fixed secret.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@exquisitecraft.in";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Studio Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });
  console.log(`✓ admin user ${adminEmail}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
