
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../services/roomApi";
import "./RecommendedStays.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const getRoomList = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.rooms)) return result.rooms;
  if (Array.isArray(result?.data?.rooms)) return result.data.rooms;
  return [];
};

const getStars = (stay) => {
  const value =
    stay.starCategory ??
    stay.starRating ??
    stay.stars ??
    stay.star ??
    stay.hotelStar ??
    stay.hotelStars;

  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const text = String(value).trim();
  const match = text.match(/\b([1-5])\s*-?\s*Star\b/i);

  if (match) return Number(match[1]);

  if (/^[1-5]$/.test(text)) {
    return Number(text);
  }

  return 0;
};

const sortByName = (items) =>
  [...items].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""))
  );

const getUniqueRooms = (items) => {
  const seen = new Set();

  return items.filter((stay) => {
    const id = stay._id || stay.seoSlug || stay.name;

    if (!id || seen.has(id)) return false;

    seen.add(id);
    return true;
  });
};

// Match locations using destination and location fields.
const getLocationText = (stay) =>
  `${stay.destination || ""} ${stay.location || ""}`.toLowerCase();

const belongsToLocation = (stay, locationName) =>
  getLocationText(stay).includes(locationName.toLowerCase());

// Exclude both retreat destinations from the 5-Star Hotels section.
const isKathmanduAreaRetreat = (stay) =>
  belongsToLocation(stay, "dhulikhel") ||
  belongsToLocation(stay, "nagarkot");

const RecommendedStays = () => {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadRecommendedStays = async () => {
      try {
        setLoading(true);

        const result = await getRooms();
        const roomList = getRoomList(result);

        console.log("RECOMMENDED ROOMS RESPONSE:", result);

        console.table(
          roomList.map((room) => ({
            name: room.name,
            starCategory: room.starCategory,
            starRating: room.starRating,
            destination: room.destination,
            location: room.location,
          }))
        );

        if (!cancelled) {
          setStays(roomList);
        }
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

  // 5-Star Hotels: only 5-star properties outside Dhulikhel and Nagarkot.
  const fiveStar = sortByName(
    getUniqueRooms(
      stays.filter(
        (stay) =>
          getStars(stay) === 5 &&
          !isKathmanduAreaRetreat(stay)
      )
    )
  ).slice(0, 15);

  // 4-Star Hotels: all 4-star properties, independent of location.
  const fourStar = sortByName(
    getUniqueRooms(
      stays.filter((stay) => getStars(stay) === 4)
    )
  ).slice(0, 9);

  // Himalayan retreats from Dhulikhel and Nagarkot.
  const himalayanRetreats = sortByName(
    getUniqueRooms(
      stays.filter((stay) => isKathmanduAreaRetreat(stay))
    )
  ).slice(0, 12);

  // Dhulikhel section: determined by destination/location.
  const dhulikhel = sortByName(
    getUniqueRooms(
      stays.filter((stay) =>
        belongsToLocation(stay, "dhulikhel")
      )
    )
  ).slice(0, 6);

  // Nagarkot section: determined by destination/location.
  const nagarkot = sortByName(
    getUniqueRooms(
      stays.filter((stay) =>
        belongsToLocation(stay, "nagarkot")
      )
    )
  ).slice(0, 6);

  if (!loading && stays.length === 0) {
    return null;
  }

  const renderHotelGrid = (items, sectionName) => (
    <div className="recommended-stays-grid">
      {items.map((stay, index) => {
        const image =
  stay.mainImage ||
  (Array.isArray(stay.images) && stay.images.length > 0
    ? stay.images[0]
    : FALLBACK_IMAGE);
        const amenities = Array.isArray(stay.amenities)
          ? stay.amenities.slice(0, 3)
          : [];

        const detailsUrl = `/rooms/${stay.seoSlug || stay._id}`;

        return (
          <article
            className="recommended-stay-card"
            key={`${sectionName}-${stay._id || stay.seoSlug || index}`}
          >
            <Link to={detailsUrl} className="stay-image-wrapper">
              <img
                src={image}
                alt={stay.name || "Hotel in Nepal"}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                width="1200"
                height="800"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />

              <span className="stay-badge">
                {getStars(stay) > 0
                  ? `${getStars(stay)} STAR`
                  : "PREMIUM STAY"}
              </span>

              <span className="stay-image-arrow">↗</span>
            </Link>

            <div className="stay-card-content">
              <div className="stay-location">
                <span>⌖</span>
                {stay.destination || stay.location || "Nepal"}
              </div>

              <Link to={detailsUrl} className="stay-name">
                {stay.name || "Hotel in Nepal"}
              </Link>

              {stay.description && (
                <p className="stay-description">
                  {String(stay.description)
                    .replace(/\n/g, " ")
                    .slice(0, 105)}
                  {String(stay.description).length > 105
                    ? "..."
                    : ""}
                </p>
              )}

              {amenities.length > 0 && (
                <div className="stay-amenities">
                  {amenities.map((amenity, amenityIndex) => (
                    <span key={amenityIndex}>{amenity}</span>
                  ))}
                </div>
              )}

              <div className="stay-card-footer">
                <div className="stay-price">
                  <small>From</small>
                  <strong>
                    NPR {Number(stay.price || 0).toLocaleString()}
                  </strong>
                  <span>/ night</span>
                </div>

                <Link to={detailsUrl} className="stay-view-button">
                  View Stay <span>→</span>
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  const renderSection = (
    title,
    items,
    sectionName,
    headingLevel = "h3"
  ) => {
    const Heading = headingLevel;

    if (!loading && items.length === 0) {
      return null;
    }

    return (
      <section
        className="recommended-stays-section"
        key={sectionName}
      >
        <div className="recommended-stays-section-header">
          <Heading>{title}</Heading>

          {!loading && (
            <p>
              {items.length} {items.length === 1 ? "stay" : "stays"}
            </p>
          )}
        </div>

        {loading ? (
          <div className="recommended-loading">
            <div className="stay-skeleton" />
            <div className="stay-skeleton" />
            <div className="stay-skeleton" />
          </div>
        ) : (
          renderHotelGrid(items, sectionName)
        )}
      </section>
    );
  };

  const hasRetreats =
    loading || himalayanRetreats.length > 0;

  return (
    <section id="recommended-stays" className="recommended-stays">
      <div className="recommended-stays-container">
        <div className="recommended-stays-header">
          <div>
            <span className="recommended-eyebrow">
              PREMIUM STAYS • NEPAL
            </span>

            <h2>Recommended Stays in Nepal</h2>

            <p>
              Handpicked hotels and Himalayan retreats for your next journey.
            </p>
          </div>

          <Link to="/rooms" className="view-all-stays">
            View All Stays <span>→</span>
          </Link>
        </div>

        {renderSection("5-Star Hotels", fiveStar, "five-star")}

        {renderSection("4-Star Hotels", fourStar, "four-star")}

        {hasRetreats && (
          <section className="recommended-retreats">
            <div className="recommended-stays-section-header">
              <h3>Himalayan Retreats Near Kathmandu</h3>
            </div>

            {renderSection(
              "Dhulikhel",
              dhulikhel,
              "dhulikhel",
              "h4"
            )}

            {renderSection(
              "Nagarkot",
              nagarkot,
              "nagarkot",
              "h4"
            )}
          </section>
        )}
      </div>
    </section>
  );
};

export default RecommendedStays;
