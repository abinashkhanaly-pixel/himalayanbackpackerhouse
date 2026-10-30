
import fs from "node:fs";
import path from "node:path";

const API_URL =
  process.env.VITE_API_URL ||
  "https://backpacker-gateways-2.onrender.com/api";

const SITE_URL = "https://www.backpackergateways.com";
const OUTPUT_DIR = path.resolve("dist");
const ROOMS_DIR = path.join(OUTPUT_DIR, "rooms");

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

async function main() {
  const indexPath = path.join(OUTPUT_DIR, "index.html");

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      "dist/index.html not found. Run the Vite build first."
    );
  }

  console.log("Fetching hotel data from API...");

  const response = await fetch(`${API_URL}/rooms`);

  if (!response.ok) {
    throw new Error(`Rooms API failed: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid rooms API response.");
  }

  const template = fs.readFileSync(indexPath, "utf8");

  fs.mkdirSync(ROOMS_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;

  for (const room of result.data) {
    const slug = String(room.seoSlug || "").trim();

    if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
      console.warn("Skipping invalid room slug:", slug);
      skipped++;
      continue;
    }

    const roomName = String(room.name || "Hotel").trim();
    const destination = String(
      room.destination || "Nepal"
    ).trim();

    const title =
      String(room.seoTitle || "").trim() ||
      `${roomName} in ${destination} | Backpacker Gateways`;

    const description =
      String(room.seoDescription || "").trim() ||
      `Discover ${roomName} in ${destination}, Nepal with Backpacker Gateways. Explore accommodation details and request your booking with confidence.`;

    // HOTEL-SPECIFIC SEO KEYWORDS
    const keywords = Array.isArray(room.seoKeywords)
      ? room.seoKeywords
          .map((keyword) => String(keyword).trim())
          .filter(Boolean)
          .join(", ")
      : "";

    const canonical = `${SITE_URL}/rooms/${slug}`;

    const image =
      room.mainImage ||
      room.roomImage ||
      room.images?.[0] ||
      `${SITE_URL}/og-luxury-hotels.jpg`;

    const images =
      Array.isArray(room.images) && room.images.length
        ? room.images
        : [image];

    // HOTEL STRUCTURED DATA
    const hotelSchema = {
      "@context": "https://schema.org",
      "@type": "Hotel",
      "@id": `${canonical}#hotel`,
      name: roomName,
      url: canonical,
      description,
      image: images,
      address: {
        "@type": "PostalAddress",
        addressLocality: destination,
        addressCountry: "NP"
      },
      parentOrganization: {
        "@id": `${SITE_URL}/#organization`
      }
    };

    const metadata = `
    <title>${escapeHtml(title)}</title>

    <meta
      name="description"
      content="${escapeHtml(description)}"
    />

    <meta
      name="keywords"
      content="${escapeHtml(keywords)}"
    />

    <link
      rel="canonical"
      href="${escapeHtml(canonical)}"
    />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:site_name" content="Backpacker Gateways" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(roomName)}" />

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />

    <!-- Hotel Structured Data -->
    <script type="application/ld+json">${JSON.stringify(hotelSchema).replace(/</g, "\\u003c")}</script>
    `;

    // Remove homepage-specific metadata before inserting hotel metadata.
    const outputHtml = template
      .replace(/<title>[\s\S]*?<\/title>/i, "")
      .replace(/<meta\s+name="description"[^>]*>/i, "")
      .replace(/<meta\s+name="keywords"[^>]*>/i, "")
      .replace(/<link\s+rel="canonical"[^>]*>/i, "")
      .replace(/<meta\s+property="og:[^>]*>/gi, "")
      .replace(/<meta\s+name="twitter:[^>]*>/gi, "")
      .replace("</head>", `${metadata}\n</head>`);

    const roomDir = path.join(ROOMS_DIR, slug);

    fs.mkdirSync(roomDir, { recursive: true });

    fs.writeFileSync(
      path.join(roomDir, "index.html"),
      outputHtml,
      "utf8"
    );

    generated++;

    console.log(`Generated: /rooms/${slug}/`);
  }

  console.log("\n================================");
  console.log(`Total rooms received: ${result.data.length}`);
  console.log(`HTML pages generated: ${generated}`);
  console.log(`Rooms skipped: ${skipped}`);
  console.log("================================\n");
}

main().catch((error) => {
  console.error("SEO prerender failed:", error);
  process.exit(1);
});
