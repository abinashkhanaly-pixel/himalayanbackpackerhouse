import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoom } from "../services/roomApi";

const WHATSAPP_NUMBER = import.meta.env.VITE_BOOKING_WHATSAPP || "";

const COUNTRY_CODES = [
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA / Canada" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
];

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    countryCode: "+977",
    phone: "",
    email: "",
    passportNumber: "",
    citizenshipNumber: "",
    nationality: "",
    city: "",
    address: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    rooms: 1,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const roomId = searchParams.get("room");

  useEffect(() => {
    let mounted = true;

    async function loadRoom() {
      if (!roomId) {
        setRoomError("No room was selected.");
        setLoadingRoom(false);
        return;
      }

      try {
        setLoadingRoom(true);
        setRoomError("");

        const data = await getRoom(roomId);

        if (!mounted) return;

        setRoom(data?.room || data);
      } catch (err) {
        if (!mounted) return;

        setRoomError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this room."
        );
      } finally {
        if (mounted) setLoadingRoom(false);
      }
    }

    loadRoom();

    return () => {
      mounted = false;
    };
  }, [roomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const getNights = () => {
    if (!form.checkIn || !form.checkOut) return 0;

    const checkIn = new Date(`${form.checkIn}T00:00:00`);
    const checkOut = new Date(`${form.checkOut}T00:00:00`);

    const difference = checkOut.getTime() - checkIn.getTime();

    if (difference <= 0) return 0;

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const getTotal = () => {
    const nights = getNights();
    const roomPrice = Number(room?.price || 0);
    const numberOfRooms = Math.max(1, Number(form.rooms) || 1);

    return roomPrice * nights * numberOfRooms;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getGuestName = () =>
    `${form.firstName} ${form.lastName}`.trim();

  const getFullPhone = () => {
    const cleanPhone = String(form.phone || "")
      .replace(/\s+/g, "")
      .replace(/^\+/, "");

    return `${form.countryCode}${cleanPhone}`;
  };

  const createWhatsAppMessage = (bookingId) => {
    const nights = getNights();
    const total = getTotal();

    return [
      "Hello Backpacker Gateways,",
      "",
      "I would like to confirm my hotel booking.",
      "",
      `Booking ID: ${bookingId || "Pending"}`,
      `Hotel: ${room?.name || "Selected Property"}`,
      `Guest: ${getGuestName()}`,
      `WhatsApp: ${getFullPhone()}`,
      `Guests: ${form.guests}`,
      `Rooms: ${form.rooms}`,
      `Check-in: ${formatDate(form.checkIn)}`,
      `Check-out: ${formatDate(form.checkOut)}`,
      `Nights: ${nights}`,
      `Estimated Total: NPR ${Number(total).toLocaleString("en-NP")}`,
      "",
      "Payment: Pay at hotel",
      "",
      "Thank you.",
    ].join("\n");
  };

  const openWhatsApp = () => {
    if (!WHATSAPP_NUMBER) {
      setError(
        "WhatsApp confirmation is not configured yet. Please contact the property directly."
      );
      return;
    }

    const bookingId = success?.bookingId || "Pending";
    const message = createWhatsAppMessage(bookingId);

    const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, "");
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!room) {
      setError("Room information is unavailable.");
      return;
    }

    const guestCount = Number(form.guests);
    const roomCount = Number(form.rooms);

    if (!form.firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your WhatsApp number.");
      return;
    }

    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
      setError("Guests must be between 1 and 20.");
      return;
    }

    if (!Number.isInteger(roomCount) || roomCount < 1 || roomCount > 10) {
      setError("Rooms must be between 1 and 10.");
      return;
    }

    if (!form.checkIn || !form.checkOut) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://backpacker-gateways-2.onrender.com/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room: room._id,

            // Existing backend-compatible guest name
            guestName: getGuestName(),

            email: form.email,
            phone: getFullPhone(),

            guests: guestCount,
            checkIn: form.checkIn,
            checkOut: form.checkOut,

            // Additional guest information
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            countryCode: form.countryCode,
            passportNumber: form.passportNumber.trim(),
            citizenshipNumber: form.citizenshipNumber.trim(),
            nationality: form.nationality.trim(),
            city: form.city.trim(),
            address: form.address.trim(),

            // Additional stay information
            rooms: roomCount,

            paymentMethod: "pay_at_hotel",
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to create booking. Please try again."
        );
      }

      const bookingId =
        data?.booking?._id ||
        data?.booking?.id ||
        data?._id ||
        data?.id ||
        data?.bookingId ||
        data?.reference ||
        "Pending";

      const nights = getNights();
      const total = getTotal();

      setSuccess({
        bookingId,
        name: getGuestName(),
        phone: getFullPhone(),
        email: form.email,
        guests: guestCount,
        rooms: roomCount,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        nights,
        total,
      });

      setForm({
        firstName: "",
        lastName: "",
        countryCode: "+977",
        phone: "",
        email: "",
        passportNumber: "",
        citizenshipNumber: "",
        nationality: "",
        city: "",
        address: "",
        checkIn: "",
        checkOut: "",
        guests: 1,
        rooms: 1,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong while creating your booking."
      );
    } finally {
      setLoading(false);
    }
  };

  const firstImage =
    room?.images?.[0] ||
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80";

  const roomPrice = Number(room?.price || 0);

  if (loadingRoom) {
    return (
      <>
        <style>{styles}</style>

        <div className="booking-page booking-state-page">
          <div className="state-card">
            <div className="state-spinner" />
            <h2>Preparing your booking</h2>
            <p>Loading selected property details...</p>
          </div>
        </div>
      </>
    );
  }

  if (roomError || !room) {
    return (
      <>
        <style>{styles}</style>

        <div className="booking-page booking-state-page">
          <div className="state-card">
            <div className="state-icon">!</div>
            <h2>Room unavailable</h2>
            <p>{roomError || "The selected room could not be found."}</p>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/rooms")}
            >
              Browse Stays
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="booking-page">
        <div className="booking-shell">
          <header className="booking-header">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <span>←</span>
              <span>Back</span>
            </button>

            <button
              type="button"
              className="brand"
              onClick={() => navigate("/")}
            >
              <span className="brand-mark">BG</span>

              <span className="brand-copy">
                <strong>Backpacker Gateways</strong>
                <small>EXPLORE · STAY · TREK · CONNECT</small>
              </span>
            </button>

            <div className="secure-label">
              <span>✓</span>
              Secure booking
            </div>
          </header>

          {success ? (
            <section className="confirmation-page">
              <div className="confirmation-hero">
                <div className="success-check">✓</div>

                <p className="eyebrow">BOOKING CONFIRMATION</p>

                <h1>Your booking request is received.</h1>

                <p>
                  Thank you, {success.name}. We have received your booking
                  request and will contact you with the confirmation details.
                </p>
              </div>

              <div className="confirmation-grid">
                <div className="confirmation-main">
                  <div className="confirmation-card reference-card">
                    <div>
                      <span className="small-label">BOOKING REFERENCE</span>
                      <strong>{success.bookingId}</strong>
                    </div>

                    <span className="reference-status">REQUEST RECEIVED</span>
                  </div>

                  <div className="confirmation-card">
                    <div className="confirmation-card-heading">
                      <div>
                        <span className="small-label">SELECTED PROPERTY</span>
                        <h2>{room.name}</h2>
                        <p>Kathmandu, Nepal</p>
                      </div>

                      <div className="confirmation-price">
                        <strong>
                          NPR {roomPrice.toLocaleString("en-NP")}
                        </strong>
                        <span>per night</span>
                      </div>
                    </div>

                    <img
                      className="confirmation-image"
                      src={firstImage}
                      alt={room.name}
                    />
                  </div>

                  <div className="confirmation-card">
                    <span className="small-label">YOUR STAY</span>

                    <div className="stay-summary-grid">
                      <div>
                        <span>Check-in</span>
                        <strong>{formatDate(success.checkIn)}</strong>
                      </div>

                      <div>
                        <span>Check-out</span>
                        <strong>{formatDate(success.checkOut)}</strong>
                      </div>

                      <div>
                        <span>Guests</span>
                        <strong>{success.guests}</strong>
                      </div>

                      <div>
                        <span>Rooms</span>
                        <strong>{success.rooms}</strong>
                      </div>

                      <div>
                        <span>Nights</span>
                        <strong>{success.nights}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="confirmation-card">
                    <span className="small-label">GUEST INFORMATION</span>

                    <div className="guest-confirmation-grid">
                      <div>
                        <span>Guest</span>
                        <strong>{success.name}</strong>
                      </div>

                      <div>
                        <span>WhatsApp</span>
                        <strong>{success.phone}</strong>
                      </div>

                      <div>
                        <span>Email</span>
                        <strong>{success.email || "Not provided"}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="confirmation-side">
                  <div className="total-card">
                    <span className="small-label">ESTIMATED TOTAL</span>

                    <strong>
                      NPR {Number(success.total).toLocaleString("en-NP")}
                    </strong>

                    <p>
                      {success.nights} night
                      {success.nights !== 1 ? "s" : ""} ·{" "}
                      {success.rooms} room
                      {success.rooms !== 1 ? "s" : ""}
                    </p>

                    <div className="payment-confirmed">
                      <span>✓</span>

                      <div>
                        <strong>PAY AT HOTEL</strong>
                        <p>No online payment required.</p>
                      </div>
                    </div>
                  </div>

                  <div className="next-step-card">
                    <span className="small-label">NEXT STEP</span>

                    <h3>Confirm through WhatsApp</h3>

                    <p>
                      Continue the conversation with our booking team for
                      confirmation and voucher details.
                    </p>

                    <button
                      type="button"
                      className="whatsapp-button"
                      onClick={openWhatsApp}
                    >
                      Continue on WhatsApp
                      <span>→</span>
                    </button>
                  </div>
                </aside>
              </div>

              <div className="confirmation-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("/rooms")}
                >
                  Browse More Stays
                </button>
              </div>
            </section>
          ) : (
            <>
              <div className="booking-intro">
                <div>
                  <p className="eyebrow">RESERVE YOUR STAY</p>
                  <h1>Complete your booking</h1>
                  <p>
                    Secure your preferred stay in Nepal with a simple,
                    flexible booking request.
                  </p>
                </div>

                <div className="intro-badge">
                  <span>✓</span>
                  Pay at hotel
                </div>
              </div>

              <form className="booking-layout" onSubmit={handleSubmit}>
                <main className="booking-main">
                  <section className="form-card">
                    <div className="section-top">
                      <div className="section-number">01</div>

                      <div>
                        <p className="section-kicker">GUEST INFORMATION</p>
                        <h2>Your details</h2>
                        <p>
                          Tell us how to contact you about your booking.
                        </p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="firstName">
                          First Name <span className="required">*</span>
                        </label>

                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="John"
                          autoComplete="given-name"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="lastName">
                          Last Name <span className="required">*</span>
                        </label>

                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
                          autoComplete="family-name"
                          required
                        />
                      </div>

                      <div className="form-field full-width">
                        <label htmlFor="phone">
                          WhatsApp Number{" "}
                          <span className="required">*</span>
                        </label>

                        <div className="phone-input-wrap">
                          <select
                            name="countryCode"
                            value={form.countryCode}
                            onChange={handleChange}
                            aria-label="Country calling code"
                          >
                            {COUNTRY_CODES.map((country) => (
                              <option
                                key={`${country.code}-${country.name}`}
                                value={country.code}
                              >
                                {country.flag} {country.code}
                              </option>
                            ))}
                          </select>

                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="98XXXXXXXX"
                            autoComplete="tel"
                            required
                          />
                        </div>

                        <small>
                          We'll use this number for booking confirmation.
                        </small>
                      </div>

                      <div className="form-field full-width">
                        <label htmlFor="email">
                          Email Address{" "}
                          <span className="optional">Optional</span>
                        </label>

                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          autoComplete="email"
                        />

                        <small>
                          Your confirmation and booking voucher will be sent
                          to your email.
                        </small>
                      </div>

                      <div className="form-field">
                        <label htmlFor="passportNumber">
                          Passport Number
                        </label>

                        <input
                          id="passportNumber"
                          name="passportNumber"
                          type="text"
                          value={form.passportNumber}
                          onChange={handleChange}
                          placeholder="Passport number"
                          autoComplete="off"
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="citizenshipNumber">
                          Citizenship Number
                        </label>

                        <input
                          id="citizenshipNumber"
                          name="citizenshipNumber"
                          type="text"
                          value={form.citizenshipNumber}
                          onChange={handleChange}
                          placeholder="Citizenship number"
                          autoComplete="off"
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="nationality">
                          Nationality / Country
                        </label>

                        <input
                          id="nationality"
                          name="nationality"
                          type="text"
                          value={form.nationality}
                          onChange={handleChange}
                          placeholder="Nepal"
                          autoComplete="country-name"
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="city">City</label>

                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Kathmandu"
                          autoComplete="address-level2"
                        />
                      </div>

                      <div className="form-field full-width">
                        <label htmlFor="address">Full Address</label>

                        <textarea
                          id="address"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Street, area, municipality..."
                          rows="3"
                          autoComplete="street-address"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="form-card">
                    <div className="section-top">
                      <div className="section-number">02</div>

                      <div>
                        <p className="section-kicker">TRIP DETAILS</p>
                        <h2>Your stay</h2>
                        <p>
                          Choose your dates, rooms and number of guests.
                        </p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="guests">Guests</label>

                        <input
                          id="guests"
                          name="guests"
                          type="number"
                          min="1"
                          max="20"
                          value={form.guests}
                          onChange={handleChange}
                          required
                        />

                        <small>
                          Enter the total number of guests travelling.
                        </small>
                      </div>

                      <div className="form-field">
                        <label htmlFor="rooms">Number of Rooms</label>

                        <input
                          id="rooms"
                          name="rooms"
                          type="number"
                          min="1"
                          max="10"
                          value={form.rooms}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="checkIn">Check-in</label>

                        <input
                          id="checkIn"
                          name="checkIn"
                          type="date"
                          value={form.checkIn}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="checkOut">Check-out</label>

                        <input
                          id="checkOut"
                          name="checkOut"
                          type="date"
                          value={form.checkOut}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {getNights() > 0 && (
                      <div className="live-total">
                        <div>
                          <span>
                            {getNights()} night
                            {getNights() !== 1 ? "s" : ""} · {form.rooms} room
                            {Number(form.rooms) !== 1 ? "s" : ""}
                          </span>
                          <strong>
                            NPR {getTotal().toLocaleString("en-NP")}
                          </strong>
                        </div>

                        <small>Estimated stay total</small>
                      </div>
                    )}

                    <div className="pay-hotel-box">
                      <div className="pay-icon">✓</div>

                      <div>
                        <strong>PAY AT HOTEL</strong>

                        <p>
                          No online payment required. Pay directly at the
                          property.
                        </p>
                      </div>
                    </div>

                    {error && (
                      <div className="form-error" role="alert">
                        <span>!</span>
                        <p>{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="luxury-submit"
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

                    <p className="form-note">
                      By requesting a booking, you agree that the property
                      may contact you to confirm availability.
                    </p>
                  </section>
                </main>

                <aside className="booking-sidebar">
                  <div className="property-card">
                    <div className="property-image-wrap">
                      <img
                        src={firstImage}
                        alt={room.name}
                        className="property-image"
                      />

                      <span className="available-badge">
                        <span>●</span>
                        Available
                      </span>
                    </div>

                    <div className="property-content">
                      <p className="property-kicker">SELECTED PROPERTY</p>

                      <h2>{room.name}</h2>

                      <p className="property-location">
                        <span>●</span>
                        Kathmandu, Nepal
                      </p>

                      <div className="property-price">
                        <div>
                          <span>From</span>
                          <strong>
                            NPR {roomPrice.toLocaleString("en-NP")}
                          </strong>
                        </div>

                        <small>per night</small>
                      </div>

                      <div className="property-features">
                        <div>
                          <span className="feature-icon">♙</span>

                          <div>
                            <small>GUESTS</small>
                            <strong>
                              Up to {room.capacity || 2}
                            </strong>
                          </div>
                        </div>

                        <div>
                          <span className="feature-icon">▱</span>

                          <div>
                            <small>BED</small>
                            <strong>
                              {room.beds || "Comfortable bed"}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="property-perk">
                        <span>✓</span>
                        <div>
                          <strong>Simple booking</strong>
                          <p>Reserve now and pay at the property.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-trust">
                    <div>
                      <span>✓</span>
                      <p>
                        <strong>Flexible payment</strong>
                        Pay directly at the hotel.
                      </p>
                    </div>

                    <div>
                      <span>✓</span>
                      <p>
                        <strong>Booking assistance</strong>
                        Our team can help with your stay.
                      </p>
                    </div>
                  </div>
                </aside>
              </form>
            </>
          )}

          <footer className="booking-footer">
            <span>© Backpacker Gateways</span>
            <span>Explore Nepal with confidence.</span>
          </footer>
        </div>
      </div>
    </>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .booking-page {
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
    background:
      radial-gradient(circle at top right, rgba(22, 104, 227, 0.055), transparent 32%),
      #f6f7f9;
    color: #172033;
    font-family:
      Inter,
      Manrope,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .booking-shell {
    width: min(1220px, calc(100% - 40px));
    margin: 0 auto;
  }

  .booking-header {
    min-height: 82px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    border-bottom: 1px solid #e4e7ec;
  }

  .back-button,
  .brand {
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: #596273;
    font-size: 14px;
    font-weight: 650;
    padding: 10px 0;
  }

  .back-button span:first-child {
    font-size: 20px;
  }

  .back-button:hover {
    color: #1668e3;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #13294b;
    text-align: left;
  }

  .brand-mark {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #0b3d91;
    color: #fff;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .brand-copy {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .brand-copy strong {
    font-size: 15px;
    letter-spacing: -0.02em;
  }

  .brand-copy small {
    color: #87909e;
    font-size: 8px;
    font-weight: 750;
    letter-spacing: 0.11em;
  }

  .secure-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #66707f;
    font-size: 12px;
    font-weight: 650;
  }

  .secure-label span {
    color: #26855b;
    font-size: 15px;
  }

  .booking-intro {
    padding: 48px 0 34px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;
  }

  .eyebrow,
  .section-kicker,
  .property-kicker,
  .small-label {
    margin: 0 0 8px;
    color: #8b6f47;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.15em;
  }

  .booking-intro h1 {
    margin: 0;
    color: #13294b;
    font-size: clamp(30px, 4vw, 46px);
    line-height: 1.04;
    letter-spacing: -0.045em;
  }

  .booking-intro > div:first-child > p:last-child {
    max-width: 600px;
    margin: 13px 0 0;
    color: #687384;
    font-size: 15px;
    line-height: 1.65;
  }

  .intro-badge {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 15px;
    border: 1px solid rgba(38, 133, 91, 0.2);
    border-radius: 999px;
    background: rgba(38, 133, 91, 0.07);
    color: #23744f;
    font-size: 12px;
    font-weight: 800;
  }

  .intro-badge span {
    width: 19px;
    height: 19px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #26855b;
    color: white;
    font-size: 11px;
  }

  .booking-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
    gap: 25px;
  }

  .booking-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-card,
  .property-card,
  .sidebar-trust,
  .confirmation-card,
  .total-card,
  .next-step-card {
    background: #fff;
    border: 1px solid #e4e7ec;
    box-shadow: 0 8px 30px rgba(24, 38, 61, 0.045);
  }

  .form-card {
    padding: 30px;
    border-radius: 18px;
  }

  .section-top {
    display: flex;
    gap: 16px;
    margin-bottom: 28px;
  }

  .section-number {
    width: 39px;
    height: 39px;
    flex: 0 0 39px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #eef4fc;
    color: #1668e3;
    font-size: 12px;
    font-weight: 900;
  }

  .section-kicker {
    margin-bottom: 4px;
    color: #1668e3;
    font-size: 9px;
  }

  .section-top h2 {
    margin: 0;
    color: #18263d;
    font-size: 24px;
    line-height: 1.2;
    letter-spacing: -0.025em;
  }

  .section-top p:last-child {
    margin: 5px 0 0;
    color: #7a8493;
    font-size: 13px;
    line-height: 1.5;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 19px 16px;
  }

  .form-field {
    min-width: 0;
  }

  .form-field.full-width {
    grid-column: 1 / -1;
  }

  .form-field label {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0 0 8px;
    color: #344054;
    font-size: 12px;
    font-weight: 750;
  }

  .required {
    color: #d05454;
  }

  .optional {
    color: #9a6d35;
    font-size: 10px;
    font-weight: 650;
  }

  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    border: 1px solid #dfe3e9;
    border-radius: 11px;
    outline: none;
    background: #fff;
    color: #1d2939;
    font: inherit;
    font-size: 14px;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease;
  }

  .form-field input,
  .form-field select {
    height: 49px;
    padding: 0 14px;
  }

  .form-field textarea {
    resize: vertical;
    min-height: 88px;
    padding: 13px 14px;
    line-height: 1.5;
  }

  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: #a6adb8;
  }

  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: #1668e3;
    box-shadow: 0 0 0 3px rgba(22, 104, 227, 0.09);
    background: #fff;
  }

  .form-field small {
    display: block;
    margin-top: 7px;
    color: #8b94a2;
    font-size: 10px;
    line-height: 1.45;
  }

  .phone-input-wrap {
    display: flex;
    width: 100%;
    min-width: 0;
  }

  .phone-input-wrap select {
    width: 108px;
    flex: 0 0 108px;
    border-radius: 11px 0 0 11px;
    border-right: 0;
    padding: 0 7px;
    background: #f8f9fb;
    font-size: 12px;
    cursor: pointer;
  }

  .phone-input-wrap input {
    flex: 1;
    min-width: 0;
    border-radius: 0 11px 11px 0;
  }

  .live-total {
    margin-top: 24px;
    padding: 15px 17px;
    border: 1px solid #e6e9ef;
    border-radius: 13px;
    background: #f8fafc;
  }

  .live-total > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .live-total span {
    color: #667085;
    font-size: 12px;
    font-weight: 650;
  }

  .live-total strong {
    color: #172b4d;
    font-size: 17px;
  }

  .live-total small {
    display: block;
    margin-top: 4px;
    color: #98a0ad;
    font-size: 10px;
  }

  .pay-hotel-box {
    margin-top: 24px;
    padding: 17px 18px;
    display: flex;
    align-items: center;
    gap: 13px;
    border: 1px solid rgba(197, 139, 58, 0.32);
    border-radius: 14px;
    background:
      linear-gradient(
        135deg,
        rgba(197, 139, 58, 0.105),
        rgba(255, 251, 242, 0.98)
      );
  }

  .pay-icon {
    width: 37px;
    height: 37px;
    flex: 0 0 37px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #c58b3a;
    color: #fff;
    font-size: 17px;
    font-weight: 900;
    box-shadow: 0 5px 12px rgba(197, 139, 58, 0.2);
  }

  .pay-hotel-box strong {
    display: block;
    color: #25483d;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.09em;
  }

  .pay-hotel-box p {
    margin: 4px 0 0;
    color: #776e61;
    font-size: 12px;
    line-height: 1.5;
    font-style: italic;
  }

  .form-error {
    margin-top: 18px;
    padding: 12px 14px;
    display: flex;
    align-items: flex-start;
    gap: 9px;
    border: 1px solid #f0c9c9;
    border-radius: 10px;
    background: #fff5f5;
    color: #a23b3b;
  }

  .form-error span {
    width: 19px;
    height: 19px;
    flex: 0 0 19px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #c94d4d;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
  }

  .form-error p {
    margin: 1px 0 0;
    font-size: 12px;
    line-height: 1.45;
  }

  .luxury-submit {
    width: 100%;
    min-height: 54px;
    margin-top: 22px;
    border: 0;
    border-radius: 11px;
    background: #1668e3;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font: inherit;
    font-size: 14px;
    font-weight: 800;
    box-shadow: 0 8px 18px rgba(22, 104, 227, 0.19);
    transition:
      transform 0.18s ease,
      background 0.18s ease,
      box-shadow 0.18s ease;
  }

  .luxury-submit:hover:not(:disabled) {
    background: #0f5dce;
    transform: translateY(-1px);
    box-shadow: 0 11px 23px rgba(22, 104, 227, 0.23);
  }

  .luxury-submit:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .luxury-submit span {
    font-size: 19px;
  }

  .button-spinner,
  .state-spinner {
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }

  .button-spinner {
    width: 17px;
    height: 17px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .form-note {
    margin: 12px 0 0;
    color: #9aa2ad;
    font-size: 10px;
    line-height: 1.5;
    text-align: center;
  }

  .booking-sidebar {
    min-width: 0;
    position: sticky;
    top: 20px;
  }

  .property-card {
    overflow: hidden;
    border-radius: 18px;
  }

  .property-image-wrap {
    position: relative;
    height: 225px;
    background: #e9edf2;
    overflow: hidden;
  }

  .property-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .property-card:hover .property-image {
    transform: scale(1.025);
  }

  .available-badge {
    position: absolute;
    top: 13px;
    right: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.94);
    color: #287b57;
    box-shadow: 0 5px 16px rgba(0,0,0,0.1);
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .available-badge span {
    color: #28a269;
    font-size: 11px;
  }

  .property-content {
    padding: 24px;
  }

  .property-kicker {
    margin-bottom: 7px;
    color: #1668e3;
    font-size: 9px;
  }

  .property-content h2 {
    margin: 0;
    color: #18263d;
    font-size: 22px;
    line-height: 1.22;
    letter-spacing: -0.025em;
    overflow-wrap: anywhere;
  }

  .property-location {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 8px 0 0;
    color: #7b8492;
    font-size: 12px;
  }

  .property-location span {
    color: #c58b3a;
    font-size: 9px;
  }

  .property-price {
    margin-top: 20px;
    padding-bottom: 19px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid #edf0f3;
  }

  .property-price > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .property-price span {
    color: #8c95a2;
    font-size: 10px;
  }

  .property-price strong {
    color: #172b4d;
    font-size: 21px;
    letter-spacing: -0.025em;
  }

  .property-price small {
    color: #89919d;
    font-size: 10px;
    padding-bottom: 2px;
  }

  .property-features {
    padding: 18px 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    border-bottom: 1px solid #edf0f3;
  }

  .property-features > div {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .feature-icon {
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: #f3f6fa;
    color: #64748b;
    font-size: 14px;
  }

  .property-features > div > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .property-features small {
    color: #969eaa;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.09em;
  }

  .property-features strong {
    color: #354052;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .property-perk {
    padding-top: 17px;
    display: flex;
    gap: 9px;
  }

  .property-perk > span {
    color: #26855b;
    font-size: 15px;
    font-weight: 900;
  }

  .property-perk strong {
    display: block;
    color: #394558;
    font-size: 11px;
  }

  .property-perk p {
    margin: 3px 0 0;
    color: #8c95a2;
    font-size: 10px;
    line-height: 1.4;
  }

  .sidebar-trust {
    margin-top: 14px;
    padding: 17px;
    border-radius: 14px;
  }

  .sidebar-trust > div {
    display: flex;
    gap: 9px;
  }

  .sidebar-trust > div + div {
    margin-top: 13px;
    padding-top: 13px;
    border-top: 1px solid #edf0f3;
  }

  .sidebar-trust > div > span {
    color: #26855b;
    font-size: 13px;
  }

  .sidebar-trust p {
    margin: 0;
    color: #8a93a0;
    font-size: 10px;
    line-height: 1.45;
  }

  .sidebar-trust strong {
    display: block;
    color: #4a5565;
    margin-bottom: 2px;
    font-size: 11px;
  }

  .booking-footer {
    min-height: 80px;
    margin-top: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    border-top: 1px solid #e4e7ec;
    color: #9aa2ad;
    font-size: 10px;
  }

  .booking-state-page {
    display: grid;
    place-items: center;
    padding: 30px;
  }

  .state-card {
    width: min(440px, 100%);
    padding: 40px 30px;
    border: 1px solid #e4e7ec;
    border-radius: 18px;
    background: #fff;
    text-align: center;
    box-shadow: 0 12px 35px rgba(24,38,61,0.06);
  }

  .state-spinner {
    width: 34px;
    height: 34px;
    margin: 0 auto 18px;
    border-color: #dce4ef;
    border-top-color: #1668e3;
  }

  .state-icon {
    width: 42px;
    height: 42px;
    margin: 0 auto 15px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #fff0f0;
    color: #bd4d4d;
    font-weight: 900;
  }

  .state-card h2 {
    margin: 0;
    color: #18263d;
    font-size: 22px;
  }

  .state-card p {
    margin: 9px 0 22px;
    color: #7d8795;
    font-size: 13px;
    line-height: 1.6;
  }

  .secondary-button {
    min-height: 45px;
    padding: 0 19px;
    border: 1px solid #d9dee6;
    border-radius: 10px;
    background: #fff;
    color: #344054;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
  }

  .secondary-button:hover {
    border-color: #1668e3;
    color: #1668e3;
  }

  /* Confirmation */

  .confirmation-page {
    padding: 45px 0 10px;
  }

  .confirmation-hero {
    max-width: 720px;
    margin: 0 auto 34px;
    text-align: center;
  }

  .success-check {
    width: 58px;
    height: 58px;
    margin: 0 auto 17px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #e7f6ef;
    color: #27835a;
    font-size: 25px;
    font-weight: 900;
  }

  .confirmation-hero h1 {
    margin: 0;
    color: #172b4d;
    font-size: clamp(29px, 4vw, 42px);
    line-height: 1.08;
    letter-spacing: -0.04em;
  }

  .confirmation-hero > p:last-child {
    margin: 12px auto 0;
    max-width: 590px;
    color: #737d8b;
    font-size: 14px;
    line-height: 1.65;
  }

  .confirmation-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 350px;
    gap: 20px;
    align-items: start;
  }

  .confirmation-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .confirmation-card {
    padding: 24px;
    border-radius: 16px;
  }

  .reference-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    background: #f9fbff;
    border-color: #dce8fa;
  }

  .reference-card strong {
    display: block;
    color: #1668e3;
    font-size: 19px;
    letter-spacing: 0.01em;
  }

  .reference-status {
    padding: 7px 9px;
    border-radius: 999px;
    background: #eaf6ef;
    color: #27835a;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: 0.08em;
  }

  .confirmation-card-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .confirmation-card-heading h2 {
    margin: 0;
    color: #1a2940;
    font-size: 21px;
    overflow-wrap: anywhere;
  }

  .confirmation-card-heading p {
    margin: 5px 0 0;
    color: #858e9b;
    font-size: 11px;
  }

  .confirmation-price {
    text-align: right;
    flex: 0 0 auto;
  }

  .confirmation-price strong {
    display: block;
    color: #172b4d;
    font-size: 17px;
  }

  .confirmation-price span {
    color: #929aa5;
    font-size: 9px;
  }

  .confirmation-image {
    width: 100%;
    height: 220px;
    display: block;
    margin-top: 18px;
    object-fit: cover;
    border-radius: 11px;
  }

  .stay-summary-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }

  .stay-summary-grid > div,
  .guest-confirmation-grid > div {
    min-width: 0;
    padding: 13px;
    border-radius: 10px;
    background: #f8fafc;
  }

  .stay-summary-grid span,
  .guest-confirmation-grid span {
    display: block;
    margin-bottom: 5px;
    color: #969eaa;
    font-size: 9px;
  }

  .stay-summary-grid strong,
  .guest-confirmation-grid strong {
    display: block;
    color: #354052;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .guest-confirmation-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .confirmation-side {
    min-width: 0;
    position: sticky;
    top: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .total-card,
  .next-step-card {
    padding: 23px;
    border-radius: 16px;
  }

  .total-card > strong {
    display: block;
    margin-top: 4px;
    color: #172b4d;
    font-size: 29px;
    letter-spacing: -0.035em;
  }

  .total-card > p {
    margin: 5px 0 19px;
    color: #8a93a0;
    font-size: 11px;
  }

  .payment-confirmed {
    display: flex;
    gap: 10px;
    padding: 13px;
    border-radius: 11px;
    background: #fff8ed;
    border: 1px solid #f1dfbf;
  }

  .payment-confirmed > span {
    color: #bd8130;
    font-weight: 900;
  }

  .payment-confirmed strong {
    display: block;
    color: #73562f;
    font-size: 10px;
    letter-spacing: 0.08em;
  }

  .payment-confirmed p {
    margin: 3px 0 0;
    color: #9a815e;
    font-size: 10px;
  }

  .next-step-card {
    background: #13294b;
    border-color: #13294b;
    color: #fff;
  }

  .next-step-card .small-label {
    color: #cda363;
  }

  .next-step-card h3 {
    margin: 0;
    font-size: 18px;
    line-height: 1.25;
  }

  .next-step-card > p {
    margin: 8px 0 18px;
    color: #bdc8d7;
    font-size: 11px;
    line-height: 1.6;
  }

  .whatsapp-button {
    width: 100%;
    min-height: 46px;
    border: 0;
    border-radius: 9px;
    background: #2a9b68;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
  }

  .whatsapp-button:hover {
    background: #238a5b;
  }

  .confirmation-actions {
    margin-top: 20px;
    text-align: center;
  }

  @media (max-width: 1050px) {
    .booking-layout {
      grid-template-columns: minmax(0, 1fr) 320px;
    }

    .confirmation-grid {
      grid-template-columns: minmax(0, 1fr) 310px;
    }

    .stay-summary-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 850px) {
    .booking-shell {
      width: min(100% - 28px, 700px);
    }

    .booking-layout,
    .confirmation-grid {
      grid-template-columns: 1fr;
    }

    .booking-sidebar,
    .confirmation-side {
      position: static;
    }

    .booking-sidebar {
      order: -1;
    }

    .property-image-wrap {
      height: 250px;
    }

    .sidebar-trust {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .sidebar-trust > div + div {
      margin-top: 0;
      padding-top: 0;
      padding-left: 15px;
      border-top: 0;
      border-left: 1px solid #edf0f3;
    }

    .confirmation-side {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 620px) {
    .booking-shell {
      width: min(100% - 20px, 560px);
    }

    .booking-header {
      min-height: 68px;
    }

    .brand-copy small,
    .secure-label {
      display: none;
    }

    .booking-intro {
      padding: 32px 0 24px;
      align-items: flex-start;
      flex-direction: column;
      gap: 15px;
    }

    .booking-intro h1 {
      font-size: 32px;
    }

    .form-card {
      padding: 22px 18px;
      border-radius: 15px;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 17px;
    }

    .form-field.full-width {
      grid-column: auto;
    }

    .section-top {
      margin-bottom: 23px;
    }

    .section-top h2 {
      font-size: 21px;
    }

    .property-content {
      padding: 20px;
    }

    .sidebar-trust {
      display: block;
    }

    .sidebar-trust > div + div {
      margin-top: 13px;
      padding-top: 13px;
      padding-left: 0;
      border-top: 1px solid #edf0f3;
      border-left: 0;
    }

    .confirmation-side {
      grid-template-columns: 1fr;
    }

    .confirmation-card {
      padding: 19px;
    }

    .confirmation-card-heading {
      flex-direction: column;
      gap: 12px;
    }

    .confirmation-price {
      text-align: left;
    }

    .stay-summary-grid {
      grid-template-columns: 1fr 1fr;
    }

    .guest-confirmation-grid {
      grid-template-columns: 1fr;
    }

    .confirmation-image {
      height: 190px;
    }

    .booking-footer {
      min-height: 70px;
      align-items: flex-start;
      justify-content: center;
      flex-direction: column;
      gap: 3px;
      padding: 18px 0;
    }
  }

  @media (max-width: 390px) {
    .booking-shell {
      width: calc(100% - 14px);
    }

    .back-button {
      font-size: 12px;
    }

    .brand-mark {
      width: 32px;
      height: 32px;
    }

    .brand-copy strong {
      font-size: 12px;
    }

    .booking-intro h1 {
      font-size: 28px;
    }

    .booking-intro > div:first-child > p:last-child {
      font-size: 13px;
    }

    .form-card {
      padding: 19px 14px;
    }

    .section-top {
      gap: 11px;
    }

    .section-number {
      width: 34px;
      height: 34px;
      flex-basis: 34px;
      border-radius: 9px;
    }

    .section-top h2 {
      font-size: 19px;
    }

    .section-top p:last-child {
      font-size: 11px;
    }

    .phone-input-wrap select {
      width: 91px;
      flex-basis: 91px;
      font-size: 11px;
    }

    .form-field input,
    .form-field select {
      height: 47px;
      font-size: 13px;
    }

    .property-image-wrap {
      height: 210px;
    }

    .property-content h2 {
      font-size: 19px;
    }

    .property-price strong {
      font-size: 18px;
    }

    .pay-hotel-box {
      padding: 14px;
    }

    .pay-hotel-box p {
      font-size: 11px;
    }

    .live-total > div {
      align-items: flex-start;
      flex-direction: column;
      gap: 4px;
    }

    .confirmation-hero {
      padding-top: 15px;
    }

    .confirmation-hero h1 {
      font-size: 28px;
    }

    .reference-card {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (max-width: 320px) {
    .booking-shell {
      width: calc(100% - 10px);
    }

    .booking-header {
      gap: 7px;
    }

    .back-button span:last-child {
      display: none;
    }

    .brand-copy strong {
      font-size: 11px;
    }

    .booking-intro {
      padding-top: 25px;
    }

    .booking-intro h1 {
      font-size: 25px;
    }

    .form-card {
      padding: 17px 11px;
    }

    .section-top {
      gap: 9px;
    }

    .section-number {
      width: 31px;
      height: 31px;
      flex-basis: 31px;
      font-size: 10px;
    }

    .section-top h2 {
      font-size: 18px;
    }

    .phone-input-wrap select {
      width: 82px;
      flex-basis: 82px;
      padding: 0 4px;
      font-size: 10px;
    }

    .phone-input-wrap input {
      padding-left: 9px;
      padding-right: 9px;
    }

    .property-content {
      padding: 17px;
    }

    .property-features {
      grid-template-columns: 1fr;
    }

    .confirmation-card {
      padding: 16px;
    }

    .stay-summary-grid {
      grid-template-columns: 1fr;
    }

    .confirmation-image {
      height: 160px;
    }
  }
`;