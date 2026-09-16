
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./TrekkingDetails.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backpacker-gateways-2.onrender.com/api";

function TrekkingDetails() {
  const { slug } = useParams();

  const [trek, setTrek] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [openDay, setOpenDay] = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD TREK FROM MONGODB
  // =========================================================

  useEffect(() => {
    const fetchTrek = async () => {
      try {
        setLoading(true);
        setError("");
        setTrek(null);

        const response = await fetch(
          `${API_BASE_URL}/treks/slug/${slug}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Trekking package not found."
          );
        }

        const trekData =
          result?.data?.trek ||
          result?.data ||
          result?.trek;

        if (!trekData) {
          throw new Error(
            "Trekking package data was not found."
          );
        }

        setTrek(trekData);
        setActiveImage(0);
        setOpenDay(0);
      } catch (err) {
        console.error(
          "Fetch trek details error:",
          err
        );

        setError(
          err.message ||
            "Failed to load trekking package."
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTrek();
    }
  }, [slug]);

  // =========================================================
  // DYNAMIC SEO
  // =========================================================

  useEffect(() => {
    if (!trek) {
      return;
    }

    const seo = trek.seo || {};

    const stripHtml = (html = "") => {
      const temp = document.createElement("div");
      temp.innerHTML = html;

      return (
        temp.textContent ||
        temp.innerText ||
        ""
      );
    };

    const setMetaTag = (
      attribute,
      value,
      content
    ) => {
      if (!content) {
        return;
      }

      let element = document.head.querySelector(
        `meta[${attribute}="${value}"]`
      );

      if (!element) {
        element = document.createElement("meta");

        element.setAttribute(
          attribute,
          value
        );

        document.head.appendChild(element);
      }

      element.setAttribute(
        "content",
        content
      );
    };

    // ---------------------------------------------------------
    // PAGE TITLE
    // ---------------------------------------------------------

    document.title =
      seo.metaTitle ||
      `${trek.name} | Nepal Trekking | Backpacker Gateways`;

    // ---------------------------------------------------------
    // META DESCRIPTION
    // ---------------------------------------------------------

    const metaDescription =
      seo.metaDescription ||
      stripHtml(
        trek.description || ""
      ).slice(0, 160);

    setMetaTag(
      "name",
      "description",
      metaDescription
    );

    // ---------------------------------------------------------
    // KEYWORDS
    // ---------------------------------------------------------

    const keywordList = [
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
    ].filter(Boolean);

    if (keywordList.length > 0) {
      setMetaTag(
        "name",
        "keywords",
        keywordList.join(", ")
      );
    }

    // ---------------------------------------------------------
    // AUTHOR
    // ---------------------------------------------------------

    setMetaTag(
      "name",
      "author",
      "Backpacker Gateways"
    );

    // ---------------------------------------------------------
    // ROBOTS
    // ---------------------------------------------------------

    setMetaTag(
      "name",
      "robots",
      trek.published === false
        ? "noindex,nofollow"
        : "index,follow"
    );

    // ---------------------------------------------------------
    // CANONICAL
    // ---------------------------------------------------------

    const canonicalUrl =
      seo.canonical ||
      `${window.location.origin}/trekking/${trek.slug}`;

    let canonical =
      document.head.querySelector(
        'link[rel="canonical"]'
      );

    if (!canonical) {
      canonical = document.createElement(
        "link"
      );

      canonical.setAttribute(
        "rel",
        "canonical"
      );

      document.head.appendChild(
        canonical
      );
    }

    canonical.setAttribute(
      "href",
      canonicalUrl
    );

    // ---------------------------------------------------------
    // OPEN GRAPH
    // ---------------------------------------------------------

    setMetaTag(
      "property",
      "og:title",
      seo.metaTitle ||
        `${trek.name} | Nepal Trekking`
    );

    setMetaTag(
      "property",
      "og:description",
      metaDescription
    );

    setMetaTag(
      "property",
      "og:type",
      "website"
    );

    setMetaTag(
      "property",
      "og:url",
      canonicalUrl
    );

    if (trek.mainImage) {
      setMetaTag(
        "property",
        "og:image",
        trek.mainImage
      );
    }

    // ---------------------------------------------------------
    // TWITTER / X
    // ---------------------------------------------------------

    setMetaTag(
      "name",
      "twitter:card",
      "summary_large_image"
    );

    setMetaTag(
      "name",
      "twitter:title",
      seo.metaTitle ||
        `${trek.name} | Nepal Trekking`
    );

    setMetaTag(
      "name",
      "twitter:description",
      metaDescription
    );

    if (trek.mainImage) {
      setMetaTag(
        "name",
        "twitter:image",
        trek.mainImage
      );
    }

    // ---------------------------------------------------------
    // CLEANUP
    // ---------------------------------------------------------

    return () => {
      document.title =
        "Backpacker Gateways";
    };
  }, [trek]);

  // =========================================================
  // STRUCTURED DATA / JSON-LD
  // =========================================================

  useEffect(() => {
    if (!trek) {
      return;
    }

    const stripHtml = (html = "") => {
      const temp = document.createElement("div");
      temp.innerHTML = html;

      return (
        temp.textContent ||
        temp.innerText ||
        ""
      );
    };

    const canonicalUrl =
      trek.seo?.canonical ||
      `${window.location.origin}/trekking/${trek.slug}`;

    const images = [
      trek.mainImage,
      ...(Array.isArray(trek.gallery)
        ? trek.gallery
        : []),
    ].filter(Boolean);

    const structuredData = {
      "@context":
        "https://schema.org",

      "@type": "TouristTrip",

      name: trek.name,

      description:
        trek.seo?.metaDescription ||
        stripHtml(
          trek.description || ""
        ).slice(0, 500),

      url: canonicalUrl,

      image: images,

      touristType: [
        "Adventure tourists",
        "Hikers",
        "Trekkers",
      ],

      provider: {
        "@type": "TravelAgency",
        name: "Backpacker Gateways",
        url:
          window.location.origin,
      },

      itinerary: {
        "@type": "ItemList",

        itemListElement:
          Array.isArray(trek.itinerary)
            ? trek.itinerary.map(
                (day, index) => ({
                  "@type":
                    "ListItem",

                  position:
                    index + 1,

                  name:
                    day.title ||
                    `Day ${
                      day.day ||
                      index + 1
                    }`,

                  description:
                    stripHtml(
                      day.description ||
                        ""
                    ),
                })
              )
            : [],
      },

      offers: {
        "@type": "Offer",

        price:
          Number(
            trek.discountPrice ||
              trek.price ||
              0
          ),

        priceCurrency:
          trek.currency ||
          "USD",

        availability:
          trek.published === false
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",

        url: canonicalUrl,
      },

      location: {
        "@type": "Country",
        name:
          trek.country ||
          "Nepal",
      },

      duration:
        trek.duration
          ? `P${Number(
              trek.duration
            )}D`
          : undefined,
    };

    // Remove undefined values
    Object.keys(structuredData).forEach(
      (key) => {
        if (
          structuredData[key] ===
          undefined
        ) {
          delete structuredData[key];
        }
      }
    );

    let script =
      document.getElementById(
        "trekking-jsonld"
      );

    if (!script) {
      script =
        document.createElement(
          "script"
        );

      script.type =
        "application/ld+json";

      script.id =
        "trekking-jsonld";

      document.head.appendChild(
        script
      );
    }

    script.textContent =
      JSON.stringify(
        structuredData
      );

    return () => {
      const existingScript =
        document.getElementById(
          "trekking-jsonld"
        );

      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [trek]);

  // =========================================================
  // BOOKING
  // =========================================================

  const openBooking = () => {
    setShowBooking(true);
  };

  const closeBooking = () => {
    setShowBooking(false);
  };

  const handleBooking = (e) => {
    e.preventDefault();

    const formData =
      new FormData(e.target);

    const name =
      formData.get("name");

    const date =
      formData.get("date");

    const travellers =
      formData.get("travellers");

    const phone =
      formData.get("phone");

    const message = `Hello Backpacker Gateways,

I am interested in booking:

Trek: ${trek.name}
Preferred Date: ${date}
Travellers: ${travellers}
Name: ${name}
Phone / WhatsApp: ${phone}`;

    window.open(
      `https://wa.me/9779709914688?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="trek-not-found">
        <h1>Loading Trek...</h1>

        <p>
          Please wait while we load
          the trekking package.
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !trek) {
    return (
      <div className="trek-not-found">

        <h1>Trek Not Found</h1>

        <p>
          {error ||
            "The trekking package you are looking for is not available."}
        </p>

        <Link to="/trekking">
          ← Back to Trekking Packages
        </Link>

      </div>
    );
  }

  // =========================================================
  // IMAGES
  // =========================================================

  const images = [
    trek.mainImage,

    ...(Array.isArray(
      trek.gallery
    )
      ? trek.gallery
      : []),
  ].filter(Boolean);

  const heroImage =
    images[activeImage] ||
    "/backpacker-logo.png";

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="trek-details-page">

      {/* HERO */}

      <section className="trek-details-hero">

        <img
          src={heroImage}
          alt={
            trek.seo?.imageAlt ||
            `${trek.name} Nepal trekking`
          }
        />

        <div className="trek-details-hero-overlay">

          <div className="trek-details-container">

            <Link
              to="/trekking"
              className="trek-back-link"
            >
              ← All Trekking Packages
            </Link>

            <p className="trek-details-eyebrow">
              BACKPACKER GATEWAYS
            </p>

            <h1>
              {trek.name}
            </h1>

            <div
              className="trek-details-hero-description"
              dangerouslySetInnerHTML={{
                __html:
                  trek.description ||
                  "",
              }}
            />

          </div>
        </div>
      </section>

      {/* GALLERY */}

      {images.length > 1 && (
        <section className="trek-gallery-section">

          <div className="trek-details-container">

            <div className="trek-gallery">

              {images.map(
                (image, index) => (
                  <button
                    key={index}
                    className={`trek-gallery-thumb ${
                      activeImage ===
                      index
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveImage(
                        index
                      )
                    }
                  >

                    <img
                      src={image}
                      alt={`${trek.name} view ${
                        index + 1
                      }`}
                    />

                  </button>
                )
              )}

            </div>
          </div>
        </section>
      )}

      {/* MAIN */}

      <main className="trek-details-container">

        <div className="trek-details-layout">

          {/* CONTENT */}

          <div className="trek-details-content">

            {/* QUICK INFO */}

            <section className="trek-info-grid">

              <div className="trek-info-box">
                <span>
                  Duration
                </span>

                <strong>
                  {trek.duration ||
                    "N/A"}
                </strong>
              </div>

              <div className="trek-info-box">
                <span>
                  Difficulty
                </span>

                <strong>
                  {trek.difficulty ||
                    "N/A"}
                </strong>
              </div>

              <div className="trek-info-box">
                <span>
                  Max Altitude
                </span>

                <strong>
                  {trek.maxAltitude ||
                    "N/A"}
                </strong>
              </div>

              <div className="trek-info-box">
                <span>
                  Best Season
                </span>

                <strong>
                  {trek.bestSeason ||
                    "N/A"}
                </strong>
              </div>

              <div className="trek-info-box">
                <span>
                  Activity
                </span>

                <strong>
                  {trek.activity ||
                    "Trekking"}
                </strong>
              </div>

              <div className="trek-info-box">
                <span>
                  Country
                </span>

                <strong>
                  {trek.country ||
                    "Nepal"}
                </strong>
              </div>

              <div className="trek-info-box">
                <span>
                  Start Point
                </span>

                <strong>
                  {trek.startPoint ||
                    "N/A"}
                </strong>
              </div>

              <div className="trek-info-box">
                <span>
                  End Point
                </span>

                <strong>
                  {trek.endPoint ||
                    "N/A"}
                </strong>
              </div>

            </section>

            {/* HIGHLIGHTS */}

            {trek.highlights
              ?.length > 0 && (
              <section className="trek-section-block">

                <p className="section-label">
                  TREK HIGHLIGHTS
                </p>

                <h2>
                  Why Trek This Route?
                </h2>

                <div className="highlight-grid">

                  {trek.highlights.map(
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

                        <p>
                          {highlight}
                        </p>

                      </div>
                    )
                  )}

                </div>
              </section>
            )}

            {/* OVERVIEW */}

            <section className="trek-section-block">

              <p className="section-label">
                TREK OVERVIEW
              </p>

              <h2>
                About {trek.name}
              </h2>

              <div
                className="trek-long-text"
                dangerouslySetInnerHTML={{
                  __html:
                    trek.overview ||
                    trek.description ||
                    "",
                }}
              />

            </section>

            {/* ACCOMMODATION / MEALS */}

            <section className="trek-section-block">

              <div className="trek-two-column">

                <div>

                  <p className="section-label">
                    ACCOMMODATION
                  </p>

                  <h3>
                    {trek.accommodation ||
                      "Not specified"}
                  </h3>

                </div>

                <div>

                  <p className="section-label">
                    MEALS
                  </p>

                  <h3>
                    {trek.meals ||
                      "Not specified"}
                  </h3>

                </div>

              </div>
            </section>

            {/* SHORT ITINERARY */}

            {trek.shortItinerary
              ?.length > 0 && (
              <section className="trek-section-block">

                <p className="section-label">
                  QUICK ITINERARY
                </p>

                <h2>
                  Trek Overview
                </h2>

                <ul className="included-list">

                  {trek.shortItinerary.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                      >

                        <span>
                          ✓
                        </span>

                        {item}

                      </li>
                    )
                  )}

                </ul>

              </section>
            )}

            {/* ITINERARY */}

            {trek.itinerary
              ?.length > 0 && (
              <section className="trek-section-block">

                <p className="section-label">
                  ITINERARY
                </p>

                <h2>
                  Detailed Trek Itinerary
                </h2>

                <div className="itinerary-list">

                  {trek.itinerary.map(
                    (
                      day,
                      index
                    ) => {

                      const isOpen =
                        openDay ===
                        index;

                      return (
                        <div
                          className={`itinerary-item ${
                            isOpen
                              ? "open"
                              : ""
                          }`}
                          key={index}
                        >

                          <button
                            className="itinerary-header"
                            onClick={() =>
                              setOpenDay(
                                isOpen
                                  ? -1
                                  : index
                              )
                            }
                          >

                            <div>

                              <span>
                                Day{" "}
                                {day.day ||
                                  index +
                                    1}
                              </span>

                              <strong>
                                {day.title}
                              </strong>

                            </div>

                            <span className="itinerary-arrow">
                              {isOpen
                                ? "−"
                                : "+"}
                            </span>

                          </button>

                          {isOpen && (
                            <div className="itinerary-description">

                              <div
                                dangerouslySetInnerHTML={{
                                  __html:
                                    day.description ||
                                    "",
                                }}
                              />

                            </div>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>
              </section>
            )}

            {/* IMPORTANT INFORMATION */}

            {trek.importantInformation
              ?.length > 0 && (
              <section className="trek-section-block">

                <p className="section-label">
                  IMPORTANT INFORMATION
                </p>

                <h2>
                  Before You Trek
                </h2>

                <ul className="included-list">

                  {trek.importantInformation.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                      >

                        <span>
                          ✓
                        </span>

                        {item}

                      </li>
                    )
                  )}

                </ul>

              </section>
            )}

            {/* INCLUDED */}

            {trek.included
              ?.length > 0 && (
              <section className="trek-section-block">

                <p className="section-label">
                  PRICE INCLUDES
                </p>

                <h2>
                  What's Included
                </h2>

                <ul className="included-list">

                  {trek.included.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                      >

                        <span>
                          ✓
                        </span>

                        {item}

                      </li>
                    )
                  )}

                </ul>

              </section>
            )}

            {/* EXCLUDED */}

            {trek.excluded
              ?.length > 0 && (
              <section className="trek-section-block">

                <p className="section-label">
                  PRICE EXCLUDES
                </p>

                <h2>
                  What's Not Included
                </h2>

                <ul className="excluded-list">

                  {trek.excluded.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                      >

                        <span>
                          ×
                        </span>

                        {item}

                      </li>
                    )
                  )}

                </ul>

              </section>
            )}

            {/* GEAR */}

            {trek.gearSections
              ?.length > 0 && (
              <section className="trek-section-block">

                <p className="section-label">
                  TREKKING GEAR
                </p>

                <h2>
                  Recommended Equipment
                </h2>

                {trek.gearSections.map(
                  (
                    section,
                    index
                  ) => (
                    <div
                      key={index}
                      style={{
                        marginBottom:
                          "24px",
                      }}
                    >

                      <h3>
                        {section.title}
                      </h3>

                      <ul className="included-list">

                        {section.items?.map(
                          (
                            item,
                            itemIndex
                          ) => (
                            <li
                              key={
                                itemIndex
                              }
                            >

                              <span>
                                ✓
                              </span>

                              {item}

                            </li>
                          )
                        )}

                      </ul>

                    </div>
                  )
                )}

              </section>
            )}

            {/* FAQ */}

            {trek.faqs
              ?.length > 0 && (
              <section className="trek-section-block">

                <p className="section-label">
                  FREQUENTLY ASKED QUESTIONS
                </p>

                <h2>
                  FAQs About This Trek
                </h2>

                <div className="faq-list">

                  {trek.faqs.map(
                    (
                      faq,
                      index
                    ) => (
                      <details
                        className="faq-item"
                        key={index}
                      >

                        <summary>
                          {faq.question}
                        </summary>

                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              faq.answer ||
                              "",
                          }}
                        />

                      </details>
                    )
                  )}

                </div>
              </section>
            )}

          </div>

          {/* BOOKING SIDEBAR */}

          <aside className="trek-booking-sidebar">

            <div className="trek-booking-card">

              <p className="booking-label">
                STARTING FROM
              </p>

              <div className="trek-price">

                {trek.currency ===
                "USD"
                  ? "$"
                  : `${trek.currency || ""} `}

                {trek.discountPrice ||
                  trek.price ||
                  0}

              </div>

              {trek.discountPrice &&
                trek.price &&
                Number(
                  trek.discountPrice
                ) <
                  Number(
                    trek.price
                  ) && (
                  <p
                    style={{
                      textDecoration:
                        "line-through",
                      opacity: 0.6,
                    }}
                  >

                    {trek.currency ===
                    "USD"
                      ? "$"
                      : `${trek.currency || ""} `}

                    {trek.price}

                  </p>
                )}

              <p className="price-note">
                Per person
              </p>

              <div className="booking-divider" />

              <div className="booking-summary">

                <div>
                  <span>
                    Duration
                  </span>

                  <strong>
                    {trek.duration ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>
                    Difficulty
                  </span>

                  <strong>
                    {trek.difficulty ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>
                    Best Season
                  </span>

                  <strong>
                    {trek.bestSeason ||
                      "N/A"}
                  </strong>
                </div>

              </div>

              <button
                className="book-trek-main-btn"
                onClick={
                  openBooking
                }
              >
                Book Your Trek
              </button>

              <a
                href="https://wa.me/9779709914688"
                target="_blank"
                rel="noreferrer"
                className="whatsapp-direct-btn"
              >
                WhatsApp Us
              </a>

              <p className="booking-small-note">
                Choose your preferred
                date and send us your
                enquiry.
              </p>

            </div>
          </aside>

        </div>
      </main>

      {/* MOBILE BOOKING CTA */}

      <div className="mobile-booking-bar">

        <div>

          <span>
            From
          </span>

          <strong>

            {trek.currency ===
            "USD"
              ? "$"
              : `${trek.currency || ""} `}

            {trek.discountPrice ||
              trek.price ||
              0}

          </strong>

        </div>

        <button
          onClick={
            openBooking
          }
        >
          Book Your Trek
        </button>

      </div>

      {/* BOOKING MODAL */}

      {showBooking && (
        <div
          className="booking-modal-overlay"
          onClick={
            closeBooking
          }
        >

          <div
            className="booking-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={
                closeBooking
              }
            >
              ×
            </button>

            <p className="section-label">
              BACKPACKER GATEWAYS
            </p>

            <h2>
              Book Your Trek
            </h2>

            <p className="selected-trek">
              {trek.name}
            </p>

            <form
              onSubmit={
                handleBooking
              }
            >

              <label>

                Preferred Trek Date

                <input
                  type="date"
                  name="date"
                  required
                />

              </label>

              <label>

                Number of Travellers

                <input
                  type="number"
                  name="travellers"
                  min="1"
                  defaultValue="1"
                  required
                />

              </label>

              <label>

                Your Name

                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  required
                />

              </label>

              <label>

                Phone / WhatsApp

                <input
                  type="tel"
                  name="phone"
                  placeholder="+977..."
                  required
                />

              </label>

              <button
                type="submit"
                className="modal-whatsapp-btn"
              >
                Send Enquiry on WhatsApp
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default TrekkingDetails;

