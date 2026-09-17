import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import "./TrekkingDetails.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backpacker-gateways-2.onrender.com/api";

/* =========================================================
   HTML / RICH TEXT HELPERS
========================================================= */

const stripHtml = (value = "") => {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
};

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&quot;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatInlineMarkdown = (text = "") => {
  let value = escapeHtml(text);

  /*
    Bold first so **text** does not get interpreted
    incorrectly as italic.
  */
  value = value.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  value = value.replace(
    /__(.*?)__/g,
    "<strong>$1</strong>"
  );

  value = value.replace(
    /\*(.*?)\*/g,
    "<em>$1</em>"
  );

  value = value.replace(
    /_(.*?)_/g,
    "<em>$1</em>"
  );

  return value;
};

/*
  Converts plain text / simple markdown into HTML.

  Rich Editor already produces HTML, so existing HTML
  is returned without converting it again.
*/
const markdownToHtml = (value = "") => {
  if (!value) return "";

  const text = String(value).trim();

  /* Already HTML from TipTap / RichTextEditor */
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  /*
    Normalize headings that may have been pasted into
    one long line.
  */
  const normalized = text
    .replace(/\s+###\s+/g, "\n### ")
    .replace(/\s+##\s+/g, "\n## ")
    .replace(/\s+#\s+/g, "\n# ");

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const output = [];

  let bulletItems = [];

  const flushBullets = () => {
    if (!bulletItems.length) return;

    output.push(
      `<ul>${bulletItems
        .map(
          (item) =>
            `<li>${formatInlineMarkdown(item)}</li>`
        )
        .join("")}</ul>`
    );

    bulletItems = [];
  };

  lines.forEach((line) => {
    /*
      Normal bullet:
      - item
      * item
    */
    if (/^[-*]\s+/.test(line)) {
      bulletItems.push(
        line.replace(/^[-*]\s+/, "").trim()
      );
      return;
    }

    flushBullets();

    if (line.startsWith("### ")) {
      output.push(
        `<h4>${formatInlineMarkdown(
          line.substring(4)
        )}</h4>`
      );
      return;
    }

    if (line.startsWith("## ")) {
      output.push(
        `<h3>${formatInlineMarkdown(
          line.substring(3)
        )}</h3>`
      );
      return;
    }

    if (line.startsWith("# ")) {
      output.push(
        `<h2>${formatInlineMarkdown(
          line.substring(2)
        )}</h2>`
      );
      return;
    }

    output.push(
      `<p>${formatInlineMarkdown(line)}</p>`
    );
  });

  flushBullets();

  return output.join("");
};

/*
  Supports both:
  - Rich Editor HTML strings
  - arrays from MongoDB
*/
const richTextValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item) => markdownToHtml(item))
      .join("");
  }

  return markdownToHtml(value);
};

const hasRichText = (value) => {
  const html = richTextValue(value);

  const text = stripHtml(html);

  return text.length > 0;
};

/* =========================================================
   META HELPERS
========================================================= */

