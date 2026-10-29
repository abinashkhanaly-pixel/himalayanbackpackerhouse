
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRoomBySlug } from "../services/roomApi";
import {
  MapPin,
  BedDouble,
  UsersRound,
  Mountain,
} from "lucide-react";
import "./RoomDetails.css";

const HOTEL_INSIGHT_SECTIONS = [
  {
    key: "whyChoose",
    title: "Why Choose This Hotel?",
    label: "ABOUT THIS STAY",
  },
  {
    key: "locationIntelligence",
    title: "Location Guide",
    label: "LOCATION",
  },
  {
    key: "bestFor",
    title: "Who Is This Hotel Best For?",
    label: "WHO IT SUITS",
  },
  {
    key: "roomSelection",
    title: "Room Selection Guide",
    label: "ROOM GUIDE",
  },
  {
    key: "experiences",
    title: "Experiences Beyond the Room",
    label: "EXPERIENCES",
  },
  {
    key: "bookingConfidence",
    title: "Before You Book",
    label: "BOOKING INFORMATION",
  },
  {
    key: "neighbourhoodGuide",
    title: "Neighbourhood Guide",
    label: "EXPLORE THE AREA",
  },
  {
    key: "prosAndConsiderations",
    title: "Pros and Things to Consider",
    label: "THINGS TO CONSIDER",
  },
  {
    key: "smartComparison",
    title: "Hotel Comparison Guide",
    label: "COMPARE HOTELS",
  },
  {
    key: "hotelFAQs",
    title: "Frequently Asked Questions",
    label: "HOTEL FAQs",
  },
];

