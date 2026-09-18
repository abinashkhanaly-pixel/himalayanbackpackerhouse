import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRoomBySlug } from "../services/roomApi";
import "./RoomDetails.css";

const RoomDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadRoom = async () => {
      if (!slug) {
        setError("No room selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await getRoomBySlug(slug);

        if (cancelled) return;

        if (result?.success === false || !result?.data) {
          throw new Error("Room not found");
        }

        setRoom(result.data);
      } catch (err) {
        if (cancelled) return;

        console.error("Room details error:", err);
        setError("Unable to load room details.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRoom();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* =========================================================
     SEO
  ========================================================= */

  useEffect(() => {
    if (!room) return;

    const destination = room.destination || "Kathmandu";
    const roomName = room.name || "Himalayan Room";

    const fallbackTitle =
      `${roomName} in ${destination} | Backpacker Gateways`;

    const fallbackDescription =
      `Book the ${roomName} in ${destination}, Nepal with Backpacker Gateways. Enjoy comfortable accommodation, Himalayan hospitality and convenient access to local attractions and trekking routes.`;

    const title = room.seoTitle?.trim() || fallbackTitle;

    const description =
      room.seoDescription?.trim() || fallbackDescription;

    const cleanSlug = room.seoSlug?.trim() || slug;

    const canonicalUrl =
      `${window.location.origin}/rooms/${cleanSlug}`;

    document.title = title;

    let metaDescription =
      document.querySelector('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute("content", description);

    let canonical =
      document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);

    const setMetaProperty = (property, content) => {
      let tag =
        document.querySelector(
          `meta[property="${property}"]`
        );

      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }

      tag.setAttribute("content", content);
    };

    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:url", canonicalUrl);
    setMetaProperty("og:type", "website");

    if (room.images?.length > 0) {
      setMetaProperty("og:image", room.images[0]);
    }

    const setMetaName = (name, content) => {
      let tag =
        document.querySelector(
          `meta[name="${name}"]`
        );

      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }

      tag.setAttribute("content", content);
    };

    setMetaName(
      "twitter:card",
      "summary_large_image"
    );

    setMetaName("twitter:title", title);
    setMetaName("twitter:description", description);

    if (room.images?.length > 0) {
      setMetaName("twitter:image", room.images[0]);
    }

    const existingSchema =
      document.getElementById("room-jsonld");

    if (existingSchema) {
      existingSchema.remove();
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "HotelRoom",

      name: roomName,

      description:
        room.description || description,

      url: canonicalUrl,

      image:
        Array.isArray(room.images)
          ? room.images
          : [],

      occupancy: {
        "@type": "QuantitativeValue",
        maxValue: Number(room.capacity || 1),
      },

      bed: room.beds
        ? {
            "@type": "BedDetails",
            typeOfBed: room.beds,
          }
        : undefined,

      amenityFeature:
        Array.isArray(room.amenities)
          ? room.amenities.map((amenity) => ({
              "@type":
                "LocationFeatureSpecification",
              name: amenity,
              value: true,
            }))
          : [],

      address: {
        "@type": "PostalAddress",
        addressLocality: destination,
        addressCountry: "NP",
      },

      offers: {
        "@type": "Offer",
        price: Number(room.price || 0),
        priceCurrency: "NPR",

        availability:
          room.available
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",

        url: canonicalUrl,
      },
    };

    const cleanSchema =
      JSON.parse(
        JSON.stringify(schema)
      );

    const script =
      document.createElement("script");

    script.id = "room-jsonld";
    script.type = "application/ld+json";
    script.textContent =
      JSON.stringify(cleanSchema);

    document.head.appendChild(script);

    return () => {
      const schemaElement =
        document.getElementById(
          "room-jsonld"
        );

      if (schemaElement) {
        schemaElement.remove();
      }
    };
  }, [room, slug]);

  /* =========================================================
     KEYBOARD GALLERY CONTROLS
  ========================================================= */

  useEffect(() => {
    if (!showGallery) return;

    const handleKeyDown = (event) => {
      const galleryImages =
        Array.isArray(room?.images)
          ? room.images.filter(Boolean)
          : [];

      if (!galleryImages.length) return;

      if (event.key === "Escape") {
        setShowGallery(false);
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveImage(
          (current) =>
            (current + 1) %
            galleryImages.length
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveImage(
          (current) =>
            (current - 1 +
              galleryImages.length) %
            galleryImages.length
        );
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [showGallery, room]);

  /* =========================================================
     BOOKING
  ========================================================= */

  const handleBooking = () => {
    if (!room?._id || !room?.available) {
      return;
    }

    navigate(`/booking?room=${room._id}`);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="details-loading">
        <div
          className="spinner"
          aria-hidden="true"
        />

        <p>
          Preparing your Himalayan stay...
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !room) {
    return (
      <div className="details-error">
        <h2>No room selected</h2>

        <p>
          {error ||
            "The requested room could not be found."}
        </p>

        <Link
          to="/rooms"
          className="back-button"
        >
          ← Back to Rooms
        </Link>
      </div>
    );
  }

  /* =========================================================
     ROOM DATA
  ========================================================= */

  const destination =
    room.destination || "Kathmandu";

  const roomName =
    room.name || "Himalayan Room";

  const images =
    Array.isArray(room.images)
      ? room.images.filter(Boolean)
      : [];

  const mainImage =
    images.length > 0
      ? images[activeImage] || images[0]
      : "";

  const sideImages =
    images.slice(1, 5);

  const hiddenPhotos =
    Math.max(images.length - 5, 0);

  /* =========================================================
     CAROUSEL FUNCTIONS
  ========================================================= */

  const nextImage = () => {
    if (images.length <= 1) return;

    setActiveImage(
      (current) =>
        (current + 1) % images.length
    );
  };

  const previousImage = () => {
    if (images.length <= 1) return;

    setActiveImage(
      (current) =>
        (current - 1 + images.length) %
        images.length
    );
  };

  const openGallery = (index = 0) => {
    setActiveImage(index);
    setShowGallery(true);
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="details-page">

      {/* =====================================================
          PHOTO GALLERY
      ===================================================== */}

      <div className="room-gallery-wrapper">

        {images.length > 0 ? (

          <section className="room-gallery">

            {/* =================================================
                DESKTOP / TABLET MAIN PHOTO
            ================================================= */}

            <button
              type="button"
              className="gallery-main"
              onClick={() =>
                openGallery(activeImage)
              }
              aria-label="View room photo"
            >

              <img
                src={mainImage}
                alt={`${roomName} in ${destination}, Nepal`}
                width="1600"
                height="1000"
                fetchPriority="high"
                decoding="async"
              />

              <span className="gallery-main-label">
                {roomName}
              </span>

              {images.length > 1 && (
                <span className="gallery-view-button">
                  📷 View all photos
                </span>
              )}

              {/* =================================================
                  MOBILE NEXT ARROW
              ================================================= */}

              {images.length > 1 && (
                <button
                  type="button"
                  className="mobile-gallery-next"
                  onClick={(event) => {
                    event.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next photo"
                >
                  ›
                </button>
              )}

              {/* =================================================
                  MOBILE PHOTO COUNTER
              ================================================= */}

              {images.length > 1 && (
                <span className="mobile-gallery-counter">
                  {activeImage + 1} / {images.length}
                </span>
              )}

            </button>

            {/* =================================================
                DESKTOP 4 SMALL PHOTOS
            ================================================= */}

            <div className="gallery-side">

              {sideImages.map(
                (image, index) => {

                  const actualIndex =
                    index + 1;

                  const isLastTile =
                    actualIndex === 4 &&
                    hiddenPhotos > 0;

                  return (
                    <button
                      type="button"
                      key={`${image}-${actualIndex}`}
                      className="gallery-tile"
                      onClick={() => {

                        if (isLastTile) {
                          openGallery(
                            actualIndex
                          );
                          return;
                        }

                        openGallery(
                          actualIndex
                        );
                      }}
                      aria-label={
                        isLastTile
                          ? "View all room photos"
                          : `View photo ${
                              actualIndex + 1
                            }`
                      }
                    >

                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />

                      {isLastTile && (
                        <span className="gallery-overlay">
                          +{hiddenPhotos} Photos
                        </span>
                      )}

                    </button>
                  );
                }
              )}

            </div>

          </section>

        ) : (

          <div className="no-image-gallery">
            No room photos available
          </div>

        )}

      </div>

      {/* =====================================================
          ROOM TITLE / LOCATION
      ===================================================== */}

      <header className="room-header">

        <Link
          to="/rooms"
          className="details-back"
        >
          ← Back to Rooms
        </Link>

        <div className="room-header-row">

          <div className="room-header-main">

            <div
              className={`details-availability ${
                !room.available
                  ? "unavailable"
                  : ""
              }`}
            >
              {room.available
                ? "Available Now"
                : "Currently Unavailable"}
            </div>

            <h1>
              {roomName} in {destination}
            </h1>

            <p className="room-location">
              📍 {destination}, Nepal
            </p>

          </div>

          <div className="room-header-price">

            <strong>
              NPR{" "}
              {Number(
                room.price || 0
              ).toLocaleString("en-NP")}
            </strong>

            <span>
              per night
            </span>

          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="details-container">

        <div className="details-grid">

          <div className="content-section">

            <span className="section-label">
              Your Himalayan Stay
            </span>

            <h2>
              Comfortable accommodation in{" "}
              {destination}.
            </h2>

            <p>
              {room.description ||
                `Stay in the ${roomName} in ${destination}, Nepal and enjoy peaceful surroundings, warm hospitality and convenient access to Himalayan adventures. Our accommodation is designed for travellers looking for comfort, convenience and an authentic Nepal travel experience.`}
            </p>

            <div className="room-highlights">

              <div className="highlight">

                <div className="highlight-icon">
                  👥
                </div>

                <strong>
                  Guests
                </strong>

                <span>
                  Up to{" "}
                  {room.capacity || 1}{" "}
                  guests
                </span>

              </div>

              <div className="highlight">

                <div className="highlight-icon">
                  🛏️
                </div>

                <strong>
                  Sleeping
                </strong>

                <span>
                  {room.beds ||
                    "Comfortable bedding"}
                </span>

              </div>

              <div className="highlight">

                <div className="highlight-icon">
                  🏔️
                </div>

                <strong>
                  Experience
                </strong>

                <span>
                  Himalayan stay in{" "}
                  {destination}
                </span>

              </div>

            </div>

            <span className="section-label">
              Room Amenities
            </span>

            <h2>
              Everything you need.
            </h2>

            <div className="amenities-grid">

              {Array.isArray(
                room.amenities
              ) &&
              room.amenities.length > 0 ? (

                room.amenities.map(
                  (amenity, index) => (

                    <div
                      className="amenity-card"
                      key={`${room._id}-${index}`}
                    >

                      <span className="amenity-icon">
                        ✓
                      </span>

                      <span>
                        {amenity}
                      </span>

                    </div>

                  )
                )

              ) : (

                <p>
                  Standard room amenities
                  are available.
                </p>

              )}

            </div>

          </div>

          {/* =================================================
              BOOKING CARD
          ================================================= */}

          <aside className="booking-card">

            <h3>
              Reserve this room
            </h3>

            <p className="booking-subtitle">
              Plan your Himalayan escape
              with us.
            </p>

            <div className="price-box">

              <span className="price">
                NPR{" "}
                {Number(
                  room.price || 0
                ).toLocaleString(
                  "en-NP"
                )}
              </span>

              <span className="per-night">
                {" "} / night
              </span>

            </div>

            <div className="availability-status">

              <span
                className={`available-dot ${
                  !room.available
                    ? "unavailable-dot"
                    : ""
                }`}
              />

              {room.available
                ? "Room available for booking"
                : "Currently unavailable"}

            </div>

            <button
              type="button"
              className="book-now"
              disabled={!room.available}
              onClick={handleBooking}
            >
              {room.available
                ? "Book This Room →"
                : "Currently Unavailable"}
            </button>

            <p className="booking-note">
              Best rates available when
              booking directly with
              Backpacker Gateways.
            </p>

            <Link
              to="/rooms"
              className="back-rooms"
            >
              ← Browse All Rooms
            </Link>

          </aside>

        </div>

      </main>

      {/* =====================================================
          FULL SCREEN PHOTO CAROUSEL
      ===================================================== */}

      {showGallery &&
        images.length > 0 && (

          <div
            className="gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Room photo gallery"
            onClick={() =>
              setShowGallery(false)
            }
          >

            <button
              type="button"
              className="gallery-close"
              onClick={(event) => {
                event.stopPropagation();
                setShowGallery(false);
              }}
              aria-label="Close gallery"
            >
              ×
            </button>

            {images.length > 1 && (
              <button
                type="button"
                className="gallery-arrow gallery-arrow-left"
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
                aria-label="Previous photo"
              >
                ‹
              </button>
            )}

            <img
              className="gallery-modal-image"
              src={images[activeImage]}
              alt={`${roomName} photo ${
                activeImage + 1
              }`}
              onClick={(event) =>
                event.stopPropagation()
              }
              decoding="async"
            />

            {images.length > 1 && (
              <button
                type="button"
                className="gallery-arrow gallery-arrow-right"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                aria-label="Next photo"
              >
                ›
              </button>
            )}

            <div className="gallery-modal-counter">
              {activeImage + 1} /{" "}
              {images.length}
            </div>

          </div>
        )}

    </div>
  );
};

export default RoomDetails;