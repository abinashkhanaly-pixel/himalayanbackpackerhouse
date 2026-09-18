import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRoomBySlug } from "../services/roomApi";

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
      description: room.description || description,
      url: canonicalUrl,

      image:
        Array.isArray(room.images)
          ? room.images
          : [],

      occupancy: {
        "@type": "QuantitativeValue",
        maxValue: Number(room.capacity || 1)
      },

      bed: room.beds
        ? {
            "@type": "BedDetails",
            typeOfBed: room.beds
          }
        : undefined,

      amenityFeature:
        Array.isArray(room.amenities)
          ? room.amenities.map((amenity) => ({
              "@type":
                "LocationFeatureSpecification",
              name: amenity,
              value: true
            }))
          : [],

      address: {
        "@type": "PostalAddress",
        addressLocality: destination,
        addressCountry: "NP"
      },

      offers: {
        "@type": "Offer",
        price: Number(room.price || 0),
        priceCurrency: "NPR",

        availability:
          room.available
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",

        url: canonicalUrl
      }
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

  useEffect(() => {
    if (!showGallery) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowGallery(false);
      }

      if (event.key === "ArrowRight") {
        setActiveImage((current) => {
          if (!room?.images?.length) return current;

          return (
            (current + 1) %
            room.images.filter(Boolean).length
          );
        });
      }

      if (event.key === "ArrowLeft") {
        setActiveImage((current) => {
          if (!room?.images?.length) return current;

          const total =
            room.images.filter(Boolean).length;

          return (
            (current - 1 + total) %
            total
          );
        });
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

  const handleBooking = () => {
    if (!room?._id || !room?.available) {
      return;
    }

    navigate(`/booking?room=${room._id}`);
  };

  if (loading) {
    return (
      <>
        <style>{`
          .details-loading {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f7f8f6;
            color: #68716b;
            font-family: Arial, Helvetica, sans-serif;
          }

          .spinner {
            width: 42px;
            height: 42px;
            border: 3px solid #ddd;
            border-top-color: #8b6b3f;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 18px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="details-loading">
          <div
            className="spinner"
            aria-hidden="true"
          />

          <p>
            Preparing your Himalayan stay...
          </p>
        </div>
      </>
    );
  }

  if (error || !room) {
    return (
      <>
        <style>{`
          .details-error {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px 20px;
            background: #f7f8f6;
            font-family: Arial, Helvetica, sans-serif;
          }

          .details-error h2 {
            margin: 0 0 10px;
            color: #18231d;
            font-size: 32px;
          }

          .details-error p {
            margin: 0;
            color: #68716b;
          }

          .back-button {
            display: inline-block;
            margin-top: 25px;
            padding: 13px 22px;
            border-radius: 10px;
            background: #18231d;
            color: white;
            text-decoration: none;
            font-size: 13px;
            font-weight: 700;
          }

          .back-button:hover {
            background: #8b6b3f;
          }
        `}</style>

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
      </>
    );
  }

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
      ? images[0]
      : "";

  const sideImages =
    images.slice(1, 5);

  const hiddenPhotos =
    Math.max(images.length - 5, 0);

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

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .details-page {
          background: #f7f8f6;
          min-height: 100vh;
          font-family: Arial, Helvetica, sans-serif;
          color: #18231d;
        }

        /* =================================================
           BOOKING.COM STYLE GALLERY
        ================================================= */

        .room-gallery-wrapper {
          max-width: 1250px;
          margin: 0 auto;
          padding: 28px 6% 0;
        }

        .room-gallery {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 6px;
          height: 530px;
          overflow: hidden;
          border-radius: 14px;
          background: #ddd;
        }

        .gallery-main {
          position: relative;
          min-width: 0;
          overflow: hidden;
          background: #18231d;
          cursor: pointer;
        }

        .gallery-main img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.35s ease;
        }

        .gallery-main:hover img {
          transform: scale(1.015);
        }

        .gallery-side {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 6px;
          min-width: 0;
        }

        .gallery-tile {
          position: relative;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          border: 0;
          padding: 0;
          background: #ddd;
          cursor: pointer;
        }

        .gallery-tile img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.35s ease;
        }

        .gallery-tile:hover img {
          transform: scale(1.04);
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.52);
          color: white;
          font-size: 15px;
          font-weight: 700;
        }

        .gallery-overlay:hover {
          background: rgba(0,0,0,0.62);
        }

        .gallery-main-label {
          position: absolute;
          left: 20px;
          bottom: 18px;
          z-index: 2;
          padding: 9px 13px;
          border-radius: 7px;
          background: rgba(0,0,0,0.48);
          color: white;
          font-size: 13px;
          font-weight: 700;
          backdrop-filter: blur(5px);
        }

        .gallery-view-button {
          position: absolute;
          right: 18px;
          bottom: 18px;
          z-index: 2;
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 7px;
          padding: 9px 13px;
          background: rgba(0,0,0,0.48);
          color: white;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          backdrop-filter: blur(5px);
        }

        .gallery-view-button:hover {
          background: rgba(0,0,0,0.7);
        }

        .no-image-gallery {
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8ebe7;
          color: #68716b;
          border-radius: 14px;
        }

        /* =================================================
           ROOM HEADER
        ================================================= */

        .room-header {
          max-width: 1250px;
          margin: 0 auto;
          padding: 28px 6% 10px;
        }

        .details-back {
          display: inline-block;
          margin-bottom: 18px;
          color: #536058;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .details-back:hover {
          color: #8b6b3f;
        }

        .room-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 30px;
        }

        .room-header-main {
          min-width: 0;
        }

        .details-availability {
          display: inline-block;
          padding: 7px 12px;
          border-radius: 20px;
          background: #eaf4ed;
          color: #28613b;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .details-availability.unavailable {
          background: #f8eaea;
          color: #9b3636;
        }

        .room-header h1 {
          margin: 0 0 9px;
          color: #18231d;
          font-size: clamp(30px, 4vw, 46px);
          line-height: 1.1;
        }

        .room-location {
          margin: 0;
          color: #68716b;
          font-size: 14px;
          font-weight: 600;
        }

        .room-header-price {
          flex-shrink: 0;
          text-align: right;
        }

        .room-header-price strong {
          display: block;
          color: #8b6b3f;
          font-size: 25px;
        }

        .room-header-price span {
          color: #68716b;
          font-size: 12px;
        }

        /* =================================================
           CONTENT
        ================================================= */

        .details-container {
          max-width: 1250px;
          margin: 0 auto;
          padding: 45px 6% 100px;
        }

        .details-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 380px;
          gap: 55px;
          align-items: start;
        }

        .section-label {
          display: inline-block;
          margin-bottom: 12px;
          color: #8b6b3f;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .content-section h2 {
          margin: 0 0 18px;
          color: #18231d;
          font-size: 32px;
          line-height: 1.2;
        }

        .content-section > p {
          max-width: 760px;
          margin: 0 0 40px;
          color: #68716b;
          font-size: 16px;
          line-height: 1.8;
        }

        .room-highlights {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 55px;
        }

        .highlight {
          padding: 22px;
          background: white;
          border: 1px solid #e3e7e2;
          border-radius: 15px;
        }

        .highlight-icon {
          margin-bottom: 12px;
          font-size: 24px;
        }

        .highlight strong {
          display: block;
          margin-bottom: 5px;
          color: #18231d;
          font-size: 14px;
        }

        .highlight span {
          color: #68716b;
          font-size: 13px;
          line-height: 1.5;
        }

        .amenities-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 12px;
          margin-top: 25px;
        }

        .amenity-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: white;
          border: 1px solid #e3e7e2;
          border-radius: 12px;
          color: #46524a;
          font-size: 14px;
        }

        .amenity-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #eef2ed;
          color: #28613b;
          font-weight: 700;
        }

        /* =================================================
           BOOKING CARD
        ================================================= */

        .booking-card {
          position: sticky;
          top: 25px;
          padding: 30px;
          background: white;
          border: 1px solid #e2e6e1;
          border-radius: 20px;
          box-shadow:
            0 15px 40px
            rgba(24,35,29,0.08);
        }

        .booking-card h3 {
          margin: 0 0 8px;
          color: #18231d;
          font-size: 25px;
        }

        .booking-subtitle {
          margin: 0 0 25px;
          color: #68716b;
          font-size: 13px;
          line-height: 1.6;
        }

        .price-box {
          padding: 20px 0;
          border-top: 1px solid #eceeeb;
          border-bottom: 1px solid #eceeeb;
        }

        .price {
          color: #8b6b3f;
          font-size: 29px;
          font-weight: 700;
        }

        .per-night {
          color: #8b918d;
          font-size: 13px;
        }

        .availability-status {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 20px 0;
          color: #536058;
          font-size: 13px;
        }

        .available-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #28613b;
        }

        .unavailable-dot {
          background: #9b3636;
        }

        .book-now {
          width: 100%;
          border: 0;
          padding: 15px 20px;
          border-radius: 10px;
          background: #18231d;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .book-now:hover:not(:disabled) {
          background: #8b6b3f;
          transform: translateY(-2px);
        }

        .book-now:disabled {
          background: #a8ada9;
          cursor: not-allowed;
        }

        .booking-note {
          margin: 17px 0 0;
          color: #8b918d;
          font-size: 11px;
          line-height: 1.6;
          text-align: center;
        }

        .back-rooms {
          display: block;
          margin-top: 18px;
          color: #536058;
          text-align: center;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }

        .back-rooms:hover {
          color: #8b6b3f;
        }

        /* =================================================
           FULL SCREEN CAROUSEL
        ================================================= */

        .gallery-modal {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: rgba(0,0,0,0.94);
        }

        .gallery-modal-image {
          max-width: 90vw;
          max-height: 84vh;
          object-fit: contain;
          border-radius: 6px;
          user-select: none;
        }

        .gallery-close {
          position: absolute;
          top: 18px;
          right: 22px;
          width: 46px;
          height: 46px;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.14);
          color: white;
          font-size: 30px;
          cursor: pointer;
          z-index: 5;
        }

        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 52px;
          height: 52px;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.16);
          color: white;
          font-size: 32px;
          cursor: pointer;
          z-index: 5;
        }

        .gallery-arrow:hover,
        .gallery-close:hover {
          background: rgba(255,255,255,0.3);
        }

        .gallery-arrow-left {
          left: 22px;
        }

        .gallery-arrow-right {
          right: 22px;
        }

        .gallery-modal-counter {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 14px;
          border-radius: 20px;
          background: rgba(0,0,0,0.55);
          color: white;
          font-size: 13px;
          font-weight: 700;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 900px) {

          .room-gallery-wrapper {
            padding-left: 3%;
            padding-right: 3%;
          }

          .room-gallery {
            height: 460px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .booking-card {
            position: static;
          }

          .details-container {
            padding-left: 3%;
            padding-right: 3%;
          }

        }

        @media (max-width: 650px) {

          .room-gallery-wrapper {
            padding:
              12px 12px 0;
          }

          .room-gallery {
            grid-template-columns: 1.6fr 1fr;
            height: 310px;
            gap: 4px;
            border-radius: 10px;
          }

          .gallery-side {
            gap: 4px;
          }

          .gallery-main-label {
            left: 10px;
            bottom: 10px;
            padding: 7px 9px;
            font-size: 11px;
          }

          .gallery-view-button {
            right: 8px;
            bottom: 8px;
            padding: 7px 9px;
            font-size: 10px;
          }

          .gallery-overlay {
            font-size: 12px;
            text-align: center;
            padding: 5px;
          }

          .room-header {
            padding:
              20px 18px 5px;
          }

          .room-header-row {
            display: block;
          }

          .room-header h1 {
            font-size: 31px;
          }

          .room-header-price {
            margin-top: 14px;
            text-align: left;
          }

          .details-container {
            padding:
              35px 18px 70px;
          }

          .room-highlights {
            grid-template-columns: 1fr;
          }

          .amenities-grid {
            grid-template-columns: 1fr;
          }

          .booking-card {
            padding: 24px;
          }

          .gallery-modal {
            padding: 15px;
          }

          .gallery-modal-image {
            max-width: 96vw;
            max-height: 80vh;
          }

          .gallery-arrow {
            width: 42px;
            height: 42px;
            font-size: 26px;
          }

          .gallery-arrow-left {
            left: 8px;
          }

          .gallery-arrow-right {
            right: 8px;
          }

          .gallery-close {
            top: 10px;
            right: 10px;
          }

        }

      `}</style>

      <div className="details-page">

        {/* =================================================
            BOOKING STYLE PHOTO GALLERY
        ================================================= */}

        <div className="room-gallery-wrapper">

          {images.length > 0 ? (

            <section className="room-gallery">

              {/* BIG LEFT PHOTO */}

              <button
                type="button"
                className="gallery-main"
                onClick={() =>
                  openGallery(0)
                }
                aria-label="View main room photo"
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

              </button>

              {/* 4 SMALL RIGHT PHOTOS */}

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

        {/* =================================================
            ROOM TITLE / LOCATION
        ================================================= */}

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

        {/* =================================================
            CONTENT
        ================================================= */}

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

      </div>

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

    </>
  );
};

export default RoomDetails;