const setMetaTag = (
  selector,
  attributes,
  content
) => {
  if (!content) return;

  let element =
    document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");

    Object.entries(attributes).forEach(
      ([key, value]) => {
        element.setAttribute(key, value);
      }
    );

    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const removeMetaTag = (selector) => {
  const element =
    document.head.querySelector(selector);

  if (element) {
    element.remove();
  }
};

const setLinkTag = (selector, attributes) => {
  let element =
    document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");

    Object.entries(attributes).forEach(
      ([key, value]) => {
        element.setAttribute(key, value);
      }
    );

    document.head.appendChild(element);
  } else {
    Object.entries(attributes).forEach(
      ([key, value]) => {
        element.setAttribute(key, value);
      }
    );
  }
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TrekkingDetails() {
  const { slug } = useParams();

  const [trek, setTrek] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  const [showBookingModal, setShowBookingModal] =
    useState(false);

  /* =======================================================
     FETCH TREK
  ======================================================= */

  useEffect(() => {
    const fetchTrek = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/treks/slug/${slug}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load trekking package."
          );
        }

        const result =
          await response.json();

        const trekData =
          result?.data?.trek ||
          result?.data ||
          result?.trek;

        if (!trekData) {
          throw new Error(
            "Trekking package not found."
          );
        }

        setTrek(trekData);
      } catch (err) {
        console.error(
          "Error fetching trek:",
          err
        );

        setError(
          err.message ||
            "Unable to load trekking package."
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTrek();
    }
  }, [slug]);

  /* =======================================================
     SEO + JSON-LD
  ======================================================= */

  useEffect(() => {
    if (!trek) return;

    const seo = trek.seo || {};

    const metaTitle =
      seo.metaTitle ||
      `${trek.name || "Nepal Trek"} | Backpacker Gateways`;

    const metaDescription =
      seo.metaDescription ||
      stripHtml(
        trek.description ||
          trek.overview ||
          ""
      ).slice(0, 160);

    const keywords = [
      seo.primaryKeyword,
      ...(Array.isArray(
        seo.secondaryKeywords
      )
        ? seo.secondaryKeywords
        : []),
      ...(Array.isArray(
        seo.lsiKeywords
      )
        ? seo.lsiKeywords
        : []),
    ]
      .filter(Boolean)
      .flat()
      .join(", ");

    document.title = metaTitle;

    setMetaTag(
      'meta[name="description"]',
      { name: "description" },
      metaDescription
    );

    if (keywords) {
      setMetaTag(
        'meta[name="keywords"]',
        { name: "keywords" },
        keywords
      );
    }

    setMetaTag(
      'meta[name="author"]',
      { name: "author" },
      "Backpacker Gateways"
    );

    setMetaTag(
      'meta[name="robots"]',
      { name: "robots" },
      trek.published === false
        ? "noindex,nofollow"
        : "index,follow"
    );

    const canonicalUrl =
      seo.canonical ||
      `${window.location.origin}/trekking/${trek.slug}`;

    setLinkTag(
      'link[rel="canonical"]',
      {
        rel: "canonical",
        href: canonicalUrl,
      }
    );

    /* Open Graph */

    setMetaTag(
      'meta[property="og:title"]',
      { property: "og:title" },
      metaTitle
    );

    setMetaTag(
      'meta[property="og:description"]',
      { property: "og:description" },
      metaDescription
    );

    setMetaTag(
      'meta[property="og:type"]',
      { property: "og:type" },
      "article"
    );

    setMetaTag(
      'meta[property="og:url"]',
      { property: "og:url" },
      canonicalUrl
    );

    if (trek.mainImage) {
      setMetaTag(
        'meta[property="og:image"]',
        { property: "og:image" },
        trek.mainImage
      );
    } else {
      removeMetaTag(
        'meta[property="og:image"]'
      );
    }

    /* Twitter */

    setMetaTag(
      'meta[name="twitter:card"]',
      { name: "twitter:card" },
      "summary_large_image"
    );

    setMetaTag(
      'meta[name="twitter:title"]',
      { name: "twitter:title" },
      metaTitle
    );

    setMetaTag(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      metaDescription
    );

    if (trek.mainImage) {
      setMetaTag(
        'meta[name="twitter:image"]',
        { name: "twitter:image" },
        trek.mainImage
      );
    } else {
      removeMetaTag(
        'meta[name="twitter:image"]'
      );
    }

    /* JSON-LD */

    const existingJsonLd =
      document.getElementById(
        "trek-jsonld"
      );

    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    const jsonLd = {
      "@context":
        "https://schema.org",
      "@type": "TouristTrip",

      name: trek.name || "",

      description: stripHtml(
        trek.description ||
          trek.overview ||
          ""
      ),

      image: trek.mainImage
        ? [trek.mainImage]
        : [],

      itinerary:
        Array.isArray(trek.itinerary)
          ? trek.itinerary.map(
              (day) => ({
                "@type":
                  "TouristAttraction",

                name:
                  day.title ||
                  `Day ${
                    day.day || ""
                  }`,

                description:
                  stripHtml(
                    day.description ||
                      ""
                  ),
              })
            )
          : [],

      offers: {
        "@type": "Offer",

        price:
          trek.discountPrice ||
          trek.price ||
          "",

        priceCurrency:
          trek.currency || "USD",

        availability:
          "https://schema.org/InStock",

        url: canonicalUrl,
      },

      provider: {
        "@type":
          "TravelAgency",

        name:
          "Backpacker Gateways",

        url:
          window.location.origin,
      },

      touristType: [
        "Adventure Traveler",
        "Hiker",
        "Trekker",
      ],

      countryOfOrigin: {
        "@type": "Country",
        name: "Nepal",
      },

      duration: trek.duration
        ? `P${Number(
            trek.duration
          )}D`
        : undefined,
    };

    const script =
      document.createElement(
        "script"
      );

    script.id = "trek-jsonld";
    script.type =
      "application/ld+json";

    script.textContent =
      JSON.stringify(jsonLd);

    document.head.appendChild(
      script
    );

    return () => {
      const jsonLdElement =
        document.getElementById(
          "trek-jsonld"
        );

      if (jsonLdElement) {
        jsonLdElement.remove();
      }
    };
  }, [trek]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="trek-details-loading">
        Loading trekking package...
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !trek) {
    return (
      <div className="trek-details-error">
        <h2>
          Trekking Package Not Found
        </h2>

        <p>
          {error ||
            "The trekking package you are looking for does not exist."}
        </p>

        <Link to="/trekking">
          Back to Trekking
        </Link>
      </div>
    );
  }

  /* =======================================================
     RICH TEXT VALUES
  ======================================================= */

  const highlightsHtml =
    richTextValue(
      trek.highlights
    );

  const shortItineraryHtml =
    richTextValue(
      trek.shortItinerary
    );

  const importantInformationHtml =
    richTextValue(
      trek.importantInformation
    );

  const includedHtml =
    richTextValue(trek.included);

  const excludedHtml =
    richTextValue(trek.excluded);

  /* =======================================================
     PRICE
  ======================================================= */

  const hasDiscount =
    trek.discountPrice &&
    Number(trek.discountPrice) <
      Number(trek.price);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="trek-details-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="trek-details-hero">

        <div className="trek-details-hero-content">

          <div className="trek-details-breadcrumb">
            <Link to="/">
              Home
            </Link>

            <span>/</span>

            <Link to="/trekking">
              Trekking
            </Link>

            <span>/</span>

            <span>
              {trek.name}
            </span>
          </div>

          <h1>
            {trek.name}
          </h1>

          {trek.description && (
            <div
              className="trek-details-hero-description"
              dangerouslySetInnerHTML={{
                __html:
                  richTextValue(
                    trek.description
                  ),
              }}
            />
          )}

        </div>

      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="trek-details-container">

        <div className="trek-details-main">

          {/* ===============================================
              MAIN IMAGE
          =============================================== */}

          {trek.mainImage && (
            <div className="trek-main-image-wrapper">

              <img
                src={trek.mainImage}
                alt={
                  trek.name ||
                  "Nepal Trekking"
                }
                className="trek-main-image"
              />

            </div>
          )}

          {/* ===============================================
              QUICK INFO
          =============================================== */}

          <div className="trek-quick-info">

            {trek.duration && (
              <div className="quick-info-item">

                <span className="quick-info-icon">
                  🗓️
                </span>

                <div>
                  <strong>
                    Duration
                  </strong>

                  <p>
                    {trek.duration}
                  </p>
                </div>

              </div>
            )}

            {trek.difficulty && (
              <div className="quick-info-item">

                <span className="quick-info-icon">
                  🥾
                </span>

                <div>
                  <strong>
                    Difficulty
                  </strong>

                  <p>
                    {trek.difficulty}
                  </p>
                </div>

              </div>
            )}

            {trek.maxAltitude && (
              <div className="quick-info-item">

                <span className="quick-info-icon">
                  ⛰️
                </span>

                <div>
                  <strong>
                    Max Altitude
                  </strong>

                  <p>
                    {trek.maxAltitude}
                  </p>
                </div>

              </div>
            )}

            {trek.region && (
              <div className="quick-info-item">

                <span className="quick-info-icon">
                  📍
                </span>

                <div>
                  <strong>
                    Region
                  </strong>

                  <p>
                    {trek.region}
                  </p>
                </div>

              </div>
            )}

          </div>

          {/* ===============================================
              HIGHLIGHTS
          =============================================== */}

          {Array.isArray(
            trek.highlights
          ) &&
            trek.highlights.filter(
              Boolean
            ).length > 0 && (

              <section className="trek-section-block">

                <h2>
                  Trek Highlights
                </h2>

                <div className="highlight-grid">

                  {trek.highlights
                    .filter(Boolean)
                    .map(
                      (
                        highlight,
                        index
                      ) => (

                        <div
                          className="highlight-item"
                          key={index}
                        >

                          <span>
                            ✓
                          </span>

                          <div>
                            {stripHtml(
                              String(
                                highlight
                              )
                            )
                              ? stripHtml(
                                  String(
                                    highlight
                                  )
                                )
                              : highlight}
                          </div>

                        </div>

                      )
                    )}

                </div>

              </section>

            )}

          {/* ===============================================
              OVERVIEW
          =============================================== */}

          {trek.overview && (
            <section className="trek-section-block">

              <h2>
                Trek Overview
              </h2>

              <div
                className="trek-long-text"
                dangerouslySetInnerHTML={{
                  __html:
                    richTextValue(
                      trek.overview
                    ),
                }}
              />

            </section>
          )}

          {/* ===============================================
              SHORT ITINERARY
          =============================================== */}

          {hasRichText(
            trek.shortItinerary
          ) && (

            <section className="trek-section-block">

              <h2>
                Short Itinerary
              </h2>

              <div
                className="trek-long-text"
                dangerouslySetInnerHTML={{
                  __html:
                    shortItineraryHtml,
                }}
              />

            </section>

          )}

          {/* ===============================================
              DETAILED ITINERARY
          =============================================== */}

          {Array.isArray(
            trek.itinerary
          ) &&
            trek.itinerary.length >
              0 && (

              <section className="trek-section-block">

                <h2>
                  Detailed Itinerary
                </h2>

                <div className="trek-itinerary">

                  {trek.itinerary.map(
                    (
                      day,
                      index
                    ) => (

                      <div
                        className="itinerary-day"
                        key={
                          day._id ||
                          day.id ||
                          index
                        }
                      >

                        <div className="itinerary-day-header">

                          <span className="itinerary-day-number">
                            {day.day ||
                              index +
                                1}
                          </span>

                          <h3>
                            {day.title ||
                              `Day ${
                                day.day ||
                                index +
                                  1
                              }`}
                          </h3>

                        </div>

                        <div className="itinerary-description">

                          <div
                            className="trek-long-text"
                            dangerouslySetInnerHTML={{
                              __html:
                                richTextValue(
                                  day.description
                                ),
                            }}
                          />

                        </div>

                        {day.accommodation && (
                          <p>
                            <strong>
                              Accommodation:
                            </strong>{" "}
                            {
                              day.accommodation
                            }
                          </p>
                        )}

                        {day.meals && (
                          <p>
                            <strong>
                              Meals:
                            </strong>{" "}
                            {
                              day.meals
                            }
                          </p>
                        )}

                      </div>

                    )
                  )}

                </div>

              </section>

            )}

          {/* ===============================================
              IMPORTANT INFORMATION
          =============================================== */}

          {hasRichText(
            trek.importantInformation
          ) && (

            <section className="trek-section-block">

              <h2>
                Important Information
              </h2>

              <div
                className="trek-long-text"
                dangerouslySetInnerHTML={{
                  __html:
                    importantInformationHtml,
                }}
              />

            </section>

          )}

          {/* ===============================================
              PRICE INCLUDES
          =============================================== */}

          {hasRichText(
            trek.included
          ) && (

            <section className="trek-section-block">

              <h2>
                Price Includes
              </h2>

              <div
                className="trek-long-text"
                dangerouslySetInnerHTML={{
                  __html:
                    includedHtml,
                }}
              />

            </section>

          )}

          {/* ===============================================
              PRICE EXCLUDES
          =============================================== */}

          {hasRichText(
            trek.excluded
          ) && (

            <section className="trek-section-block">

              <h2>
                Price Excludes
              </h2>

              <div
                className="trek-long-text"
                dangerouslySetInnerHTML={{
                  __html:
                    excludedHtml,
                }}
              />

            </section>

          )}

          {/* ===============================================
              EQUIPMENT
          =============================================== */}

          {Array.isArray(
            trek.gearSections
          ) &&
            trek.gearSections.length >
              0 && (

              <section className="trek-section-block">

                <h2>
                  Equipment & Packing List
                </h2>

                {trek.gearSections
                  .filter(
                    (section) =>
                      hasRichText(
                        section.items
                      )
                  )
                  .map(
                    (
                      section,
                      index
                    ) => {

                      const sectionHtml =
                        richTextValue(
                          section.items
                        );

                      return (
                        <div
                          key={
                            section._id ||
                            index
                          }
                          style={{
                            marginBottom:
                              "24px",
                          }}
                        >

                          {section.title && (
                            <h3>
                              {
                                section.title
                              }
                            </h3>
                          )}

                          <div
                            className="trek-long-text"
                            dangerouslySetInnerHTML={{
                              __html:
                                sectionHtml,
                            }}
                          />

                        </div>
                      );
                    }
                  )}

              </section>

            )}

          {/* ===============================================
              FAQ
          =============================================== */}

          {Array.isArray(
            trek.faqs
          ) &&
            trek.faqs.length >
              0 && (

              <section className="trek-section-block">

                <h2>
                  Frequently Asked Questions
                </h2>

                <div className="trek-faq">

                  {trek.faqs.map(
                    (
                      faq,
                      index
                    ) => (

                      <div
                        className="faq-item"
                        key={
                          faq._id ||
                          faq.id ||
                          index
                        }
                      >

                        <h3>
                          {faq.question ||
                            faq.title ||
                            `Question ${
                              index +
                              1
                            }`}
                        </h3>

                        <div
                          className="faq-answer trek-long-text"
                          dangerouslySetInnerHTML={{
                            __html:
                              richTextValue(
                                faq.answer ||
                                  faq.description ||
                                  ""
                              ),
                          }}
                        />

                      </div>

                    )
                  )}

                </div>

              </section>

            )}

          {/* ===============================================
              GALLERY
          =============================================== */}

          {Array.isArray(
            trek.gallery
          ) &&
            trek.gallery.length >
              0 && (

              <section className="trek-section-block">

                <h2>
                  Trek Gallery
                </h2>

                <div className="trek-gallery">

                  {trek.gallery.map(
                    (
                      image,
                      index
                    ) => {

                      const imageUrl =
                        typeof image ===
                        "string"
                          ? image
                          : image?.url ||
                            image?.src;

                      if (!imageUrl)
                        return null;

                      return (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`${trek.name} ${
                            index + 1
                          }`}
                          loading="lazy"
                        />
                      );
                    }
                  )}

                </div>

              </section>

            )}

        </div>

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="trek-details-sidebar">

          <div className="booking-card">

            <div className="booking-card-price">

              {hasDiscount ? (
                <>
                  <span className="old-price">
                    {trek.currency ||
                      "USD"}{" "}
                    {trek.price}
                  </span>

                  <strong>
                    {trek.currency ||
                      "USD"}{" "}
                    {trek.discountPrice}
                  </strong>
                </>
              ) : (
                <strong>
                  {trek.price
                    ? `${
                        trek.currency ||
                        "USD"
                      } ${
                        trek.price
                      }`
                    : "Contact for Price"}
                </strong>
              )}

            </div>

            {trek.price && (
              <p className="price-note">
                Per person
              </p>
            )}

            <button
              type="button"
              className="booking-btn"
              onClick={() =>
                setShowBookingModal(
                  true
                )
              }
            >
              Book This Trek
            </button>

            <a
              href="https://wa.me/9779709914688"
              target="_blank"
              rel="noreferrer"
              className="whatsapp-direct-btn"
            >
              WhatsApp Us
            </a>

          </div>

          {/* Sidebar Quick Information */}

          <div className="sidebar-info-card">

            <h3>
              Trek Information
            </h3>

            {trek.duration && (
              <div className="sidebar-info-row">
                <span>
                  Duration
                </span>

                <strong>
                  {trek.duration}
                </strong>
              </div>
            )}

            {trek.difficulty && (
              <div className="sidebar-info-row">
                <span>
                  Difficulty
                </span>

                <strong>
                  {trek.difficulty}
                </strong>
              </div>
            )}

            {trek.maxAltitude && (
              <div className="sidebar-info-row">
                <span>
                  Max Altitude
                </span>

                <strong>
                  {trek.maxAltitude}
                </strong>
              </div>
            )}

            {trek.region && (
              <div className="sidebar-info-row">
                <span>
                  Region
                </span>

                <strong>
                  {trek.region}
                </strong>
              </div>
            )}

            {trek.bestSeason && (
              <div className="sidebar-info-row">
                <span>
                  Best Season
                </span>

                <strong>
                  {trek.bestSeason}
                </strong>
              </div>
            )}

          </div>

        </aside>

      </main>

      {/* =================================================
          MOBILE BOOKING CTA
      ================================================= */}

      <div className="mobile-booking-cta">

        <button
          type="button"
          onClick={() =>
            setShowBookingModal(
              true
            )
          }
        >
          Book This Trek
        </button>

        <a
          href="https://wa.me/9779709914688"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>

      </div>

      {/* =================================================
          BOOKING MODAL
      ================================================= */}

      {showBookingModal && (
        <div
          className="booking-modal-overlay"
          onClick={() =>
            setShowBookingModal(
              false
            )
          }
        >

          <div
            className="booking-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="booking-modal-close"
              onClick={() =>
                setShowBookingModal(
                  false
                )
              }
            >
              ×
            </button>

            <h2>
              Book {trek.name}
            </h2>

            <p>
              Contact Backpacker
              Gateways to plan
              your trek.
            </p>

            <a
              href={`https://wa.me/9779709914688?text=${encodeURIComponent(
                `Hello Backpacker Gateways, I am interested in ${trek.name}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="modal-whatsapp-btn"
            >
              Continue on WhatsApp
            </a>

          </div>

        </div>
      )}

    </div>
  );
}