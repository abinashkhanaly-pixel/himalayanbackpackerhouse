import { useState } from "react";
import "./Flights.css";

function Flights() {
  const [tripType, setTripType] = useState("roundTrip");

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [nationality, setNationality] = useState("Nepal");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [multiCityFlights, setMultiCityFlights] = useState([
    {
      origin: "",
      destination: "",
      date: "",
    },
    {
      origin: "",
      destination: "",
      date: "",
    },
  ]);

  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const updateMultiCity = (index, field, value) => {
    setMultiCityFlights((current) =>
      current.map((flight, flightIndex) =>
        flightIndex === index
          ? { ...flight, [field]: value }
          : flight
      )
    );
  };

  const addMultiCityFlight = () => {
    setMultiCityFlights((current) => [
      ...current,
      {
        origin: "",
        destination: "",
        date: "",
      },
    ]);
  };

  const removeMultiCityFlight = (index) => {
    if (multiCityFlights.length <= 2) return;

    setMultiCityFlights((current) =>
      current.filter((_, flightIndex) => flightIndex !== index)
    );
  };

  // =========================================================
  // FLIGHT SEARCH VALIDATION + REQUEST OBJECT
  // =========================================================

  const handleSearch = (event) => {
    event.preventDefault();

    // -------------------------------------------------------
    // COMMON VALIDATION
    // -------------------------------------------------------

    if (!nationality) {
      alert("Please select your nationality.");
      return;
    }

    if (adults < 1) {
      alert("At least 1 adult traveller is required.");
      return;
    }

    // -------------------------------------------------------
    // ONE WAY / ROUND TRIP VALIDATION
    // -------------------------------------------------------

    if (tripType !== "multiCity") {
      if (!origin.trim()) {
        alert("Please enter your departure location.");
        return;
      }

      if (!destination.trim()) {
        alert("Please enter your destination.");
        return;
      }

      if (!departure) {
        alert("Please select a departure date.");
        return;
      }

      if (tripType === "roundTrip" && !returnDate) {
        alert("Please select a return date.");
        return;
      }

      if (
        tripType === "roundTrip" &&
        returnDate < departure
      ) {
        alert("Return date cannot be before departure date.");
        return;
      }

      if (
        origin.trim().toLowerCase() ===
        destination.trim().toLowerCase()
      ) {
        alert("Departure and destination cannot be the same.");
        return;
      }
    }

    // -------------------------------------------------------
    // MULTI-CITY VALIDATION
    // -------------------------------------------------------

    if (tripType === "multiCity") {
      if (multiCityFlights.length < 2) {
        alert("At least 2 flights are required for Multi-City.");
        return;
      }

      const invalidFlight = multiCityFlights.some(
        (flight) =>
          !flight.origin.trim() ||
          !flight.destination.trim() ||
          !flight.date
      );

      if (invalidFlight) {
        alert(
          "Please complete From, To and Date for every flight."
        );
        return;
      }

      const sameLocationFlight = multiCityFlights.some(
        (flight) =>
          flight.origin.trim().toLowerCase() ===
          flight.destination.trim().toLowerCase()
      );

      if (sameLocationFlight) {
        alert(
          "Departure and destination cannot be the same."
        );
        return;
      }
    }

    // -------------------------------------------------------
    // CREATE CLEAN SEARCH REQUEST
    // -------------------------------------------------------

    const searchRequest = {
      tripType,

      travellers: {
        adults,
        children,
        total: adults + children,
      },

      nationality,

      ...(tripType !== "multiCity"
        ? {
            route: {
              from: origin.trim(),
              to: destination.trim(),
            },

            departureDate: departure,

            ...(tripType === "roundTrip"
              ? {
                  returnDate,
                }
              : {}),
          }
        : {
            flights: multiCityFlights.map((flight) => ({
              from: flight.origin.trim(),
              to: flight.destination.trim(),
              date: flight.date,
            })),
          }),
    };

    // -------------------------------------------------------
    // TEMPORARY SEARCH OUTPUT
    // -------------------------------------------------------

    console.log(
      "FLIGHT SEARCH REQUEST:",
      searchRequest
    );
  };

  return (
    <main className="flights-page">
      <section className="flights-hero">

        <div className="flights-hero-content">
          <span className="flights-eyebrow">
            FLY ACROSS NEPAL
          </span>

          <h1>
            Your Journey Starts
            <span> in the Sky.</span>
          </h1>

          <p>
            Search flights across Nepal and connect
            easily to your next Himalayan adventure.
          </p>
        </div>

        <div className="flight-search-card">

          <div className="flight-trip-tabs">

            <button
              type="button"
              className={
                tripType === "oneWay"
                  ? "active"
                  : ""
              }
              onClick={() => setTripType("oneWay")}
            >
              One Way
            </button>

            <button
              type="button"
              className={
                tripType === "roundTrip"
                  ? "active"
                  : ""
              }
              onClick={() => setTripType("roundTrip")}
            >
              Round Trip
            </button>

            <button
              type="button"
              className={
                tripType === "multiCity"
                  ? "active"
                  : ""
              }
              onClick={() => setTripType("multiCity")}
            >
              Multi-City
            </button>

          </div>

          <form
            className="flight-search-form"
            onSubmit={handleSearch}
          >

            {tripType !== "multiCity" && (
              <>
                <div className="flight-location-row">

                  <div className="flight-field location-field">
                    <span className="flight-field-icon">
                      ✈
                    </span>

                    <div>
                      <label>FROM</label>

                      <input
                        type="text"
                        value={origin}
                        onChange={(event) =>
                          setOrigin(event.target.value)
                        }
                        placeholder="Origin"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="swap-flight-button"
                    onClick={swapLocations}
                    aria-label="Swap origin and destination"
                  >
                    ⇄
                  </button>

                  <div className="flight-field location-field">
                    <span className="flight-field-icon">
                      📍
                    </span>

                    <div>
                      <label>TO</label>

                      <input
                        type="text"
                        value={destination}
                        onChange={(event) =>
                          setDestination(event.target.value)
                        }
                        placeholder="Destination"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                </div>

                <div className="flight-details-row">

                  <div className="flight-field">
                    <span className="flight-field-icon">
                      📅
                    </span>

                    <div>
                      <label>DEPARTURE</label>

                      <input
                        type="date"
                        value={departure}
                        onChange={(event) =>
                          setDeparture(event.target.value)
                        }
                      />
                    </div>
                  </div>

                  {tripType === "roundTrip" && (
                    <div className="flight-field">
                      <span className="flight-field-icon">
                        📅
                      </span>

                      <div>
                        <label>RETURN</label>

                        <input
                          type="date"
                          value={returnDate}
                          onChange={(event) =>
                            setReturnDate(event.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="flight-field">
                    <span className="flight-field-icon">
                      🌐
                    </span>

                    <div>
                      <label>NATIONALITY</label>

                      <select
                        value={nationality}
                        onChange={(event) =>
                          setNationality(event.target.value)
                        }
                      >
                        <option value="Nepal">
                          Nepal
                        </option>

                        <option value="United States">
                          United States
                        </option>

                        <option value="United Kingdom">
                          United Kingdom
                        </option>

                        <option value="Australia">
                          Australia
                        </option>

                        <option value="Germany">
                          Germany
                        </option>

                        <option value="France">
                          France
                        </option>

                        <option value="India">
                          India
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="flight-field traveller-field">
                    <span className="flight-field-icon">
                      👤
                    </span>

                    <div>
                      <label>TRAVELLERS</label>

                      <div className="traveller-summary">
                        {adults} Adult
                        {adults !== 1 ? "s" : ""}
                        {" · "}
                        {children} Child
                        {children !== 1 ? "ren" : ""}
                      </div>
                    </div>

                    <div className="traveller-controls">

                      <button
                        type="button"
                        onClick={() =>
                          setAdults((value) =>
                            Math.max(1, value - 1)
                          )
                        }
                      >
                        -
                      </button>

                      <strong>{adults}</strong>

                      <button
                        type="button"
                        onClick={() =>
                          setAdults((value) =>
                            value + 1
                          )
                        }
                      >
                        +
                      </button>

                    </div>
                  </div>

                </div>

                <div className="children-row">

                  <span>
                    Children
                  </span>

                  <div className="children-controls">

                    <button
                      type="button"
                      onClick={() =>
                        setChildren((value) =>
                          Math.max(0, value - 1)
                        )
                      }
                    >
                      -
                    </button>

                    <strong>{children}</strong>

                    <button
                      type="button"
                      onClick={() =>
                        setChildren((value) =>
                          value + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>
              </>
            )}

            {tripType === "multiCity" && (
              <div className="multi-city-section">

                {multiCityFlights.map(
                  (flight, index) => (
                    <div
                      className="multi-city-row"
                      key={index}
                    >

                      <div className="multi-city-number">
                        {index + 1}
                      </div>

                      <div className="flight-field">
                        <div>
                          <label>FROM</label>

                          <input
                            type="text"
                            value={flight.origin}
                            onChange={(event) =>
                              updateMultiCity(
                                index,
                                "origin",
                                event.target.value
                              )
                            }
                            placeholder="Origin"
                          />
                        </div>
                      </div>

                      <div className="flight-field">
                        <div>
                          <label>TO</label>

                          <input
                            type="text"
                            value={flight.destination}
                            onChange={(event) =>
                              updateMultiCity(
                                index,
                                "destination",
                                event.target.value
                              )
                            }
                            placeholder="Destination"
                          />
                        </div>
                      </div>

                      <div className="flight-field">
                        <div>
                          <label>DATE</label>

                          <input
                            type="date"
                            value={flight.date}
                            onChange={(event) =>
                              updateMultiCity(
                                index,
                                "date",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {multiCityFlights.length > 2 && (
                        <button
                          type="button"
                          className="remove-city-button"
                          onClick={() =>
                            removeMultiCityFlight(index)
                          }
                        >
                          ×
                        </button>
                      )}

                    </div>
                  )
                )}

                <button
                  type="button"
                  className="add-city-button"
                  onClick={addMultiCityFlight}
                >
                  + Add another flight
                </button>

                <div className="multi-city-bottom">

                  <div className="multi-city-travellers">
                    <label>TRAVELLERS</label>

                    <strong>
                      {adults} Adult
                      {adults !== 1 ? "s" : ""}
                      {" · "}
                      {children} Child
                      {children !== 1 ? "ren" : ""}
                    </strong>
                  </div>

                  <div className="multi-city-nationality">
                    <label>NATIONALITY</label>

                    <select
                      value={nationality}
                      onChange={(event) =>
                        setNationality(event.target.value)
                      }
                    >
                      <option value="Nepal">
                        Nepal
                      </option>

                      <option value="United States">
                        United States
                      </option>

                      <option value="United Kingdom">
                        United Kingdom
                      </option>

                      <option value="Australia">
                        Australia
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                </div>

              </div>
            )}

            <button
              type="submit"
              className="flight-search-button"
            >
              <span>⌕</span>
              Search Flights
            </button>

          </form>

        </div>
      </section>

      <section className="popular-flights">

        <div className="popular-flights-heading">
          <div>
            <span>EXPLORE NEPAL</span>

            <h2>
              Popular Flight Routes
            </h2>

            <p>
              Connect Nepal's cities, mountain gateways
              and trekking destinations.
            </p>
          </div>
        </div>

        <div className="flight-route-grid">

          <div className="flight-route-card">
            <span>✈</span>

            <div>
              <strong>
                Kathmandu → Pokhara
              </strong>

              <small>
                KTM → PKR
              </small>
            </div>
          </div>

          <div className="flight-route-card">
            <span>🏔</span>

            <div>
              <strong>
                Kathmandu → Lukla
              </strong>

              <small>
                KTM → LUA
              </small>
            </div>
          </div>

          <div className="flight-route-card">
            <span>🏔</span>

            <div>
              <strong>
                Ramechhap → Lukla
              </strong>

              <small>
                RHP → LUA
              </small>
            </div>
          </div>

          <div className="flight-route-card">
            <span>🌿</span>

            <div>
              <strong>
                Kathmandu → Bharatpur
              </strong>

              <small>
                KTM → BHR
              </small>
            </div>
          </div>

        </div>

      </section>
    </main>
  );
}

export default Flights;