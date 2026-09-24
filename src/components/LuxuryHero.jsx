
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LuxuryHero.css";

/* =========================================================
   HOTEL HERO SLIDES
   ========================================================= */

const heroImages = [
  {
    src: "/287619497 (1).jpg",
    alt: "Luxury hotel in Nepal",
    name: "Luxury Stay in Kathmandu",
    location: "Kathmandu, Nepal",
  },
  {
    src: "/689323318.jpg",
    alt: "Luxury hotel exterior in Nepal",
    name: "Premium Hotel Experience",
    location: "Kathmandu, Nepal",
  },
  {
    src: "/859352371.jpg",
    alt: "Luxury hotel building in Nepal",
    name: "Elegant Stay in Nepal",
    location: "Kathmandu, Nepal",
  },
  {
    src: "/Dwarikas-Hotel-Kathmandu-Nepal_Feat-1400x933.jpg",
    alt: "Dwarika's Hotel Kathmandu",
    name: "Dwarika's Hotel",
    location: "Battisputali, Kathmandu",
  },
];

/* =========================================================
   TABS
   ========================================================= */

const tabs = [
  {
    id: "hotel",
    label: "Luxury Hotel",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 21V8l9-5 9 5v13" />
        <path d="M7 21v-6h10v6" />
        <path d="M7 11h2M15 11h2M7 7h2M15 7h2" />
      </svg>
    ),
  },
  {
    id: "packages",
    label: "Luxury Packages",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16v13H4z" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M4 11h16" />
        <path d="M10 11v3h4v-3" />
      </svg>
    ),
  },
  {
    id: "vehicle",
    label: "Luxury Vehicle",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 17h14l-1-6H6z" />
        <path d="M8 11l1.5-4h5L16 11" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </svg>
    ),
  },
  {
    id: "trek",
    label: "Luxury Trek",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 20l7-10 4 5 2-3 5 8" />
        <path d="M14 7l2-3 2 3" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

function LuxuryHero() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("hotel");

  const [destination, setDestination] = useState("");

  /* =========================================================
     GEOAPIFY LOCATION SEARCH
     ========================================================= */

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const [travelerOpen, setTravelerOpen] = useState(false);

  /* CURRENT HERO SLIDE */
  const [activeImage, setActiveImage] = useState(0);

  const totalTravelers = adults + children;

  const currentHotel = heroImages[activeImage];

  /* =========================================================
     GEOAPIFY AUTOCOMPLETE
     ========================================================= */

  useEffect(() => {
    const searchLocations = async () => {
      const query = destination.trim();

      if (!query) {
        setLocationSuggestions([]);
        setLocationLoading(false);
        return;
      }

      setLocationLoading(true);

      try {
        const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

        if (!apiKey) {
          console.error(
            "VITE_GEOAPIFY_API_KEY is missing from environment variables."
          );
          setLocationSuggestions([]);
          return;
        }

        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query
          )}&limit=5&apiKey=${apiKey}`
        );

        if (!response.ok) {
          throw new Error(
            `Geoapify request failed: ${response.status}`
          );
        }

        const data = await response.json();

        setLocationSuggestions(data.features || []);
      } catch (error) {
        console.error("Geoapify location search error:", error);
        setLocationSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    };

    const timer = setTimeout(searchLocations, 300);

    return () => clearTimeout(timer);
  }, [destination]);

  /* =========================================================
     SELECT LOCATION
     ========================================================= */

  const selectDestination = (feature) => {
    const properties = feature.properties || {};

    const name =
      properties.name ||
      properties.city ||
      properties.town ||
      properties.village ||
      properties.country ||
      properties.formatted ||
      "";

    setDestination(name);
    setLocationSuggestions([]);
    setLocationOpen(false);
  };

  /* =========================================================
     AUTOMATIC CINEMATIC SLIDER
     ========================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((current) => {
        return (current + 1) % heroImages.length;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  /* =========================================================
     SEARCH
     ========================================================= */

  const handleSearch = () => {
    if (activeTab === "hotel") {
      const params = new URLSearchParams();

      if (destination.trim()) {
        params.set("destination", destination.trim());
      }

      if (checkIn) {
        params.set("checkIn", checkIn);
      }

      if (checkOut) {
        params.set("checkOut", checkOut);
      }

      params.set("adults", String(adults));
      params.set("children", String(children));
      params.set("rooms", String(rooms));

      const queryString = params.toString();

      navigate("/rooms?" + queryString);

      return;
    }

    if (activeTab === "trek") {
      navigate("/trekking");
      return;
    }

    if (activeTab === "vehicle") {
      navigate("/vehicles");
      return;
    }

    if (activeTab === "packages") {
      navigate("/packages");
      return;
    }

    navigate("/explore");
  };

  /* =========================================================
     TRAVELER CONTROLS
     ========================================================= */

  const changeAdults = (amount) => {
    setAdults((current) => Math.max(1, current + amount));
  };

  const changeChildren = (amount) => {
    setChildren((current) => Math.max(0, current + amount));
  };

  const changeRooms = (amount) => {
    setRooms((current) => Math.max(1, current + amount));
  };

  /* =========================================================
     JSX
     ========================================================= */

  return (
    <section className="luxury-hero">

      {/* =====================================================
          CINEMATIC BACKGROUND SLIDER
      ===================================================== */}

      <div className="luxury-hero-bg">
        {heroImages.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            className={index === activeImage ? "active" : ""}
          />
        ))}
      </div>

      {/* DARK PREMIUM OVERLAY */}

      <div className="luxury-hero-overlay" />

      <div className="luxury-hero-glow" />

      {/* =====================================================
          HOTEL INFORMATION OVER IMAGE
      ===================================================== */}

      <div
        key={activeImage}
        className="luxury-hotel-info active"
      >
        <span className="luxury-hotel-eyebrow">
          LUXURY STAYS IN NEPAL
        </span>

        <h2 className="luxury-hotel-name">
          {currentHotel.name}
        </h2>

        <span className="luxury-hotel-location">
          {currentHotel.location}
        </span>

        <span className="luxury-hotel-line" />
      </div>

      {/* =====================================================
          SLIDE COUNTER
      ===================================================== */}

      <div className="luxury-hotel-counter">
        <strong>
          {String(activeImage + 1).padStart(2, "0")}
        </strong>

        <span>/</span>

        <span>
          {String(heroImages.length).padStart(2, "0")}
        </span>
      </div>

      {/* =====================================================
          SLIDE PROGRESS
      ===================================================== */}

      <div className="luxury-hotel-progress">
        <span
          className="luxury-hotel-progress-active"
          style={{
            width: `${
              ((activeImage + 1) / heroImages.length) * 100
            }%`,
          }}
        />
      </div>

      {/* =====================================================
          HERO CONTENT
      ===================================================== */}

      <div className="luxury-hero-container">

        <div className="luxury-hero-content">

          <div className="luxury-eyebrow">
            <span className="eyebrow-line" />

            <span>
              EXPLORE NEPAL WITH LUXURIOUS EXPERIENCES
            </span>

            <span className="eyebrow-line" />
          </div>

          <h1>
            Stay Luxury in Nepal
          </h1>

          {/* =================================================
              TABS
          ================================================= */}

          <div className="luxury-tabs">

            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`luxury-tab ${
                  activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setTravelerOpen(false);
                  setLocationOpen(false);
                }}
              >
                <span className="luxury-tab-icon">
                  {tab.icon}
                </span>

                <span>
                  {tab.label}
                </span>
              </button>
            ))}

          </div>

          {/* =================================================
              IMAGE DOTS
          ================================================= */}

          <div className="luxury-hero-dots">

            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                className={
                  index === activeImage ? "active" : ""
                }
                onClick={() => setActiveImage(index)}
                aria-label={`Show hero image ${index + 1}`}
              />
            ))}

          </div>

        </div>
      </div>

      {/* =====================================================
          SEARCH SECTION
      ===================================================== */}

      <div className="luxury-search-section">

        <div className="luxury-search-wrap">

          <div className="luxury-search">

            {/* =================================================
                WHERE
            ================================================= */}

            <div
              className="search-field destination-field"
              style={{ position: "relative" }}
            >

              <div className="search-icon">

                <svg viewBox="0 0 24 24">

                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

                  <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                  />

                </svg>

              </div>

              <div className="search-field-content">

                <label htmlFor="luxury-destination">
                  Where are you going?
                </label>

                <input
                  id="luxury-destination"
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setLocationOpen(true);
                  }}
                  onFocus={() => {
                    setLocationOpen(true);
                    setTravelerOpen(false);
                  }}
                  placeholder="Kathmandu, Pokhara, Everest..."
                  autoComplete="off"
                />

              </div>

              {/* =================================================
                  LOCATION SUGGESTIONS
              ================================================= */}

              {locationOpen && destination.trim() && (
                <div className="destination-options">

                  {locationLoading && (
                    <div className="location-search-message">
                      <span>⌖</span>

                      <div>
                        <strong>
                          Searching locations...
                        </strong>

                        <small>
                          Finding places worldwide
                        </small>
                      </div>
                    </div>
                  )}

                  {!locationLoading &&
                    locationSuggestions.map((feature) => {
                      const properties =
                        feature.properties || {};

                      const name =
                        properties.name ||
                        properties.city ||
                        properties.town ||
                        properties.village ||
                        properties.country ||
                        properties.formatted ||
                        "";

                      const formatted =
                        properties.formatted ||
                        properties.country ||
                        "";

                      return (
                        <button
                          key={
                            properties.place_id ||
                            `${name}-${properties.lat}-${properties.lon}`
                          }
                          type="button"
                          onClick={() =>
                            selectDestination(feature)
                          }
                        >

                          <span className="destination-map-icon">
                            ⌖
                          </span>

                          <span>
                            <strong>
                              {name}
                            </strong>

                            <small>
                              {formatted}
                            </small>
                          </span>

                          <b>
                            →
                          </b>

                        </button>
                      );
                    })}

                  {!locationLoading &&
                    destination.trim() &&
                    locationSuggestions.length === 0 && (
                      <div className="no-location-result">

                        <span>⌖</span>

                        <div>
                          <strong>
                            {destination}
                          </strong>

                          <small>
                            No matching location found
                          </small>
                        </div>

                      </div>
                    )}

                </div>
              )}

            </div>

            <div className="search-divider" />

            {/* =================================================
                DATES
            ================================================= */}

            <div className="search-field dates-field">

              <div className="search-icon">

                <svg viewBox="0 0 24 24">

                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="2"
                  />

                  <path d="M16 3v4M8 3v4M3 10h18" />

                </svg>

              </div>

              <div className="search-field-content">

                <label>
                  Dates
                </label>

                <div className="date-inputs">

                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) =>
                      setCheckIn(e.target.value)
                    }
                    aria-label="Check in"
                  />

                  <span>
                    →
                  </span>

                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) =>
                      setCheckOut(e.target.value)
                    }
                    aria-label="Check out"
                  />

                </div>

              </div>

            </div>

            <div className="search-divider" />

            {/* =================================================
                TRAVELERS
            ================================================= */}

            <div className="search-field travelers-field">

              <div className="search-icon">

                <svg viewBox="0 0 24 24">

                  <circle
                    cx="9"
                    cy="8"
                    r="3"
                  />

                  <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />

                  <path d="M16 11a3 3 0 1 0 0-6" />

                  <path d="M18 14c2 .7 3 2.5 3 5" />

                </svg>

              </div>

              <button
                type="button"
                className="traveler-trigger"
                onClick={() => {
                  setTravelerOpen((current) => !current);
                  setLocationOpen(false);
                }}
              >

                <span className="traveler-label">
                  Travelers
                </span>

                <span className="traveler-summary">

                  {rooms} room
                  {rooms !== 1 ? "s" : ""},{" "}

                  {totalTravelers} traveler
                  {totalTravelers !== 1 ? "s" : ""}

                </span>

              </button>

              {/* =================================================
                  TRAVELER POPUP
              ================================================= */}

              {travelerOpen && (

                <div className="traveler-popup">

                  {/* ADULTS */}

                  <div className="traveler-row">

                    <div>

                      <strong>
                        Adults
                      </strong>

                      <small>
                        Age 13+
                      </small>

                    </div>

                    <div className="counter">

                      <button
                        type="button"
                        onClick={() =>
                          changeAdults(-1)
                        }
                        disabled={adults <= 1}
                      >
                        −
                      </button>

                      <span>
                        {adults}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          changeAdults(1)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                  {/* CHILDREN */}

                  <div className="traveler-row">

                    <div>

                      <strong>
                        Children
                      </strong>

                      <small>
                        Age 0–12
                      </small>

                    </div>

                    <div className="counter">

                      <button
                        type="button"
                        onClick={() =>
                          changeChildren(-1)
                        }
                        disabled={children <= 0}
                      >
                        −
                      </button>

                      <span>
                        {children}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          changeChildren(1)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                  {/* ROOMS */}

                  <div className="traveler-row">

                    <div>

                      <strong>
                        Rooms
                      </strong>

                      <small>
                        Number of rooms
                      </small>

                    </div>

                    <div className="counter">

                      <button
                        type="button"
                        onClick={() =>
                          changeRooms(-1)
                        }
                        disabled={rooms <= 1}
                      >
                        −
                      </button>

                      <span>
                        {rooms}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          changeRooms(1)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="traveler-done"
                    onClick={() =>
                      setTravelerOpen(false)
                    }
                  >
                    Done
                  </button>

                </div>

              )}

            </div>

            {/* =================================================
                SEARCH BUTTON
            ================================================= */}

            <button
              type="button"
              className="luxury-search-button"
              onClick={handleSearch}
            >

              <svg viewBox="0 0 24 24">

                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-4-4" />

              </svg>

              <span>
                Search
              </span>

            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default LuxuryHero;

