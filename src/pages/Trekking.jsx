
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Trekking.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

function Trekking() {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState(null);

  const [trekkingPackages, setTrekkingPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load trekking packages from MongoDB
  useEffect(() => {
    const fetchTreks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/treks`);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to load trekking packages"
          );
        }

        const trekData =
          result?.data?.treks ||
          result?.data ||
          result?.treks ||
          [];

        setTrekkingPackages(
          Array.isArray(trekData) ? trekData : []
        );
      } catch (err) {
        console.error("Fetch trekking packages error:", err);

        setError(
          err.message ||
            "Failed to load trekking packages."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTreks();
  }, []);

  // Published trekking packages only
  const publishedTreks = trekkingPackages.filter(
    (trek) => trek.published !== false
  );

  // Randomly select 6 treks whenever page loads
  const featuredTreks = useMemo(() => {
    const shuffled = [...publishedTreks].sort(
      () => Math.random() - 0.5
    );

    return shuffled.slice(0, 6);
  }, [trekkingPackages]);

  const openBooking = (trek) => {
    setSelectedTrek(trek);
    setShowBooking(true);
  };

  const closeBooking = () => {
    setShowBooking(false);
    setSelectedTrek(null);
  };

  return (
    <div className="trekking-page">

      {/* HERO */}
      <section className="trekking-hero">
        <div className="trekking-hero-overlay">
          <p className="trekking-eyebrow">
            EXPLORE NEPAL
          </p>

          <h1>
            Trekking in the Himalayas
          </h1>

          <p>
            Discover Nepal's iconic mountain trails, Himalayan villages,
            breathtaking landscapes and unforgettable trekking experiences.
          </p>
        </div>
      </section>

      {/* TREKKING LIST */}
      <section className="trekking-section">

        <div className="trekking-section-header">
          <div>
            <p className="trekking-small-title">
              BACKPACKER GATEWAYS
            </p>

            <h2>
              Featured Trekking Packages
            </h2>

            <p>
              Explore our handpicked Himalayan trekking experiences.
            </p>
          </div>

          <div className="trekking-count">
            {publishedTreks.length} Treks Available
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            Loading trekking packages...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "red",
            }}
          >
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          publishedTreks.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >
              No trekking packages are currently available.
            </div>
          )}

        {/* TREKKING GRID */}
        {!loading &&
          !error &&
          featuredTreks.length > 0 && (
            <div className="trekking-grid">

              {featuredTreks.map((trek) => (
                <article
                  className="trekking-card"
                  key={trek._id || trek.id}
                >

                  {/* IMAGE */}
                  <div className="trekking-card-image">

                    <img
                      src={trek.mainImage}
                      alt={
                        trek.seo?.imageAlt ||
                        `${trek.name} in Nepal`
                      }
                    />

                    <div className="trekking-price">
                      From{" "}
                      {trek.currency === "USD"
                        ? "$"
                        : `${trek.currency || ""} `}
                      {trek.discountPrice ||
                        trek.price}
                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="trekking-card-content">

                    <h3>
                      {trek.name}
                    </h3>

                    <div className="trekking-meta">

                      <span>
                        🗓 {trek.duration}
                      </span>

                      <span>
                        ⛰ {trek.difficulty}
                      </span>

                    </div>

                    <div className="trekking-altitude">
                      Max Altitude:{" "}
                      {trek.maxAltitude}
                    </div>

                    <p>
                      {trek.description}
                    </p>

                    {/* HIGHLIGHTS */}
                    {trek.highlights?.length > 0 && (
                      <ul className="trekking-highlights">
                        {trek.highlights
                          .slice(0, 3)
                          .map(
                            (highlight, index) => (
                              <li key={index}>
                                {highlight}
                              </li>
                            )
                          )}
                      </ul>
                    )}

                    {/* BUTTONS */}
                    <div className="trekking-card-buttons">

                      <Link
                        to={`/trekking/${trek.slug}`}
                        className="trekking-details-btn"
                      >
                        View Details
                      </Link>

                      <button
                        className="trekking-book-btn"
                        onClick={() =>
                          openBooking(trek)
                        }
                      >
                        Book Your Trek
                      </button>

                    </div>

                  </div>
                </article>
              ))}

            </div>
          )}

        {/* VIEW ALL / REFRESH */}
        {!loading &&
          publishedTreks.length > 6 && (
            <div className="trekking-view-all">
              <button
                onClick={() =>
                  window.location.reload()
                }
                className="trekking-refresh-btn"
              >
                Explore More Treks ↻
              </button>
            </div>
          )}

      </section>

      {/* BOOKING MODAL */}
      {showBooking && selectedTrek && (
        <div
          className="trekking-modal-backdrop"
          onClick={closeBooking}
        >

          <div
            className="trekking-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="trekking-modal-close"
              onClick={closeBooking}
            >
              ×
            </button>

            <h2>
              Book Your Trek
            </h2>

            <p className="trekking-selected-name">
              {selectedTrek.name}
            </p>

            <form
              onSubmit={(e) => {
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

Trek: ${selectedTrek.name}
Preferred Date: ${date}
Travellers: ${travellers}
Name: ${name}
Phone: ${phone}`;

                window.open(
                  `https://wa.me/9779709914688?text=${encodeURIComponent(
                    message
                  )}`,
                  "_blank"
                );
              }}
            >

              <label>
                Preferred Date

                <input
                  type="date"
                  name="date"
                  required
                />
              </label>

              <label>
                Travellers

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
                  placeholder="Your full name"
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
                className="trekking-whatsapp-btn"
              >
                Enquire on WhatsApp
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Trekking;
