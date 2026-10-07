
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const Room = require("./models/Room");

const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gearRoutes = require("./routes/gearRoutes");
const communityRoutes = require("./routes/communityRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const trekRoutes = require("./routes/trekRoutes");
const flightRoutes = require("./routes/flightRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// BASIC MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// REQUEST LOGGER
// =====================================================

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

// =====================================================
// ROOT ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Himalayan Backpacker House API is running",
  });
});

// =====================================================
// DYNAMIC SEO SITEMAP
// =====================================================

app.get("/sitemap.xml", async (req, res) => {
  console.log("[SITEMAP] Request received");

  try {
    // -------------------------------------------------
    // GET INDEXABLE ROOMS / HOTELS
    // -------------------------------------------------

    const rooms = await Room.find({
      available: true,
      seoSlug: {
        $exists: true,
        $nin: ["", null],
      },
    })
      .select("seoSlug updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    console.log(
      `[SITEMAP] Found ${rooms.length} rooms with SEO slugs`
    );

    // -------------------------------------------------
    // STATIC WEBSITE URLS
    // -------------------------------------------------

    const staticUrls = [
      {
        loc: "https://www.backpackergateways.com/",
        changefreq: "weekly",
        priority: "1.0",
      },
      {
        loc: "https://www.backpackergateways.com/rooms",
        changefreq: "daily",
        priority: "0.9",
      },
      {
        loc: "https://www.backpackergateways.com/trekking",
        changefreq: "weekly",
        priority: "0.9",
      },
      {
        loc: "https://www.backpackergateways.com/gear",
        changefreq: "weekly",
        priority: "0.8",
      },
      {
        loc: "https://www.backpackergateways.com/experiences",
        changefreq: "weekly",
        priority: "0.9",
      },
      {
        loc: "https://www.backpackergateways.com/community",
        changefreq: "daily",
        priority: "0.8",
      },
      {
        loc: "https://www.backpackergateways.com/blog",
        changefreq: "weekly",
        priority: "0.8",
      },
      {
        loc: "https://www.backpackergateways.com/about",
        changefreq: "monthly",
        priority: "0.6",
      },
      {
        loc: "https://www.backpackergateways.com/contact",
        changefreq: "monthly",
        priority: "0.7",
      },
    ];

    // -------------------------------------------------
    // XML ESCAPE
    // -------------------------------------------------

    const escapeXml = (value) => {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    // -------------------------------------------------
    // STATIC XML
    // -------------------------------------------------

    const staticXml = staticUrls
      .map(
        (url) => `
  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
      )
      .join("");

    // -------------------------------------------------
    // ROOM / HOTEL XML
    // -------------------------------------------------

    const roomXml = rooms
      .map((room) => {
        const lastmod = room.updatedAt
          ? new Date(room.updatedAt).toISOString()
          : null;

        const slug = encodeURIComponent(room.seoSlug);

        return `
  <url>
    <loc>https://www.backpackergateways.com/rooms/${slug}</loc>
    ${
      lastmod
        ? `<lastmod>${lastmod}</lastmod>`
        : ""
    }
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join("");

    // -------------------------------------------------
    // FINAL XML DOCUMENT
    // -------------------------------------------------

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${roomXml}
</urlset>`;

    // -------------------------------------------------
    // RESPONSE HEADERS
    // -------------------------------------------------

    res.status(200);

    res.set(
      "Content-Type",
      "application/xml; charset=utf-8"
    );

    res.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600"
    );

    res.send(sitemap);

    console.log("[SITEMAP] Sitemap sent successfully");
  } catch (error) {
    console.error("[SITEMAP ERROR]:", error);

    res
      .status(500)
      .type("text")
      .send("Unable to generate sitemap");
  }
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/rooms", roomRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/gears", gearRoutes);

app.use("/api/community", communityRoutes);

app.use("/api/inquiries", inquiryRoutes);

app.use("/api/treks", trekRoutes);

app.use("/api/flights", flightRoutes);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  console.log(
    `[404] Route not found: ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
});

// =====================================================
// START SERVER
// =====================================================

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("=================================");
      console.log(
        `Backend running on http://localhost:${PORT}`
      );
      console.log("MongoDB connected");
      console.log("SEO Sitemap: /sitemap.xml");
      console.log("Trekking API: /api/treks");
      console.log("Flight API: /api/flights");
      console.log("=================================");
    });
  })
  .catch((error) => {
    console.error(
      "Server startup failed:",
      error.message
    );
  });

