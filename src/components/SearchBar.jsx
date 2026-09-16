import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const API_URL = "https://backpacker-gateways-2.onrender.com/api/rooms";

const destinations = [
  {
    name: "Kathmandu",
    subtitle: "Bagmati, Nepal",
  },
  {
    name: "Pokhara",
    subtitle: "Gandaki, Nepal",
  },
  {
    name: "Everest Base Camp",
    subtitle: "Khumbu, Nepal",
  },
  {
    name: "Annapurna",
    subtitle: "Gandaki, Nepal",
  },
  {
    name: "Chitwan",
    subtitle: "Terai, Nepal",
  },
  {
    name: "Nagarkot",
    subtitle: "Bagmati, Nepal",
  },
  {
    name: "Lalitpur",
    subtitle: "Bagmati, Nepal",
  },
];

export default function SearchBar({ onResults }) {
  const navigate = useNavigate();

  const searchRef = useRef(null);
  const dateRef = useRef(null);
  const guestRef = useRef(null);

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [guests, setGuests] = useState(1);

  const [activePanel, setActivePanel] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [suggestions, setSuggestions] = useState([]);

  /* ----------------------------------------
     TODAY
  ---------------------------------------- */

  const today = new Date().toISOString().split("T")[0];

  /* ----------------------------------------
     DESTINATION SEARCH
  ---------------------------------------- */

  useEffect(() => {
    const value = destination.trim().toLowerCase();

    if (!value) {
      setSuggestions(destinations);
      return;
    }

    const filtered = destinations.filter(
      (item) =>
        item.name.toLowerCase().includes(value) ||
        item.subtitle.toLowerCase().includes(value)
    );

    setSuggestions(filtered);
  }, [destination]);

  /* ----------------------------------------
     CLOSE PANELS OUTSIDE
  ---------------------------------------- */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setActivePanel(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* ----------------------------------------
     DESTINATION SELECT
  ---------------------------------------- */

  const selectDestination = (name) => {
    setDestination(name);
    setActivePanel(null);

    setTimeout(() => {
      dateRef.current?.focus();
    }, 100);
  };

  /* ----------------------------------------
     DATE HANDLERS
  ---------------------------------------- */

  const handleCheckIn = (value) => {
    setCheckIn(value);

    if (checkOut && value >= checkOut) {
      setCheckOut("");
    }
  };

  const handleCheckOut = (value) => {
    setCheckOut(value);
  };

  /* ----------------------------------------
     GUEST HANDLERS
  ---------------------------------------- */

  const increaseGuests = () => {
    setGuests((current) => current + 1);
  };

  const decreaseGuests = () => {
    setGuests((current) => Math.max(1, current - 1));
  };

  /* ----------------------------------------
     SEARCH
  ---------------------------------------- */

  const handleSearch = async () => {
    setError("");

    if (!destination.trim()) {
      setError("Please choose a destination.");
      setActivePanel("destination");
      return;
    }

    if (!checkIn) {
      setError("Please select your check-in date.");
      setActivePanel("dates");
      return;
    }

    if (!checkOut) {
      setError("Please select your check-out date.");
      setActivePanel("dates");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      setActivePanel("dates");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        destination: destination.trim(),
        checkIn,
        checkOut,
        guests: String(guests),
      });

      const response = await fetch(
        `${API_URL}/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Unable to search rooms.");
      }

      const result = await response.json();

      const rooms = result.data || [];

      /*
        Send search result to parent component.
      */
      if (onResults) {
        onResults(rooms);
      }

      /*
        Also save search information.
        This makes it available after navigation.
      */
      sessionStorage.setItem(
        "roomSearch",
        JSON.stringify({
          destination,
          checkIn,
          checkOut,
          guests,
        })
      );

      sessionStorage.setItem(
        "roomSearchResults",
        JSON.stringify(rooms)
      );

      setActivePanel(null);

      /*
        Navigate to rooms page.
      */
      navigate("/rooms");
    } catch (err) {
      console.error(err);

      /*
        If backend search endpoint is not ready yet,
        show a clear message instead of crashing.
      */
      setError(
        "Search service is not available. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------
     FORMAT DATE
  ---------------------------------------- */

  const formatDate = (date) => {
    if (!date) return "";

    const selectedDate = new Date(`${date}T00:00:00`);

    return selectedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="searchbar-wrapper" ref={searchRef}>
      <div className="searchbar">

        {/* ==================================
            WHERE
        ================================== */}

        <div
          className={`search-item destination-item ${
            activePanel === "destination" ? "active" : ""
          }`}
          onClick={() => setActivePanel("destination")}
        >
          <div className="search-icon">
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </div>

          <div className="search-content">
            <span className="search-label">Where</span>

            <input
              type="text"
              value={destination}
              placeholder="Search destinations"
              onChange={(event) => {
                setDestination(event.target.value);
                setActivePanel("destination");
              }}
              onFocus={() => setActivePanel("destination")}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();

                  if (suggestions.length > 0) {
                    selectDestination(suggestions[0].name);
                  }
                }
              }}
              autoComplete="off"
            />
          </div>
        </div>

        {/* ==================================
            DIVIDER
        ================================== */}

        <div className="search-divider"></div>

        {/* ==================================
            DATES
        ================================== */}

        <div
          className={`search-item dates-item ${
            activePanel === "dates" ? "active" : ""
          }`}
          onClick={() => setActivePanel("dates")}
        >
          <div className="search-icon">
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="17"
                rx="3"
              />
              <path d="M16 2v4M8 2v4M3 9h18" />
            </svg>
          </div>

          <div className="search-content dates-content">
            <span className="search-label">Dates</span>

            <div className="date-display">
              <span className={checkIn ? "selected" : ""}>
                {checkIn
                  ? formatDate(checkIn)
                  : "Check in"}
              </span>

              <span className="date-arrow">→</span>

              <span className={checkOut ? "selected" : ""}>
                {checkOut
                  ? formatDate(checkOut)
                  : "Check out"}
              </span>
            </div>
          </div>
        </div>

        {/* ==================================
            GUESTS
        ================================== */}

        <div className="search-divider"></div>

        <div
          className={`search-item guests-item ${
            activePanel === "guests" ? "active" : ""
          }`}
          onClick={() => setActivePanel("guests")}
        >
          <div className="search-icon">
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="7" r="3" />
              <path d="M3 21v-1a6 6 0 0 1 12 0v1" />
              <path d="M16 4.5a3 3 0 0 1 0 5.8" />
              <path d="M18 13a5 5 0 0 1 3 4.6V21" />
            </svg>
          </div>

          <div className="search-content">
            <span className="search-label">Guests</span>

            <span className="guest-value">
              {guests} {guests === 1 ? "guest" : "guests"}
            </span>
          </div>
        </div>

        {/* ==================================
            SEARCH BUTTON
        ================================== */}

        <button
          type="button"
          className="search-button"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <span className="search-spinner"></span>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <span>Search</span>
            </>
          )}
        </button>
      </div>

      {/* ==================================
          DESTINATION PANEL
      ================================== */}

      {activePanel === "destination" && (
        <div className="search-panel destination-panel">
          <div className="panel-heading">
            <span>Explore destinations</span>
            <small>Where would you like to stay?</small>
          </div>

          {suggestions.length > 0 ? (
            <div className="destination-list">
              {suggestions.map((item) => (
                <button
                  type="button"
                  className="destination-option"
                  key={item.name}
                  onClick={() =>
                    selectDestination(item.name)
                  }
                >
                  <span className="destination-option-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                      />
                    </svg>
                  </span>

                  <span className="destination-option-text">
                    <strong>{item.name}</strong>
                    <small>{item.subtitle}</small>
                  </span>

                  <span className="destination-option-arrow">
                    →
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-destination">
              <strong>No destinations found</strong>
              <span>
                Try Kathmandu, Pokhara or Everest
              </span>
            </div>
          )}
        </div>
      )}

      {/* ==================================
          DATE PANEL
      ================================== */}

      {activePanel === "dates" && (
        <div className="search-panel date-panel">
          <div className="panel-heading">
            <span>Select your dates</span>
            <small>Choose your stay period</small>
          </div>

          <div className="date-input-grid">

            <div className="date-box">
              <label htmlFor="check-in">
                CHECK-IN
              </label>

              <input
                ref={dateRef}
                id="check-in"
                type="date"
                min={today}
                value={checkIn}
                onChange={(event) =>
                  handleCheckIn(event.target.value)
                }
              />
            </div>

            <div className="date-box">
              <label htmlFor="check-out">
                CHECK-OUT
              </label>

              <input
                id="check-out"
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(event) =>
                  handleCheckOut(event.target.value)
                }
              />
            </div>

          </div>

          <div className="date-hint">
            Your check-out date must be after
            your check-in date.
          </div>
        </div>
      )}

      {/* ==================================
          GUEST PANEL
      ================================== */}

      {activePanel === "guests" && (
        <div className="search-panel guest-panel">
          <div className="panel-heading">
            <span>Who's coming?</span>
            <small>Choose the number of guests</small>
          </div>

          <div className="guest-control">

            <div className="guest-description">
              <strong>Guests</strong>
              <span>Adults & children</span>
            </div>

            <div className="guest-counter">

              <button
                type="button"
                onClick={decreaseGuests}
                disabled={guests <= 1}
                aria-label="Decrease guests"
              >
                −
              </button>

              <strong>{guests}</strong>

              <button
                type="button"
                onClick={increaseGuests}
                aria-label="Increase guests"
              >
                +
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ==================================
          ERROR
      ================================== */}

      {error && (
        <div className="search-error">
          <span>!</span>
          {error}
        </div>
      )}
    </div>
  );
}