const HotelInsights = ({ insights }) => {
  if (!insights || typeof insights !== "object") {
    return null;
  }

  return (
    <>
      {HOTEL_INSIGHT_SECTIONS.map(({ key, title, label }) => {
        const value = insights[key];

        // Only render content supplied through the Admin Dashboard.
        if (typeof value !== "string" || !value.trim()) {
          return null;
        }

        const paragraphs = value
          .trim()
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean);

        return (
          <section
            key={key}
            id={`hotel-insight-${key}`}
            className="details-section hotel-insight-section"
          >
            <span className="section-label">{label}</span>
            <h2>{title}</h2>

            <div className="hotel-insight-content">
              {paragraphs.map((paragraph, index) => (
                <p key={`${key}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
};

const RoomDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedRoomImage, setSelectedRoomImage] = useState("");

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

        const roomData = result.data;

        setRoom(roomData);
        setActiveImage(0);
        setSelectedRoomImage(
          roomData.roomImage || roomData.images?.[0] || ""
        );
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
     SEO AND STRUCTURED DATA
  ========================================================= */

  useEffect(() => {
    if (!room) return;

    const destination = room.destination || "Kathmandu";
    const roomName = room.name || "Himalayan Room";

    const fallbackTitle =
      `${roomName} in ${destination} | Backpacker Gateways`;

    const fallbackDescription =
      `Book the ${roomName} in ${destination}, Nepal with Backpacker Gateways. Check the available accommodation details and booking information before planning your stay.`;

    const title = room.seoTitle?.trim() || fallbackTitle;
    const description =
      room.seoDescription?.trim() || fallbackDescription;
    const cleanSlug = room.seoSlug?.trim() || slug;

    const canonicalUrl =
      `${window.location.origin}/rooms/${cleanSlug}`;

    document.title = title;

    const setMeta = (
      selector,
      attribute,
      key,
      content,
      tagName,
      attrName
    ) => {
      let tag = document.querySelector(selector);

      if (!tag) {
        tag = document.createElement(tagName);
        tag.setAttribute(attrName, key);
        document.head.appendChild(tag);
      }

      tag.setAttribute(attribute, content);
    };

    setMeta(
      'meta[name="description"]',
      "content",
      "description",
      description,
      "meta",
      "name"
    );

    setMeta(
      'link[rel="canonical"]',
      "href",
      "canonical",
      canonicalUrl,
      "link",
      "rel"
    );

    const setMetaProperty = (property, content) => {
      let tag = document.querySelector(
        `meta[property="${property}"]`
      );

      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }

      tag.setAttribute("content", content);
    };

    const setMetaName = (name, content) => {
      let tag = document.querySelector(
        `meta[name="${name}"]`
      );

      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }

      tag.setAttribute("content", content);
    };

    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:url", canonicalUrl);
    setMetaProperty("og:type", "website");

    const socialImage = room.roomImage || room.images?.[0];

    if (socialImage) {
      setMetaProperty("og:image", socialImage);
      setMetaName("twitter:image", socialImage);
    }

    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", title);
    setMetaName("twitter:description", description);

    const existingSchema =
      document.getElementById("room-jsonld");

    if (existingSchema) existingSchema.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "HotelRoom",
      name: roomName,
      description: room.description || description,
      url: canonicalUrl,
      image: [
        ...new Set(
          [
            ...(Array.isArray(room.images) ? room.images : []),
            room.roomImage,
          ].filter(Boolean)
        ),
      ],
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
      amenityFeature: Array.isArray(room.amenities)
        ? room.amenities.map((amenity) => ({
            "@type": "LocationFeatureSpecification",
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
        availability: room.available
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: canonicalUrl,
      },
    };

    const script = document.createElement("script");
    script.id = "room-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(
      JSON.parse(JSON.stringify(schema))
    );

    document.head.appendChild(script);

    return () => {
      document.getElementById("room-jsonld")?.remove();
    };
  }, [room, slug]);

  /* =========================================================
     GALLERY DATA AND CONTROLS
  ========================================================= */

  const images = Array.isArray(room?.images)
    ? room.images.filter(Boolean)
    : [];

  const totalImages = images.length;

  const nextImage = () => {
    if (totalImages <= 1) return;

    setActiveImage((current) => (current + 1) % totalImages);
  };

  const previousImage = () => {
    if (totalImages <= 1) return;

    setActiveImage(
      (current) => (current - 1 + totalImages) % totalImages
    );
  };

  const openGallery = (index = 0) => {
    if (!totalImages) return;

    setActiveImage(index);
    setShowGallery(true);
  };

  const closeGallery = () => setShowGallery(false);

  useEffect(() => {
    if (!showGallery) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowRight") nextImage();
      if (event.key === "ArrowLeft") previousImage();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showGallery, totalImages]);

  /* =========================================================
     BOOKING
  ========================================================= */

  const handleBooking = () => {
    if (!room?._id || !room?.available) return;
    navigate(`/booking?room=${room._id}`);
  };

  /* =========================================================
     LOADING AND ERROR STATES
  ========================================================= */

  if (loading) {
    return (
      <div className="details-loading">
        <div className="spinner" aria-hidden="true" />
        <p>Preparing your Himalayan stay...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="details-error">
        <h2>No room selected</h2>
        <p>
          {error || "The requested room could not be found."}
        </p>
        <Link to="/rooms" className="back-button">
          ← Back to Rooms
        </Link>
      </div>
    );
  }

  /* =========================================================
     ROOM DATA
  ========================================================= */

  const destination = room.destination || "Kathmandu";
  const roomName = room.name || "Himalayan Room";

  const mainImage =
    images.length > 0
      ? images[activeImage] || images[0]
      : "";

  const roomImage =
    selectedRoomImage || room.roomImage || images[0] || "";

  const sideImages = images.slice(1, 5);
  const hiddenPhotos = Math.max(totalImages - 5, 0);

  const amenities = Array.isArray(room.amenities)
    ? room.amenities.filter(Boolean)
    : [];

  const hasRichDescription =
    typeof room.description === "string" &&
    room.description.trim().length > 0;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="details-page">
      {/* MAIN PHOTO GALLERY */}

      <div className="room-gallery-wrapper">
        {totalImages > 0 ? (
          <section className="room-gallery">
            <div
              className="gallery-main"
              onClick={() => openGallery(activeImage)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
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
                  View all photos
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
              {sideImages.map((image, index) => {
                const actualIndex = index + 1;
                const isLastTile =
                  actualIndex === 4 && hiddenPhotos > 0;

                return (
                  <button
                    type="button"
                    key={`${image}-${actualIndex}`}
                    className="gallery-tile"
                    onClick={() => openGallery(actualIndex)}
                    aria-label={
                      isLastTile
                        ? "View all room photos"
                        : `View photo ${actualIndex + 1}`
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
              })}
            </div>
          </section>
        ) : (
          <div className="no-image-gallery">
            No room photos available
          </div>
        )}
      </div>

      {/* HOTEL HEADER */}

      <header className="room-header">
        <Link to="/rooms" className="details-back">
          ← Back to Rooms
        </Link>

        <div className="room-header-row">
          <div className="room-header-main">
            <div
              className={`details-availability ${
                !room.available ? "unavailable" : ""
              }`}
            >
              {room.available
                ? "Available Now"
                : "Currently Unavailable"}
            </div>

            <div className="property-class">
              Luxury Stay
              <span aria-hidden="true">★★★★★</span>
            </div>

            <h1>
              {roomName} in {destination}
            </h1>

            <p className="room-location">{destination}</p>

            <div className="room-trust-row">
              <span>Accommodation details</span>
              <span>Direct booking</span>
              <span>Booking information available</span>
            </div>
          </div>

          <div className="room-header-price">
            <strong>
              NPR {Number(room.price || 0).toLocaleString("en-NP")}
            </strong>
            <span>per night</span>
          </div>
        </div>
      </header>

      {/* SECTION NAVIGATION */}

      <nav
        className="details-section-nav"
        aria-label="Room information"
      >
        <div className="details-section-nav-inner">
          <a href="#overview">Overview</a>
          <a href="#about">About</a>
          <a href="#rooms">Rooms</a>
          <a href="#accessibility">Accessibility</a>
          <a href="#policies">Policies</a>
        </div>
      </nav>

      {/* MAIN CONTENT */}

      <main className="details-container">
        <div className="details-grid">
          <div className="content-section">
            {/* OVERVIEW */}

            <section
              id="overview"
              className="details-section overview-section"
            >
              <div className="section-heading-row">
                <div>
                  <span className="section-label">Overview</span>
                  <h2>Everything you need for your stay</h2>
                </div>
              </div>

              <div className="property-highlights">
                <div className="property-highlight-card">
                  <span className="highlight-small-icon">
                    <MapPin />
                  </span>
                  <div>
                    <strong>Location</strong>
                    <span>
                      Explore accommodation details for {destination}.
                      Check the exact property address before booking.
                    </span>
                  </div>
                </div>

                <div className="property-highlight-card">
                  <span className="highlight-small-icon">
                    <BedDouble />
                  </span>
                  <div>
                    <strong>Room Information</strong>
                    <span>
                      Review the room type, bed details and facilities
                      listed for this property.
                    </span>
                  </div>
                </div>

                <div className="property-highlight-card">
                  <span className="highlight-small-icon">
                    <UsersRound />
                  </span>
                  <div>
                    <strong>Guest Capacity</strong>
                    <span>
                      Check the maximum guest capacity before selecting
                      this accommodation.
                    </span>
                  </div>
                </div>

                <div className="property-highlight-card">
                  <span className="highlight-small-icon">
                    <Mountain />
                  </span>
                  <div>
                    <strong>Explore Nepal</strong>
                    <span>
                      Use the property's location to plan your
                      sightseeing and onward travel.
                    </span>
                  </div>
                </div>
              </div>

              <div className="overview-facts">
                <div>
                  <span>Guests</span>
                  <strong>{room.capacity || 1}</strong>
                </div>
                <div>
                  <span>Beds</span>
                  <strong>{room.beds || "Not specified"}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{destination}</strong>
                </div>
                <div>
                  <span>Availability</span>
                  <strong>
                    {room.available ? "Available" : "Unavailable"}
                  </strong>
                </div>
              </div>
            </section>

            {/* ABOUT */}

            <section id="about" className="details-section">
              <span className="section-label">About this property</span>
              <h2>{roomName} in {destination}</h2>

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
                    Review the property information and listed
                    facilities to decide whether this accommodation
                    suits your trip.
                  </p>
                  <p>
                    Services, dining options and booking conditions
                    may vary by property and selected booking plan.
                    Check the details before making a reservation.
                  </p>
                </div>
              )}

              {/* FACILITIES */}

              <div className="property-info-section">
                <span className="section-label">
                  Listed Facilities
                </span>
                <h3>Property facilities</h3>

                <div className="facilities-list">
                  {amenities.length > 0 ? (
                    amenities.map((amenity, index) => (
                      <div
                        className="facility-item"
                        key={`${room._id}-facility-${index}`}
                      >
                        <span className="facility-check">✓</span>
                        <strong>{amenity}</strong>
                      </div>
                    ))
                  ) : (
                    <p>
                      No facilities have been specified for this listing.
                    </p>
                  )}
                </div>
              </div>

              {/* DINING */}

              <div className="property-info-section">
                <span className="section-label">Dining Information</span>
                <h3>Food and breakfast</h3>
                <div className="property-text-box">
                  <p>
                    Check with the property to confirm dining options,
                    breakfast availability and any additional charges.
                  </p>
                </div>
              </div>

              {/* BREAKFAST */}

              <div className="property-info-section">
                <span className="section-label">
                  Breakfast Information
                </span>
                <div className="breakfast-box">
                  <strong>Breakfast options</strong>
                  <p>
                    Breakfast availability and inclusions should be
                    confirmed for the selected room and booking plan.
                  </p>
                </div>
              </div>

              {/* LOCATION */}

              <div className="property-info-section">
                <span className="section-label">Location</span>
                <h3>Explore {destination}</h3>
                <div className="property-text-box">
                  <p>
                    This listing is associated with {destination}.
                    Confirm the exact property address and travel
                    arrangements before booking.
                  </p>
                </div>
              </div>
            </section>

            {/* ROOMS */}

            <section id="rooms" className="details-section">
              <span className="section-label">Rooms</span>
              <h2>Your room</h2>

              <div className="room-summary-card">
                {roomImage && (
                  <div className="room-summary-image">
                    <img
                      className="your-room-preview"
                      src={roomImage}
                      alt={`${roomName} in ${destination}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}

                <div className="room-summary-content">
                  <h3>{roomName}</h3>
                  <p>A stay in {destination}</p>

                  <div className="room-summary-features">
                    <span>👥 Sleeps {room.capacity || 1}</span>
                    <span>🛏️ {room.beds || "Not specified"}</span>
                    <span>📍 {destination}</span>
                  </div>

                  <div className="room-price-inline">
                    <strong>
                      NPR {Number(room.price || 0).toLocaleString("en-NP")}
                    </strong>
                    <span>/ night</span>
                  </div>
                </div>
              </div>

              {/* ROOM HIGHLIGHTS */}

              <div className="property-info-section">
                <span className="section-label">Room Highlights</span>
                <div className="room-highlights">
                  <div className="highlight">
                    <div className="highlight-icon">👥</div>
                    <strong>Guests</strong>
                    <span>Up to {room.capacity || 1} guests</span>
                  </div>
                  <div className="highlight">
                    <div className="highlight-icon">🛏️</div>
                    <strong>Sleeping</strong>
                    <span>{room.beds || "Not specified"}</span>
                  </div>
                  <div className="highlight">
                    <div className="highlight-icon">🏔️</div>
                    <strong>Location</strong>
                    <span>{destination}</span>
                  </div>
                </div>
              </div>

              {/* AMENITIES */}

              <div className="property-info-section">
                <span className="section-label">Room Amenities</span>
                <h3>Available amenities</h3>
                <div className="amenities-grid">
                  {amenities.length > 0 ? (
                    amenities.map((amenity, index) => (
                      <div
                        className="amenity-card"
                        key={`${room._id}-${index}`}
                      >
                        <span className="amenity-icon">✓</span>
                        <span>{amenity}</span>
                      </div>
                    ))
                  ) : (
                    <p>No room amenities have been specified.</p>
                  )}
                </div>
              </div>
            </section>

            {/* ADMIN-MANAGED HOTEL INSIGHTS */}
            {/* Moved below the complete Your room section */}

            <HotelInsights insights={room.hotelInsights} />

            {/* ACCESSIBILITY */}

            <section id="accessibility" className="details-section">
              <span className="section-label">Accessibility</span>
              <h2>Accessibility information</h2>
              <div className="simple-info-box">
                <p>
                  Contact the property before booking to confirm
                  accessibility features and any specific arrangements
                  you may require.
                </p>
              </div>
            </section>

            {/* POLICIES */}

            <section id="policies" className="details-section">
              <span className="section-label">Policies</span>
              <h2>Property policies</h2>

              <div className="policies-grid">
                <div className="policy-card">
                  <strong>Check-in</strong>
                  <span>
                    Confirm check-in timing with the property.
                  </span>
                </div>
                <div className="policy-card">
                  <strong>Check-out</strong>
                  <span>
                    Confirm check-out timing with the property.
                  </span>
                </div>
                <div className="policy-card">
                  <strong>Cancellation</strong>
                  <span>
                    Review the cancellation terms for your selected
                    booking plan.
                  </span>
                </div>
                <div className="policy-card">
                  <strong>Availability</strong>
                  <span>
                    Availability is subject to confirmation for
                    your requested stay.
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* STICKY BOOKING CARD */}

          <aside className="booking-card">
            <div className="booking-card-top">
              <span className="booking-eyebrow">Your stay</span>
              <h3>Reserve this room</h3>
              <p className="booking-subtitle">
                Review the details before proceeding with your booking.
              </p>
            </div>

            <div className="price-box">
              <span className="price">
                NPR {Number(room.price || 0).toLocaleString("en-NP")}
              </span>
              <span className="per-night">/ night</span>
            </div>

            <div className="booking-divider" />

            <div className="availability-status">
              <span
                className={`available-dot ${
                  !room.available ? "unavailable-dot" : ""
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
              {room.available ? "Reserve Room →" : "Currently Unavailable"}
            </button>

            <p className="booking-note">
              Review your booking details before confirmation.
            </p>

            <div className="booking-benefits">
              <span>Booking details before confirmation</span>
              <span>Backpacker Gateways</span>
              <span>Accommodation information</span>
            </div>

            <Link to="/rooms" className="back-rooms">
              ← Browse All Rooms
            </Link>
          </aside>
        </div>
      </main>

      {/* FULL SCREEN MAIN GALLERY */}

      {showGallery && totalImages > 0 && (
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
            alt={`${roomName} photo ${activeImage + 1}`}
            onClick={(event) => event.stopPropagation()}
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
            {activeImage + 1} / {totalImages}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;
