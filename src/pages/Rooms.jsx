import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getRooms } from "../services/roomApi";

const PAGE_TITLE = "Luxury Hotels in Nepal | Backpacker Gateways";
const PAGE_DESCRIPTION =
  "Discover hotels, hostels, luxury stays and trekking lodges across Nepal with Backpacker Gateways.";
const CANONICAL_URL = "https://www.backpackergateways.com/rooms";

const HOTEL_HERO_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85";

const FALLBACK_ROOM_IMAGE =
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80";

const Rooms = () => {
  const [searchParams] = useSearchParams();

  const destinationQuery =
    searchParams.get("destination")?.trim() || "";

  const checkInQuery =
    searchParams.get("checkIn") || "";

  const checkOutQuery =
    searchParams.get("checkOut") || "";

  const adultsQuery = Math.max(
    Number(searchParams.get("adults") || 1),
    1
  );

  const childrenQuery = Math.max(
    Number(searchParams.get("children") || 0),
    0
  );

  const totalGuestsQuery =
    adultsQuery + childrenQuery;

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const previousTitle = document.title;

    const existingDescription = document.querySelector(
      'meta[name="description"]'
    );

    const previousDescription =
      existingDescription?.getAttribute("content") || "";

    document.title = destinationQuery
      ? `${destinationQuery} Hotels | Backpacker Gateways`
      : PAGE_TITLE;

    if (existingDescription) {
      existingDescription.setAttribute(
        "content",
        destinationQuery
          ? `Find hotels and rooms in ${destinationQuery} with Backpacker Gateways. Compare stays, prices, amenities and book your Nepal accommodation.`
          : PAGE_DESCRIPTION
      );
    }

    let cancelled = false;

    const loadRooms = async () => {
      try {
        setLoading(true);

        const result = await getRooms({
          destination: destinationQuery,
          checkIn: checkInQuery,
          checkOut: checkOutQuery,
          guests: totalGuestsQuery,
        });

        console.log("ROOM SEARCH RESULT:", result);

        if (cancelled) return;

        let roomData = [];

        if (Array.isArray(result)) {
          roomData = result;
        } else if (Array.isArray(result?.data)) {
          roomData = result.data;
        } else if (Array.isArray(result?.rooms)) {
          roomData = result.rooms;
        } else if (Array.isArray(result?.data?.rooms)) {
          roomData = result.data.rooms;
        }

        setRooms(roomData);
      } catch (error) {
        console.error("ROOM SEARCH ERROR:", error);

        if (!cancelled) {
          setRooms([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRooms();

    return () => {
      cancelled = true;

      document.title = previousTitle;

      if (existingDescription) {
        existingDescription.setAttribute(
          "content",
          previousDescription
        );
      }
    };
  }, [
    destinationQuery,
    checkInQuery,
    checkOutQuery,
    totalGuestsQuery,
  ]);

  const hasSearch =
    destinationQuery ||
    checkInQuery ||
    checkOutQuery ||
    searchParams.has("adults") ||
    searchParams.has("children");

  const formatDate = (date) => {
    if (!date) return "";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rooms-page">
      {/* =========================
          HERO
      ========================== */}
      <section
        className="rooms-hero"
        style={{
          backgroundImage: `linear-gradient(
            rgba(0,0,0,0.48),
            rgba(0,0,0,0.58)
          ), url(${HOTEL_HERO_IMAGE})`,
        }}
      >
        <div className="rooms-hero-content">
          <span className="rooms-eyebrow">
            PREMIUM STAYS • NEPAL
          </span>

          <h1>
            {destinationQuery
              ? `Hotels in ${destinationQuery}`
              : "Stay in Style, Discover Nepal"}
          </h1>

          <p>
            Discover comfortable stays from budget
            hostels to luxury hotels across Nepal.
          </p>
        </div>
      </section>

      {/* =========================
          SEARCH SUMMARY
      ========================== */}
      {hasSearch && (
        <section className="rooms-search-summary">
          <div className="search-summary-inner">
            <div>
              <span className="summary-label">
                YOUR SEARCH
              </span>

              <div className="summary-main">
                {destinationQuery
                  ? destinationQuery
                  : "All Nepal"}
              </div>
            </div>

            <div className="summary-item">
              <span>CHECK-IN</span>
              <strong>
                {checkInQuery
                  ? formatDate(checkInQuery)
                  : "Any date"}
              </strong>
            </div>

            <div className="summary-item">
              <span>CHECK-OUT</span>
              <strong>
                {checkOutQuery
                  ? formatDate(checkOutQuery)
                  : "Any date"}
              </strong>
            </div>

            <div className="summary-item">
              <span>GUESTS</span>
              <strong>
                {totalGuestsQuery}{" "}
                {totalGuestsQuery === 1
                  ? "Guest"
                  : "Guests"}
              </strong>
            </div>
          </div>
        </section>
      )}

      {/* =========================
          ROOMS
      ========================== */}
      <section className="rooms-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              {destinationQuery
                ? "SEARCH RESULTS"
                : "BACKPACKER GATEWAYS"}
            </span>

            <h2>
              {destinationQuery
                ? `Available Stays in ${destinationQuery}`
                : "Find Your Perfect Stay"}
            </h2>

            <p>
              Comfortable rooms, trusted properties
              and memorable stays across Nepal.
            </p>
          </div>

          {!loading && rooms.length > 0 && (
            <div className="rooms-count">
              {rooms.length}{" "}
              {rooms.length === 1
                ? "Room"
                : "Rooms"}
            </div>
          )}
        </div>

        {/* =========================
            LOADING
        ========================== */}
        {loading && (
          <div className="rooms-loading">
            <div className="loading-spinner"></div>
            <p>
              {destinationQuery
                ? `Finding stays in ${destinationQuery}...`
                : "Finding available rooms..."}
            </p>
          </div>
        )}

        {/* =========================
            ROOM GRID
        ========================== */}
        {!loading && rooms.length > 0 && (
          <div className="rooms-grid">
            {rooms.map((room) => {
              const roomImage =
                room.images?.[0] ||
                FALLBACK_ROOM_IMAGE;

              return (
                <article
                  className="room-card"
                  key={room._id}
                >
                  <div className="room-image-wrap">
                    <img
                      src={roomImage}
                      alt={`${room.name || "Hotel room"} in ${
                        room.destination || "Nepal"
                      }`}
                      className="room-image"
                      loading="lazy"
                    />

                    {room.available !== false && (
                      <span className="available-badge">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="room-card-content">
                    <div className="room-location">
                      {room.destination ||
                        "Nepal"}
                    </div>

                    <h3>
                      {room.name ||
                        "Comfortable Room"}
                    </h3>

                    {room.description && (
                      <p className="room-description">
                        {room.description}
                      </p>
                    )}

                    <div className="room-meta">
                      {room.capacity && (
                        <span>
                          👤 {room.capacity} Guests
                        </span>
                      )}

                      {room.beds && (
                        <span>
                          🛏 {room.beds}
                        </span>
                      )}
                    </div>

                    {room.amenities?.length > 0 && (
                      <div className="room-amenities">
                        {room.amenities
                          .slice(0, 4)
                          .map((amenity, index) => (
                            <span
                              key={`${amenity}-${index}`}
                            >
                              {amenity}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="room-card-bottom">
                      <div className="room-price">
                        <small>
                          From
                        </small>

                        <strong>
                          NPR{" "}
                          {Number(
                            room.price || 0
                          ).toLocaleString()}
                        </strong>

                        <span>
                          / night
                        </span>
                      </div>

                      <Link
                        to={`/rooms/${
                          room.seoSlug ||
                          room._id
                        }`}
                        className="view-details-btn"
                      >
                        View Details
                      </Link>
                    </div>

                    <Link
                      to={`/booking?room=${room._id}`}
                      className="book-now-btn"
                    >
                      Book Now
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =========================
            NO RESULTS
        ========================== */}
        {!loading && rooms.length === 0 && (
          <div className="no-rooms">
            <div className="no-rooms-icon">
              🏨
            </div>

            <h3>
              No rooms found
            </h3>

            <p>
              {destinationQuery
                ? `We couldn't find available rooms matching your search in ${destinationQuery}.`
                : "No hotel rooms are currently available."}
            </p>

            <Link
              to="/rooms"
              className="clear-search-btn"
            >
              View All Rooms
            </Link>
          </div>
        )}
      </section>

      {/* =========================
          SEO CONTENT
      ========================== */}
      <section className="rooms-seo">
        <div className="rooms-seo-inner">
          <h2>
            Hotels & Accommodation in Nepal
          </h2>

          <p>
            Backpacker Gateways helps travellers
            discover hotels, hostels, luxury stays
            and comfortable accommodation across
            Nepal. Explore stays in Kathmandu,
            Pokhara, Chitwan, Everest and other
            popular destinations.
          </p>
        </div>
      </section>

      {/* =========================
          STYLES
      ========================== */}
      <style>{`
        .rooms-page {
          background: #fff;
          color: #172033;
          min-height: 100vh;
        }

        .rooms-hero {
          min-height: 430px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 70px 20px;
        }

        .rooms-hero-content {
          max-width: 850px;
          color: #fff;
        }

        .rooms-eyebrow,
        .section-eyebrow,
        .summary-label {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .rooms-hero h1 {
          font-size: clamp(38px, 6vw, 68px);
          line-height: 1.05;
          margin: 18px 0;
          font-weight: 800;
        }

        .rooms-hero p {
          font-size: 18px;
          line-height: 1.7;
          max-width: 650px;
          margin: 0 auto;
        }

        .rooms-search-summary {
          background: #f7f8fa;
          border-bottom: 1px solid #e8eaf0;
        }

        .search-summary-inner {
          max-width: 1250px;
          margin: auto;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          gap: 45px;
          flex-wrap: wrap;
        }

        .summary-label {
          display: block;
          color: #7b8190;
          margin-bottom: 5px;
        }

        .summary-main {
          font-size: 20px;
          font-weight: 800;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .summary-item span {
          font-size: 11px;
          font-weight: 700;
          color: #888f9e;
          letter-spacing: 1px;
        }

        .summary-item strong {
          font-size: 14px;
        }

        .rooms-section {
          max-width: 1250px;
          margin: 0 auto;
          padding: 75px 24px;
        }

        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 40px;
        }

        .section-heading h2 {
          font-size: clamp(30px, 4vw, 46px);
          margin: 10px 0;
          line-height: 1.15;
        }

        .section-heading p {
          color: #697386;
          max-width: 650px;
          line-height: 1.7;
          margin: 0;
        }

        .rooms-count {
          white-space: nowrap;
          font-weight: 800;
          font-size: 15px;
        }

        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px;
        }

        .room-card {
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 10px 35px rgba(20, 30, 50, 0.07);
          transition: transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .room-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 45px rgba(20, 30, 50, 0.12);
        }

        .room-image-wrap {
          height: 240px;
          position: relative;
          overflow: hidden;
        }

        .room-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .room-card:hover .room-image {
          transform: scale(1.04);
        }

        .available-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: #fff;
          padding: 7px 11px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 800;
        }

        .room-card-content {
          padding: 23px;
        }

        .room-location {
          color: #72798a;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .room-card h3 {
          font-size: 23px;
          margin: 8px 0 12px;
        }

        .room-description {
          color: #697386;
          font-size: 14px;
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 68px;
        }

        .room-meta {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin: 17px 0;
          font-size: 13px;
          color: #525b6c;
        }

        .room-amenities {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .room-amenities span {
          background: #f4f5f7;
          padding: 6px 9px;
          border-radius: 6px;
          font-size: 11px;
        }

        .room-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 20px;
        }

        .room-price {
          display: flex;
          flex-direction: column;
        }

        .room-price small {
          color: #858b98;
          font-size: 11px;
        }

        .room-price strong {
          font-size: 22px;
        }

        .room-price span {
          font-size: 11px;
          color: #858b98;
        }

        .view-details-btn,
        .book-now-btn,
        .clear-search-btn {
          text-decoration: none;
          font-weight: 800;
          border-radius: 9px;
          transition: 0.2s ease;
        }

        .view-details-btn {
          color: #172033;
          font-size: 13px;
        }

        .book-now-btn {
          display: block;
          text-align: center;
          background: #172033;
          color: #fff;
          padding: 13px;
          margin-top: 18px;
        }

        .book-now-btn:hover {
          opacity: 0.9;
        }

        .rooms-loading {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #697386;
        }

        .loading-spinner {
          width: 35px;
          height: 35px;
          border: 3px solid #e5e7eb;
          border-top-color: #172033;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .no-rooms {
          text-align: center;
          padding: 80px 20px;
          border: 1px dashed #dfe2e8;
          border-radius: 18px;
        }

        .no-rooms-icon {
          font-size: 45px;
          margin-bottom: 15px;
        }

        .no-rooms h3 {
          font-size: 25px;
          margin: 0 0 10px;
        }

        .no-rooms p {
          color: #697386;
          margin-bottom: 25px;
        }

        .clear-search-btn {
          display: inline-block;
          background: #172033;
          color: #fff;
          padding: 13px 22px;
        }

        .rooms-seo {
          background: #f7f8fa;
          padding: 65px 24px;
        }

        .rooms-seo-inner {
          max-width: 950px;
          margin: auto;
        }

        .rooms-seo h2 {
          font-size: 32px;
          margin-bottom: 15px;
        }

        .rooms-seo p {
          color: #697386;
          line-height: 1.8;
        }

        @media (max-width: 900px) {
          .rooms-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .section-heading {
            align-items: start;
            flex-direction: column;
          }
        }

        @media (max-width: 620px) {
          .rooms-hero {
            min-height: 360px;
          }

          .rooms-hero h1 {
            font-size: 38px;
          }

          .rooms-grid {
            grid-template-columns: 1fr;
          }

          .search-summary-inner {
            gap: 20px;
          }

          .rooms-section {
            padding: 55px 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default Rooms;