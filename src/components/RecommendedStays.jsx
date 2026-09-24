import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../services/roomApi";
import "./RecommendedStays.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const RecommendedStays = () => {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadRecommendedStays = async () => {
      try {
        setLoading(true);

        const result = await getRooms();

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

        setStays(roomData.slice(0, 6));
      } catch (error) {
        console.error("RECOMMENDED STAYS ERROR:", error);

        if (!cancelled) {
          setStays([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRecommendedStays();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && stays.length === 0) {
    return null;
  }

  return (
    <section className="recommended-stays">
      <div className="recommended-stays-container">

        {/* SECTION HEADER */}
        <div className="recommended-stays-header">
          <div>
            <span className="recommended-eyebrow">
              PREMIUM STAYS • NEPAL
            </span>

            <h2>Recommended Stays</h2>

            <p>
              Handpicked places to stay for an unforgettable Nepal journey.
            </p>
          </div>

          <Link to="/rooms" className="view-all-stays">
            View All Stays
            <span>→</span>
          </Link>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="recommended-loading">
            <div className="stay-skeleton" />
            <div className="stay-skeleton" />
            <div className="stay-skeleton" />
          </div>
        ) : (
          <div className="recommended-stays-grid">
            {stays.map((stay) => {
              const image =
                stay.images?.[0] || FALLBACK_IMAGE;

              const amenities = Array.isArray(stay.amenities)
                ? stay.amenities.slice(0, 3)
                : [];

              return (
                <article
                  className="recommended-stay-card"
                  key={stay._id}
                >
                  {/* IMAGE */}
                  <Link
                    to={`/rooms/${stay.seoSlug || stay._id}`}
                    className="stay-image-wrapper"
                  >
                    <img
                      src={image}
                      alt={stay.name || "Luxury stay in Nepal"}
                      loading="lazy"
                    />

                    <span className="stay-badge">
                      PREMIUM STAY
                    </span>

                    <span className="stay-image-arrow">
                      ↗
                    </span>
                  </Link>

                  {/* CONTENT */}
                  <div className="stay-card-content">

                    <div className="stay-location">
                      <span>⌖</span>
                      {stay.destination || "Nepal"}
                    </div>

                    <Link
                      to={`/rooms/${stay.seoSlug || stay._id}`}
                      className="stay-name"
                    >
                      {stay.name || "Luxury Stay"}
                    </Link>

                    {stay.description && (
                      <p className="stay-description">
                        {stay.description
                          .replace(/\n/g, " ")
                          .slice(0, 105)}
                        {stay.description.length > 105 ? "..." : ""}
                      </p>
                    )}

                    {amenities.length > 0 && (
                      <div className="stay-amenities">
                        {amenities.map((amenity, index) => (
                          <span key={index}>
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="stay-card-footer">
                      <div className="stay-price">
                        <small>From</small>
                        <strong>
                          NPR{" "}
                          {Number(
                            stay.price || 0
                          ).toLocaleString()}
                        </strong>
                          <span>/ night</span>
                      </div>

                      <Link
                        to={`/rooms/${stay.seoSlug || stay._id}`}
                        className="stay-view-button"
                      >
                        View Stay
                        <span>→</span>
                      </Link>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default RecommendedStays;