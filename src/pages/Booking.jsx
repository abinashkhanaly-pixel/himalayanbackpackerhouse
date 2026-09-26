import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoom } from "../services/roomApi";

const WHATSAPP_NUMBER =
  import.meta.env.VITE_BOOKING_WHATSAPP || "";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const roomId = searchParams.get("room");

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        setRoomError("No room selected.");
        setLoadingRoom(false);
        return;
      }

      try {
        setLoadingRoom(true);
        setRoomError("");

        const result = await getRoom(roomId);

        if (result?.data) {
          setRoom(result.data);
        } else {
          setRoomError("Room not found.");
        }
      } catch (err) {
        console.error("Room loading error:", err);
        setRoomError("Unable to load the selected room.");
      } finally {
        setLoadingRoom(false);
      }
    };

    loadRoom();
  }, [roomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const getNights = () => {
    if (!form.checkIn || !form.checkOut) return 0;

    const start = new Date(form.checkIn);
    const end = new Date(form.checkOut);

    const difference = end.getTime() - start.getTime();

    return Math.max(
      0,
      Math.ceil(difference / (1000 * 60 * 60 * 24))
    );
  };

  const getTotal = () => {
    const nights = getNights();

    return Number(room?.price || 0) * nights;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const value = new Date(`${date}T00:00:00`);

    return value.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const createWhatsAppMessage = (bookingId = "") => {
    const nights = getNights();
    const total = getTotal();

    return [
      "Hello Backpacker Gateways,",
      "",
      "I would like to request a hotel booking.",
      "",
      `Hotel: ${room?.name || "Selected Hotel"}`,
      `Guest: ${form.name}`,
      `WhatsApp: ${form.phone}`,
      `Guests: ${form.guests}`,
      `Check-in: ${form.checkIn}`,
      `Check-out: ${form.checkOut}`,
      `Nights: ${nights}`,
      `Estimated Total: NPR ${total.toLocaleString("en-NP")}`,
      bookingId ? `Booking ID: ${bookingId}` : "",
      "",
      "Payment: Pay at Hotel",
      "",
      "Please confirm availability.",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const openWhatsApp = (bookingId = "") => {
    if (!WHATSAPP_NUMBER) {
      alert(
        "WhatsApp booking number is not configured yet."
      );
      return;
    }

    const message = createWhatsAppMessage(bookingId);

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!room) {
      setError("Room information is missing.");
      return;
    }

    /* =========================
       GUEST VALIDATION
    ========================== */

    const guestCount = Number(form.guests);

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > 20
    ) {
      setError(
        "Please enter a valid number of guests (1–20)."
      );
      return;
    }

    if (
      form.checkIn &&
      form.checkOut &&
      new Date(form.checkOut) <=
        new Date(form.checkIn)
    ) {
      setError(
        "Check-out date must be after check-in date."
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const response = await fetch(
        "https://backpacker-gateways-2.onrender.com/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room: room._id,
            guestName: form.name,
            email: form.email,
            phone: form.phone,
            guests: guestCount,
            checkIn: form.checkIn,
            checkOut: form.checkOut,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Booking request failed."
        );
      }

      const bookingId =
        result?.data?._id ||
        result?.booking?._id ||
        result?._id ||
        result?.data?.bookingId ||
        "";

      setSuccess({
        bookingId,
        name: form.name,
        phone: form.phone,
        guests: guestCount,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        nights: getNights(),
        total: getTotal(),
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        checkIn: "",
        checkOut: "",
        guests: 1,
      });
    } catch (err) {
      console.error("Booking error:", err);

      setError(
        err.message ||
          "Unable to submit booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingRoom) {
    return (
      <div className="booking-loading">
        <div className="booking-loader-ring" />

        <div>
          <strong>Preparing your stay</strong>
          <p>Loading your selected property...</p>
        </div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="booking-error">
        <div className="booking-error-card">
          <div className="booking-error-icon">!</div>

          <span className="error-eyebrow">
            BOOKING
          </span>

          <h2>No room selected</h2>

          <p>
            {roomError ||
              "Please select a room before booking."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/rooms")}
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  const firstImage =
    room.images?.[0] ||
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80";

  const roomPrice = Number(room.price || 0);

  return (
    <div className="booking-page">
      <div className="booking-shell">

        {/* HEADER */}
        <header className="booking-header">
          <button
            type="button"
            className="booking-back"
            onClick={() => navigate(-1)}
          >
            <span className="back-arrow">←</span>
            <span>Back</span>
          </button>

          <div className="booking-brand">
            <span className="booking-brand-mark">
              BG
            </span>

            <div>
              <strong>Backpacker Gateways</strong>
              <span>Stay · Trek · Connect</span>
            </div>
          </div>
        </header>

        {/* =========================
            SUCCESS / CONFIRMATION
        ========================== */}

        {success ? (
          <main className="success-page">

            <section className="confirmation-card">

              {/* Status */}
              <div className="confirmation-status">
                <div className="status-check">
                  ✓
                </div>

                <div>
                  <span className="status-label">
                    REQUEST RECEIVED
                  </span>

                  <p>
                    Your stay request has been
                    successfully submitted.
                  </p>
                </div>
              </div>

              <div className="confirmation-heading">
                <h1>
                  Your stay request is in.
                </h1>

                <p>
                  We've received your booking details.
                  Our team will check availability with
                  the property and contact you through
                  WhatsApp to confirm your stay.
                </p>
              </div>

              {/* Booking reference */}
              {success.bookingId && (
                <div className="reference-bar">
                  <div>
                    <span>BOOKING REFERENCE</span>
                    <strong>
                      {success.bookingId}
                    </strong>
                  </div>

                  <span className="reference-status">
                    REQUESTED
                  </span>
                </div>
              )}

              {/* Property */}
              <div className="confirmation-property">

                <img
                  src={firstImage}
                  alt={room.name || "Selected property"}
                />

                <div className="property-copy">
                  <span>SELECTED PROPERTY</span>

                  <h2>{room.name}</h2>

                  <p>
                    <span className="location-dot">
                      ●
                    </span>
                    Kathmandu, Nepal
                  </p>
                </div>

                <div className="property-price">
                  <span>FROM</span>

                  <strong>
                    NPR{" "}
                    {roomPrice.toLocaleString(
                      "en-NP"
                    )}
                  </strong>

                  <small>per night</small>
                </div>

              </div>

              {/* Stay summary */}
              <div className="stay-summary">

                <div className="summary-heading">
                  <span className="summary-number">
                    01
                  </span>

                  <div>
                    <h3>Your stay</h3>
                    <p>
                      Booking details you've submitted
                    </p>
                  </div>
                </div>

                <div className="stay-grid">

                  <div className="stay-item">
                    <span>CHECK-IN</span>
                    <strong>
                      {formatDate(success.checkIn)}
                    </strong>
                  </div>

                  <div className="stay-item">
                    <span>CHECK-OUT</span>
                    <strong>
                      {formatDate(success.checkOut)}
                    </strong>
                  </div>

                  <div className="stay-item">
                    <span>GUESTS</span>
                    <strong>
                      {success.guests}{" "}
                      {success.guests === 1
                        ? "Guest"
                        : "Guests"}
                    </strong>
                  </div>

                  <div className="stay-item">
                    <span>DURATION</span>
                    <strong>
                      {success.nights}{" "}
                      {success.nights === 1
                        ? "Night"
                        : "Nights"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* Guest */}
              <div className="guest-summary">

                <div className="summary-heading">
                  <span className="summary-number">
                    02
                  </span>

                  <div>
                    <h3>Guest information</h3>
                    <p>
                      Contact details for this request
                    </p>
                  </div>
                </div>

                <div className="guest-grid">

                  <div>
                    <span>GUEST NAME</span>
                    <strong>{success.name}</strong>
                  </div>

                  <div>
                    <span>WHATSAPP</span>
                    <strong>{success.phone}</strong>
                  </div>

                </div>

              </div>

              {/* Total */}
              <div className="confirmation-total">

                <div>
                  <span>ESTIMATED STAY TOTAL</span>

                  <strong>
                    NPR{" "}
                    {Number(
                      success.total || 0
                    ).toLocaleString("en-NP")}
                  </strong>
                </div>

                <div className="total-note">
                  <span>RATE BASIS</span>

                  <p>
                    NPR{" "}
                    {roomPrice.toLocaleString(
                      "en-NP"
                    )}{" "}
                    × {success.nights}{" "}
                    {success.nights === 1
                      ? "night"
                      : "nights"}
                  </p>
                </div>

              </div>

              {/* Payment */}
              <div className="payment-card">

                <div className="payment-check">
                  ✓
                </div>

                <div>
                  <strong>
                    Pay at the hotel
                  </strong>

                  <p>
                    No online payment is required for
                    this booking request. Payment can be
                    made directly at the property after
                    availability is confirmed.
                  </p>
                </div>

              </div>

              {/* Next step */}
              <div className="next-step-card">

                <div className="next-step-icon">
                  →
                </div>

                <div>
                  <span>NEXT STEP</span>

                  <strong>
                    Continue on WhatsApp
                  </strong>

                  <p>
                    Send your booking reference to our
                    team for faster confirmation.
                  </p>
                </div>

              </div>

              {/* Actions */}
              <div className="confirmation-actions">

                <button
                  type="button"
                  className="whatsapp-button"
                  onClick={() =>
                    openWhatsApp(
                      success.bookingId
                    )
                  }
                >
                  <span className="whatsapp-symbol">
                    ◉
                  </span>

                  <span>
                    Continue on WhatsApp
                  </span>

                  <span className="action-arrow">
                    ↗
                  </span>
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("/rooms")}
                >
                  Browse More Stays
                </button>

              </div>

              <div className="confirmation-footer">
                <span>
                  ✓ Request securely submitted
                </span>

                <span>
                  Backpacker Gateways
                </span>
              </div>

            </section>

          </main>
        ) : (

          /* =========================
             BOOKING FORM
          ========================== */

          <main className="booking-layout">

            <section className="booking-form-card">

              <div className="booking-eyebrow">
                YOUR STAY
              </div>

              <h1 className="booking-title">
                Reserve Your Stay
              </h1>

              <p className="booking-description">
                Share your details and we'll check
                availability with the property.
              </p>

              {error && (
                <div className="booking-message">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* DETAILS */}
                <div className="form-section">

                  <div className="form-section-heading">
                    <span className="form-step">
                      01
                    </span>

                    <div>
                      <h2>Your details</h2>

                      <p>
                        How can we reach you?
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">

                    <div className="form-group form-full">
                      <label htmlFor="name">
                        Full Name
                      </label>

                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="form-group">

                      <label htmlFor="phone">
                        WhatsApp Number
                      </label>

                      <div className="phone-input">
                        <span>+977</span>

                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          placeholder="98XXXXXXXX"
                          value={form.phone.replace(
                            /^\+977\s?/,
                            ""
                          )}
                          onChange={(e) =>
                            handleChange({
                              target: {
                                name: "phone",
                                value:
                                  e.target.value,
                              },
                            })
                          }
                          autoComplete="tel"
                          required
                        />
                      </div>

                      <small>
                        We'll use WhatsApp to confirm
                        your stay.
                      </small>

                    </div>

                    <div className="form-group">

                      <label htmlFor="email">
                        Email Address
                        <em>Optional</em>
                      </label>

                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                      />

                    </div>

                  </div>
                </div>

                {/* STAY */}
                <div className="form-section">

                  <div className="form-section-heading">
                    <span className="form-step">
                      02
                    </span>

                    <div>
                      <h2>Your stay</h2>

                      <p>
                        When are you travelling?
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">

                    {/* GUESTS - UPDATED */}
                    <div className="form-group">

                      <label htmlFor="guests">
                        Guests
                      </label>

                      <input
                        id="guests"
                        type="number"
                        name="guests"
                        min="1"
                        max="20"
                        step="1"
                        value={form.guests}
                        onChange={handleChange}
                        placeholder="Number of guests"
                        inputMode="numeric"
                        required
                      />

                      <small>
                        Enter the total number of guests
                        travelling.
                      </small>

                    </div>

                    <div className="form-group">

                      <label htmlFor="checkIn">
                        Check-in
                      </label>

                      <input
                        id="checkIn"
                        type="date"
                        name="checkIn"
                        value={form.checkIn}
                        onChange={handleChange}
                        required
                      />

                    </div>

                    <div className="form-group">

                      <label htmlFor="checkOut">
                        Check-out
                      </label>

                      <input
                        id="checkOut"
                        type="date"
                        name="checkOut"
                        value={form.checkOut}
                        onChange={handleChange}
                        required
                      />

                    </div>

                  </div>
                </div>

                {/* FOOTER */}
                <div className="request-footer">

                  <div className="request-note">

                    <span>✓</span>

                    <p>
                      <strong>
                        Pay at hotel
                      </strong>

                      <br />

                      No online payment required.
                    </p>

                  </div>

                  <button
                    type="submit"
                    className="submit-booking"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="button-spinner" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        Request Booking
                        <span>→</span>
                      </>
                    )}
                  </button>

                </div>

              </form>
            </section>

            {/* PROPERTY SUMMARY */}
            <aside className="booking-summary">

              <div className="summary-image-wrap">

                <img
                  className="summary-image"
                  src={firstImage}
                  alt={
                    room.name ||
                    "Selected room"
                  }
                />

                {room.available && (
                  <span className="summary-available">
                    ● Available
                  </span>
                )}

              </div>

              <div className="summary-content">

                <span className="summary-label">
                  SELECTED PROPERTY
                </span>

                <h2 className="summary-title">
                  {room.name}
                </h2>

                <p className="summary-location">
                  Kathmandu, Nepal
                </p>

                <div className="summary-divider" />

                <div className="summary-price-row">

                  <div>
                    <span>From</span>

                    <strong>
                      NPR{" "}
                      {roomPrice.toLocaleString(
                        "en-NP"
                      )}
                    </strong>
                  </div>

                  <small>
                    per night
                  </small>

                </div>

                <div className="summary-facts">

                  <div>
                    <span>GUESTS</span>

                    <strong>
                      Up to{" "}
                      {room.capacity || 1}
                    </strong>
                  </div>

                  <div>
                    <span>BED</span>

                    <strong>
                      {room.beds ||
                        "Standard Bed"}
                    </strong>
                  </div>

                </div>

                <div className="summary-policy">

                  <span>✓</span>

                  <div>
                    <strong>
                      Simple booking
                    </strong>

                    <p>
                      Request now and pay directly
                      at the hotel.
                    </p>
                  </div>

                </div>

              </div>

            </aside>

          </main>
        )}

        <footer className="booking-footer">
          <span>
            © Backpacker Gateways
          </span>

          <span>
            Explore · Stay · Trek · Connect
          </span>
        </footer>

      </div>

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .booking-page {
          min-height: 100vh;
          padding: 0 20px 40px;
          background:
            linear-gradient(
              180deg,
              #f8fafc 0%,
              #f4f6f8 100%
            );
          color: #172033;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .booking-shell {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        /* HEADER */

        .booking-header {
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 38px;
          border-bottom: 1px solid #e4e8ee;
        }

        .booking-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border: 0;
          background: transparent;
          color: #475467;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .booking-back:hover {
          color: #0b3d91;
        }

        .back-arrow {
          font-size: 18px;
          line-height: 1;
        }

        .booking-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .booking-brand-mark {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #0b3d91;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .5px;
        }

        .booking-brand div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .booking-brand strong {
          color: #172033;
          font-size: 13px;
          font-weight: 800;
        }

        .booking-brand div span {
          color: #98a2b3;
          font-size: 9px;
          letter-spacing: .4px;
        }

        /* FORM */

        .booking-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            370px;
          gap: 28px;
          align-items: start;
        }

        .booking-form-card,
        .booking-summary,
        .confirmation-card {
          border: 1px solid #e1e6ed;
          border-radius: 18px;
          background: #fff;
          box-shadow:
            0 12px 35px
            rgba(16, 24, 40, .055);
        }

        .booking-form-card {
          padding: 38px;
        }

        .booking-eyebrow,
        .summary-label {
          color: #b7863b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .booking-title {
          margin: 9px 0 10px;
          color: #172033;
          font-family:
            Manrope,
            Inter,
            sans-serif;
          font-size: clamp(
            34px,
            4vw,
            48px
          );
          line-height: 1.08;
          letter-spacing: -1.8px;
          font-weight: 800;
        }

        .booking-description {
          max-width: 560px;
          margin: 0 0 30px;
          color: #667085;
          font-size: 13px;
          line-height: 1.7;
        }

        .form-section {
          padding: 25px 0;
          border-top: 1px solid #eaecf0;
        }

        .form-section-heading {
          display: flex;
          gap: 13px;
          margin-bottom: 20px;
        }

        .form-step {
          width: 32px;
          height: 32px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #eef5ff;
          color: #1668e3;
          font-size: 10px;
          font-weight: 800;
        }

        .form-section-heading h2 {
          margin: 0 0 3px;
          color: #1d2939;
          font-family:
            Manrope,
            Inter,
            sans-serif;
          font-size: 16px;
          font-weight: 700;
        }

        .form-section-heading p {
          margin: 0;
          color: #98a2b3;
          font-size: 11px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-full {
          grid-column: 1 / -1;
        }

        .form-group {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #344054;
          font-size: 11px;
          font-weight: 700;
        }

        .form-group label em {
          color: #98a2b3;
          font-size: 9px;
          font-style: normal;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          min-height: 48px;
          padding: 0 14px;
          border: 1px solid #d8dee7;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #1d2939;
          font: inherit;
          font-size: 13px;
          font-weight: 500;
          transition:
            border-color .2s,
            box-shadow .2s;
        }

        .form-group input::placeholder {
          color: #98a2b3;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #1668e3;
          box-shadow:
            0 0 0 3px
            rgba(22, 104, 227, .10);
        }

        .form-group small {
          color: #98a2b3;
          font-size: 10px;
          line-height: 1.45;
        }

        .phone-input {
          min-height: 48px;
          display: flex;
          align-items: center;
          overflow: hidden;
          border: 1px solid #d8dee7;
          border-radius: 10px;
          background: #fff;
          transition:
            border-color .2s,
            box-shadow .2s;
        }

        .phone-input:focus-within {
          border-color: #1668e3;
          box-shadow:
            0 0 0 3px
            rgba(22, 104, 227, .10);
        }

        .phone-input > span {
          height: 48px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          border-right: 1px solid #e4e7ec;
          background: #f8fafc;
          color: #344054;
          font-size: 12px;
          font-weight: 700;
        }

        .phone-input input {
          min-height: 46px;
          border: 0 !important;
          box-shadow: none !important;
          border-radius: 0;
        }

        .request-footer {
          margin-top: 8px;
          padding-top: 24px;
          border-top: 1px solid #eaecf0;
        }

        .request-note {
          display: flex;
          gap: 10px;
          margin-bottom: 17px;
        }

        .request-note > span {
          width: 20px;
          height: 20px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ecfdf3;
          color: #087443;
          font-size: 10px;
          font-weight: 800;
        }

        .request-note p {
          margin: 0;
          color: #667085;
          font-size: 11px;
          line-height: 1.5;
        }

        .request-note strong {
          color: #344054;
        }

        .submit-booking {
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 0;
          border-radius: 10px;
          background: #0b3d91;
          color: #fff;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform .2s,
            background .2s;
        }

        .submit-booking:hover:not(:disabled) {
          background: #092f70;
          transform: translateY(-1px);
        }

        .submit-booking:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid
            rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation:
            bookingSpin .7s linear infinite;
        }

        /* SUMMARY */

        .booking-summary {
          position: sticky;
          top: 22px;
          overflow: hidden;
        }

        .summary-image-wrap {
          position: relative;
        }

        .summary-image {
          width: 100%;
          height: 225px;
          display: block;
          object-fit: cover;
        }

        .summary-available {
          position: absolute;
          left: 14px;
          bottom: 14px;
          padding: 7px 10px;
          border-radius: 7px;
          background:
            rgba(255,255,255,.95);
          color: #087443;
          font-size: 10px;
          font-weight: 700;
          box-shadow:
            0 3px 12px
            rgba(0,0,0,.08);
        }

        .summary-content {
          padding: 24px;
        }

        .summary-title {
          margin: 7px 0 4px;
          color: #172033;
          font-family:
            Manrope,
            Inter,
            sans-serif;
          font-size: 21px;
          line-height: 1.25;
          font-weight: 800;
        }

        .summary-location {
          margin: 0;
          color: #667085;
          font-size: 11px;
        }

        .summary-divider {
          height: 1px;
          margin: 20px 0;
          background: #eaecf0;
        }

        .summary-price-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .summary-price-row > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .summary-price-row span {
          color: #98a2b3;
          font-size: 10px;
        }

        .summary-price-row strong {
          color: #0b3d91;
          font-size: 23px;
          font-weight: 800;
        }

        .summary-price-row small {
          padding-bottom: 3px;
          color: #667085;
          font-size: 10px;
        }

        .summary-facts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }

        .summary-facts > div {
          padding: 12px;
          border: 1px solid #eaecf0;
          border-radius: 9px;
          background: #fafbfc;
        }

        .summary-facts span {
          display: block;
          margin-bottom: 4px;
          color: #98a2b3;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .summary-facts strong {
          display: block;
          color: #344054;
          font-size: 11px;
          line-height: 1.4;
        }

        .summary-policy {
          display: flex;
          gap: 10px;
          margin-top: 18px;
          padding: 14px;
          border-radius: 10px;
          background: #f7faf8;
        }

        .summary-policy > span {
          color: #087443;
          font-weight: 800;
        }

        .summary-policy strong {
          color: #344054;
          font-size: 11px;
        }

        .summary-policy p {
          margin: 3px 0 0;
          color: #667085;
          font-size: 10px;
          line-height: 1.5;
        }

        /* ERROR */

        .booking-message {
          display: flex;
          gap: 9px;
          margin-bottom: 20px;
          padding: 13px 14px;
          border: 1px solid #fecdca;
          border-radius: 10px;
          background: #fef3f2;
          color: #b42318;
        }

        .booking-message span {
          font-weight: 800;
        }

        .booking-message p {
          margin: 0;
          font-size: 12px;
        }

        /* =========================
           CONFIRMATION
        ========================== */

        .success-page {
          display: flex;
          justify-content: center;
        }

        .confirmation-card {
          width: 100%;
          max-width: 820px;
          padding: 40px;
        }

        .confirmation-status {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 25px;
        }

        .status-check {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border: 5px solid #f0faf4;
          border-radius: 50%;
          background: #087443;
          color: #fff;
          font-size: 18px;
          font-weight: 800;
        }

        .status-label {
          display: block;
          margin-bottom: 3px;
          color: #087443;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.6px;
        }

        .confirmation-status p {
          margin: 0;
          color: #667085;
          font-size: 11px;
        }

        .confirmation-heading {
          padding-bottom: 26px;
        }

        .confirmation-heading h1 {
          margin: 0 0 10px;
          color: #172033;
          font-family:
            Manrope,
            Inter,
            sans-serif;
          font-size: clamp(
            32px,
            4vw,
            43px
          );
          line-height: 1.12;
          letter-spacing: -1.5px;
          font-weight: 800;
        }

        .confirmation-heading p {
          max-width: 650px;
          margin: 0;
          color: #667085;
          font-size: 13px;
          line-height: 1.7;
        }

        /* REFERENCE */

        .reference-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 16px;
          padding: 13px 15px;
          border: 1px solid #e4e7ec;
          border-radius: 10px;
          background: #f8fafc;
        }

        .reference-bar > div {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reference-bar span:first-child {
          color: #98a2b3;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .reference-bar strong {
          color: #344054;
          font-size: 11px;
          font-weight: 800;
          word-break: break-all;
        }

        .reference-status {
          padding: 5px 8px;
          border-radius: 6px;
          background: #fff7e8;
          color: #9a671f;
          font-size: 8px !important;
          font-weight: 800;
          letter-spacing: .8px;
        }

        /* PROPERTY */

        .confirmation-property {
          display: grid;
          grid-template-columns:
            92px
            minmax(0, 1fr)
            auto;
          gap: 15px;
          align-items: center;
          padding: 13px;
          border: 1px solid #e2e6ec;
          border-radius: 13px;
          background: #fafbfc;
        }

        .confirmation-property img {
          width: 92px;
          height: 76px;
          display: block;
          object-fit: cover;
          border-radius: 9px;
        }

        .property-copy {
          min-width: 0;
        }

        .property-copy > span {
          color: #98a2b3;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.1px;
        }

        .property-copy h2 {
          overflow: hidden;
          margin: 4px 0 4px;
          color: #172033;
          font-family:
            Manrope,
            Inter,
            sans-serif;
          font-size: 17px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .property-copy p {
          margin: 0;
          color: #667085;
          font-size: 10px;
        }

        .location-dot {
          margin-right: 4px;
          color: #b7863b;
          font-size: 8px;
        }

        .property-price {
          min-width: 105px;
          padding-left: 15px;
          border-left: 1px solid #e4e7ec;
          text-align: right;
        }

        .property-price span {
          display: block;
          color: #98a2b3;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .property-price strong {
          display: block;
          margin-top: 3px;
          color: #0b3d91;
          font-size: 15px;
          font-weight: 800;
        }

        .property-price small {
          color: #98a2b3;
          font-size: 9px;
        }

        /* SUMMARY HEADINGS */

        .stay-summary,
        .guest-summary {
          margin-top: 25px;
          padding-top: 23px;
          border-top: 1px solid #eaecf0;
        }

        .summary-heading {
          display: flex;
          gap: 11px;
          align-items: flex-start;
          margin-bottom: 17px;
        }

        .summary-number {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 8px;
          background: #eef5ff;
          color: #1668e3;
          font-size: 9px;
          font-weight: 800;
        }

        .summary-heading h3 {
          margin: 0 0 2px;
          color: #1d2939;
          font-family:
            Manrope,
            Inter,
            sans-serif;
          font-size: 14px;
          font-weight: 800;
        }

        .summary-heading p {
          margin: 0;
          color: #98a2b3;
          font-size: 10px;
        }

        /* STAY GRID */

        .stay-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          border-top: 1px solid #eaecf0;
          border-left: 1px solid #eaecf0;
        }

        .stay-item {
          min-width: 0;
          padding: 14px 13px;
          border-right: 1px solid #eaecf0;
          border-bottom: 1px solid #eaecf0;
        }

        .stay-item span,
        .guest-grid span,
        .confirmation-total > div > span,
        .total-note > span {
          display: block;
          margin-bottom: 5px;
          color: #98a2b3;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .stay-item strong,
        .guest-grid strong {
          display: block;
          overflow: hidden;
          color: #344054;
          font-size: 11px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* GUEST */

        .guest-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .guest-grid > div {
          padding: 14px;
          border: 1px solid #eaecf0;
          border-radius: 9px;
          background: #fafbfc;
        }

        /* TOTAL */

        .confirmation-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 20px;
          padding: 18px;
          border-radius: 11px;
          background: #f4f7fc;
        }

        .confirmation-total > div:first-child strong {
          color: #0b3d91;
          font-size: 26px;
          font-weight: 800;
        }

        .total-note {
          text-align: right;
        }

        .total-note p {
          margin: 0;
          color: #667085;
          font-size: 10px;
        }

        /* PAYMENT */

        .payment-card {
          display: flex;
          gap: 11px;
          margin-top: 12px;
          padding: 15px;
          border: 1px solid #d8eee0;
          border-radius: 10px;
          background: #f7faf8;
        }

        .payment-check {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #087443;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
        }

        .payment-card strong {
          color: #344054;
          font-size: 11px;
        }

        .payment-card p {
          max-width: 620px;
          margin: 3px 0 0;
          color: #667085;
          font-size: 10px;
          line-height: 1.55;
        }

        /* NEXT STEP */

        .next-step-card {
          display: flex;
          gap: 12px;
          margin-top: 14px;
          padding: 15px;
          border: 1px solid #e4e7ec;
          border-radius: 10px;
          background: #fff;
        }

        .next-step-icon {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 8px;
          background: #eef5ff;
          color: #1668e3;
          font-size: 14px;
          font-weight: 800;
        }

        .next-step-card span {
          display: block;
          margin-bottom: 2px;
          color: #98a2b3;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .next-step-card strong {
          color: #344054;
          font-size: 11px;
        }

        .next-step-card p {
          margin: 3px 0 0;
          color: #667085;
          font-size: 10px;
          line-height: 1.45;
        }

        /* ACTIONS */

        .confirmation-actions {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }

        .whatsapp-button,
        .secondary-button {
          min-height: 49px;
          border-radius: 9px;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform .2s,
            background .2s,
            border-color .2s;
        }

        .whatsapp-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          background: #087443;
          color: #fff;
        }

        .whatsapp-button:hover {
          background: #075f37;
          transform: translateY(-1px);
        }

        .whatsapp-symbol {
          font-size: 13px;
        }

        .action-arrow {
          font-size: 15px;
        }

        .secondary-button {
          border: 1px solid #d8dee7;
          background: #fff;
          color: #344054;
        }

        .secondary-button:hover {
          border-color: #1668e3;
          color: #1668e3;
        }

        .confirmation-footer {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 20px;
          padding-top: 17px;
          border-top: 1px solid #eaecf0;
          color: #98a2b3;
          font-size: 9px;
        }

        .confirmation-footer span:first-child {
          color: #087443;
        }

        /* FOOTER */

        .booking-footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 27px 4px 0;
          color: #98a2b3;
          font-size: 9px;
        }

        /* LOADING */

        .booking-loading {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 30px;
          background: #f7f8fa;
          color: #344054;
          font-family: Inter, sans-serif;
        }

        .booking-loading strong {
          display: block;
          margin-bottom: 3px;
          font-size: 13px;
        }

        .booking-loading p {
          margin: 0;
          color: #98a2b3;
          font-size: 10px;
        }

        .booking-loader-ring {
          width: 34px;
          height: 34px;
          border: 3px solid #e4e7ec;
          border-top-color: #0b3d91;
          border-radius: 50%;
          animation:
            bookingSpin .7s linear infinite;
        }

        /* ERROR */

        .booking-error {
          min-height: 70vh;
          display: grid;
          place-items: center;
          padding: 30px;
          background: #f7f8fa;
          font-family: Inter, sans-serif;
        }

        .booking-error-card {
          width: min(100%, 430px);
          padding: 35px;
          text-align: center;
          border: 1px solid #e4e7ec;
          border-radius: 16px;
          background: #fff;
          box-shadow:
            0 8px 28px
            rgba(16, 24, 40, .06);
        }

        .booking-error-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin: 0 auto 12px;
          border-radius: 50%;
          background: #fef3f2;
          color: #b42318;
          font-weight: 800;
        }

        .error-eyebrow {
          color: #98a2b3;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .booking-error-card h2 {
          margin: 7px 0;
          color: #172033;
          font-family: Manrope, Inter, sans-serif;
          font-size: 22px;
        }

        .booking-error-card p {
          margin: 0;
          color: #667085;
          font-size: 12px;
        }

        .booking-error-card button {
          min-height: 44px;
          margin-top: 22px;
          padding: 0 20px;
          border: 0;
          border-radius: 9px;
          background: #0b3d91;
          color: #fff;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        @keyframes bookingSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* TABLET */

        @media (max-width: 900px) {

          .booking-layout {
            grid-template-columns: 1fr;
          }

          .booking-summary {
            position: static;
            order: -1;
          }

          .summary-image {
            height: 240px;
          }

          .confirmation-card {
            max-width: 100%;
          }

        }

        /* MOBILE */

        @media (max-width: 600px) {

          .booking-page {
            padding:
              0
              10px
              28px;
          }

          .booking-header {
            height: 66px;
            margin-bottom: 20px;
          }

          .booking-brand strong {
            font-size: 11px;
          }

          .booking-brand div span {
            display: none;
          }

          .booking-brand-mark {
            width: 30px;
            height: 30px;
          }

          .booking-form-card,
          .confirmation-card {
            padding: 23px 17px;
            border-radius: 14px;
          }

          .booking-title {
            font-size: 31px;
            letter-spacing: -1.2px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .form-full {
            grid-column: auto;
          }

          .summary-image {
            height: 215px;
          }

          .summary-content {
            padding: 21px;
          }

          .confirmation-heading h1 {
            font-size: 31px;
          }

          .confirmation-status {
            align-items: flex-start;
          }

          .confirmation-property {
            grid-template-columns:
              70px
              minmax(0, 1fr);
            align-items: center;
          }

          .confirmation-property img {
            width: 70px;
            height: 62px;
          }

          .property-price {
            grid-column: 1 / -1;
            padding: 11px 0 0;
            border-top: 1px solid #e4e7ec;
            border-left: 0;
            text-align: left;
          }

          .property-price strong {
            display: inline;
            margin-right: 4px;
          }

          .stay-grid {
            grid-template-columns: 1fr 1fr;
          }

          .confirmation-total {
            align-items: flex-start;
            flex-direction: column;
          }

          .total-note {
            text-align: left;
          }

          .confirmation-actions {
            grid-template-columns: 1fr;
          }

          .reference-bar {
            align-items: flex-start;
            flex-direction: column;
          }

          .reference-bar > div {
            align-items: flex-start;
            flex-direction: column;
            gap: 4px;
          }

          .confirmation-footer {
            flex-direction: column;
          }

          .booking-footer {
            flex-direction: column;
            gap: 6px;
          }

        }

        /* SMALL MOBILE */

        @media (max-width: 360px) {

          .booking-page {
            padding-left: 7px;
            padding-right: 7px;
          }

          .booking-form-card,
          .confirmation-card {
            padding: 19px 13px;
          }

          .booking-back {
            font-size: 11px;
          }

          .booking-brand {
            gap: 7px;
          }

          .booking-brand strong {
            font-size: 10px;
          }

          .booking-brand-mark {
            width: 27px;
            height: 27px;
            font-size: 9px;
          }

          .booking-title {
            font-size: 28px;
          }

          .confirmation-heading h1 {
            font-size: 28px;
          }

          .confirmation-heading p {
            font-size: 11px;
          }

          .confirmation-property {
            grid-template-columns:
              60px
              minmax(0, 1fr);
            gap: 10px;
          }

          .confirmation-property img {
            width: 60px;
            height: 55px;
          }

          .property-copy h2 {
            font-size: 13px;
          }

          .stay-item {
            padding:
              12px 9px;
          }

          .stay-item strong,
          .guest-grid strong {
            font-size: 10px;
          }

          .confirmation-total
            > div:first-child
            strong {
            font-size: 22px;
          }

          .payment-card,
          .next-step-card {
            padding: 12px;
          }

        }

      `}</style>
    </div>
  );
};

export default Booking;