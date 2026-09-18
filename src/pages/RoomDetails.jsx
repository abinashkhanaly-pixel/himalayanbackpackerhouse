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

  /* =========================================================
     LOAD ROOM
  ========================================================= */

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
        setActiveImage(0);
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
     GALLERY DATA
  ========================================================= */

  const images =
    Array.isArray(room?.images)
      ? room.images.filter(Boolean)
      : [];

  const totalImages = images.length;

  /* =========================================================
     GALLERY FUNCTIONS
  ========================================================= */

  const nextImage = () => {
    if (totalImages <= 1) return;

    setActiveImage(
      (current) =>
        (current + 1) % totalImages
    );
  };

  const previousImage = () => {
    if (totalImages <= 1) return;

    setActiveImage(
      (current) =>
        (current - 1 + totalImages) %
        totalImages
    );
  };

  const openGallery = (index = 0) => {
    if (!totalImages) return;

    setActiveImage(index);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
  };

  /* =========================================================
     KEYBOARD GALLERY CONTROLS
  ========================================================= */

  useEffect(() => {
    if (!showGallery) return;

    const handleKeyDown = (event) => {
      if (!totalImages) return;

      if (event.key === "Escape") {
        closeGallery();
        return;
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "ArrowLeft") {
        previousImage();
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
  }, [showGallery, totalImages]);

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

  const mainImage =
    totalImages > 0
      ? images[activeImage] || images[0]
      : "";

  const sideImages =
    images.slice(1, 5);

  const hiddenPhotos =
    Math.max(totalImages - 5, 0);

  const amenities =
    Array.isArray(room.amenities)
      ? room.amenities.filter(Boolean)
      : [];

  /*
   * If Admin description contains HTML from ReactQuill,
   * it will be displayed with bold headings, paragraphs
   * and lists.
   */
  const hasRichDescription =
    typeof room.description === "string" &&
    room.description.trim().length > 0;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="details-page">

      {/* =====================================================
          PHOTO GALLERY
      ===================================================== */}

      <div className="room-gallery-wrapper">

        {totalImages > 0 ? (

          <section className="room-gallery">

            <div
              className="gallery-main"
              onClick={() =>
                openGallery(activeImage)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  openGallery(activeImage);
                }
              }}
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

              {totalImages > 1 && (
                <span className="gallery-view-button">
                  📷 View all photos
                </span>
              )}

              {totalImages > 1 && (
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

              {totalImages > 1 && (
                <span className="mobile-gallery-counter">
                  {activeImage + 1} / {totalImages}
                </span>
              )}

            </div>

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
                      onClick={() =>
                        openGallery(actualIndex)
                      }
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

            {/* =================================================
                ABOUT THIS PROPERTY
            ================================================= */}

            <span className="section-label">
              About this property
            </span>

            <h2>
              Comfortable accommodation in{" "}
              {destination}.
            </h2>

            {hasRichDescription ? (

              <div
                className="property-description"
                dangerouslySetInnerHTML={{
                  __html: room.description,
                }}
              />

            ) : (

              <div className="property-description">

                <p>
                  <strong>
                    Comfortable Accommodation:
                  </strong>{" "}
                  {roomName} in {destination} offers
                  a comfortable stay for travellers
                  looking for convenience, friendly
                  hospitality and easy access to
                  local attractions.
                </p>

                <p>
                  <strong>
                    Exceptional Facilities:
                  </strong>{" "}
                  Guests can enjoy comfortable
                  accommodation, essential room
                  facilities, WiFi and convenient
                  services designed for a relaxing
                  stay.
                </p>

                <p>
                  <strong>
                    Dining Experience:
                  </strong>{" "}
                  Guests can enjoy convenient dining
                  options and local Nepalese flavours,
                  with breakfast and meals available
                  according to the property's services.
                </p>

                <p>
                  <strong>
                    Convenient Location:
                  </strong>{" "}
                  Located in {destination}, Nepal,
                  the property provides convenient
                  access to local attractions,
                  restaurants, shopping areas and
                  travel connections.
                </p>

                <p>
                  <strong>
                    Stay Experience:
                  </strong>{" "}
                  Whether you are travelling as a
                  couple, family, solo traveller or
                  business guest, this accommodation
                  provides a convenient base for
                  exploring Nepal.
                </p>

              </div>

            )}

            {/* =================================================
                PROPERTY HIGHLIGHTS
            ================================================= */}

            <div className="property-info-section">

              <span className="section-label">
                Property Highlights
              </span>

              <div className="property-highlights">

                <div className="property-highlight-card">

                  <strong>
                    Great Location
                  </strong>

                  <span>
                    Convenient access to
                    attractions and local
                    travel connections in{" "}
                    {destination}.
                  </span>

                </div>

                <div className="property-highlight-card">

                  <strong>
                    Comfortable Rooms
                  </strong>

                  <span>
                    Designed for a relaxing
                    stay after sightseeing,
                    trekking or travelling.
                  </span>

                </div>

                <div className="property-highlight-card">

                  <strong>
                    Guest Friendly
                  </strong>

                  <span>
                    Suitable for couples,
                    families, solo travellers
                    and business guests.
                  </span>

                </div>

                <div className="property-highlight-card">

                  <strong>
                    Himalayan Experience
                  </strong>

                  <span>
                    A convenient base for
                    discovering Nepal and
                    planning your next adventure.
                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                MOST POPULAR FACILITIES
            ================================================= */}

            <div className="property-info-section">

              <span className="section-label">
                Most Popular Facilities
              </span>

              <h2>
                Facilities guests can enjoy.
              </h2>

              <div className="facilities-list">

                {amenities.length > 0 ? (

                  amenities.map(
                    (amenity, index) => (

                      <div
                        className="facility-item"
                        key={`${room._id}-facility-${index}`}
                      >

                        <span className="facility-check">
                          ✓
                        </span>

                        <strong>
                          {amenity}
                        </strong>

                      </div>

                    )
                  )

                ) : (

                  <>
                    <div className="facility-item">
                      <span className="facility-check">
                        ✓
                      </span>
                      <strong>
                        Comfortable Rooms
                      </strong>
                    </div>

                    <div className="facility-item">
                      <span className="facility-check">
                        ✓
                      </span>
                      <strong>
                        Free WiFi
                      </strong>
                    </div>

                    <div className="facility-item">
                      <span className="facility-check">
                        ✓
                      </span>
                      <strong>
                        Room Service
                      </strong>
                    </div>

                    <div className="facility-item">
                      <span className="facility-check">
                        ✓
                      </span>
                      <strong>
                        Restaurant
                      </strong>
                    </div>

                  </>

                )}

              </div>

            </div>

            {/* =================================================
                DINING EXPERIENCE
            ================================================= */}

            <div className="property-info-section">

              <span className="section-label">
                Dining Experience
              </span>

              <h2>
                Food and breakfast.
              </h2>

              <div className="property-text-box">

                <p>
                  <strong>
                    Dining Experience:
                  </strong>{" "}
                  Guests can enjoy convenient
                  dining options during their stay,
                  with opportunities to experience
                  Nepalese cuisine and a variety of
                  local and international flavours,
                  depending on the property's
                  available services.
                </p>

                <p>
                  <strong>
                    Breakfast:
                  </strong>{" "}
                  Breakfast availability and options
                  may vary by property and booking
                  plan. Please check the selected room
                  and booking details for the latest
                  information.
                </p>

              </div>

            </div>

            {/* =================================================
                BREAKFAST INFORMATION
            ================================================= */}

            <div className="property-info-section">

              <span className="section-label">
                Breakfast Information
              </span>

              <div className="breakfast-box">

                <strong>
                  Breakfast options
                </strong>

                <p>
                  Breakfast options may include
                  continental, Nepalese, Asian,
                  vegetarian and other selections
                  depending on the property.
                </p>

              </div>

            </div>

            {/* =================================================
                ROOMS WITH
            ================================================= */}

            <div className="property-info-section">

              <span className="section-label">
                Rooms with
              </span>

              <div className="rooms-with-list">

                <div>
                  ✓ Comfortable bedding
                </div>

                <div>
                  ✓ Private accommodation
                </div>

                <div>
                  ✓ Guest facilities
                </div>

                <div>
                  ✓ Convenient room amenities
                </div>

                {room.beds && (
                  <div>
                    ✓ {room.beds}
                  </div>
                )}

                {room.capacity && (
                  <div>
                    ✓ Sleeps up to{" "}
                    {room.capacity} guests
                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                CONVENIENT LOCATION
            ================================================= */}

            <div className="property-info-section">

              <span className="section-label">
                Convenient Location
              </span>

              <h2>
                Explore {destination}.
              </h2>

              <div className="property-text-box">

                <p>
                  <strong>
                    Convenient Location:
                  </strong>{" "}
                  Located in {destination}, Nepal,
                  this property provides a convenient
                  starting point for exploring nearby
                  attractions, restaurants, shopping
                  areas and local experiences.
                </p>

                <p>
                  <strong>
                    Travel Access:
                  </strong>{" "}
                  Guests can easily plan sightseeing,
                  trekking, tours and onward travel
                  from the property.
                </p>

              </div>

            </div>

            {/* =================================================
                ROOM HIGHLIGHTS
            ================================================= */}

            <div className="property-info-section">

              <span className="section-label">
                Room Highlights
              </span>

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

            </div>

            {/* =================================================
                ROOM AMENITIES
            ================================================= */}

            <div className="property-info-section">

              <span className="section-label">
                Room Amenities
              </span>

              <h2>
                Everything you need.
              </h2>

              <div className="amenities-grid">

                {amenities.length > 0 ? (

                  amenities.map(
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
        totalImages > 0 && (

          <div
            className="gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Room photo gallery"
            onClick={closeGallery}
          >

            <button
              type="button"
              className="gallery-close"
              onClick={(event) => {
                event.stopPropagation();
                closeGallery();
              }}
              aria-label="Close gallery"
            >
              ×
            </button>

            {totalImages > 1 && (
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

            {totalImages > 1 && (
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
              {totalImages}
            </div>

          </div>

        )}

    </div>
  );
};

export default RoomDetails;