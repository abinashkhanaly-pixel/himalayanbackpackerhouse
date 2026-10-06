import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoom } from "../services/roomApi";
import "./Booking.css";

const BOOKINGS_API =
  "https://backpacker-gateways-2.onrender.com/api/bookings";

const WHATSAPP_NUMBER =
  import.meta.env.VITE_BOOKING_WHATSAPP || "9779851181005";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const COUNTRY_CODES = [
  { code: "+977", name: "Nepal" },
  { code: "+1", name: "USA / Canada" },
  { code: "+44", name: "United Kingdom" },
  { code: "+61", name: "Australia" },
  { code: "+81", name: "Japan" },
  { code: "+82", name: "South Korea" },
  { code: "+86", name: "China" },
  { code: "+91", name: "India" },
  { code: "+33", name: "France" },
  { code: "+49", name: "Germany" },
  { code: "+39", name: "Italy" },
  { code: "+34", name: "Spain" },
  { code: "+31", name: "Netherlands" },
  { code: "+41", name: "Switzerland" },
  { code: "+65", name: "Singapore" },
  { code: "+971", name: "UAE" },
  { code: "+974", name: "Qatar" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+27", name: "South Africa" },
  { code: "+64", name: "New Zealand" },
];

const INITIAL_FORM = {
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
  guests: 2,
  rooms: 1,
  roomType: "",
};

function normalizeRoomResponse(response) {
  if (!response) return null;

  if (response.data) {
    if (response.data.room) return response.data.room;
    if (response.data.data) return response.data.data;
    return response.data;
  }

  return response;
}

function getRoomPrice(room) {
  if (!room) return 0;

  const possiblePrices = [
    room.price,
    room.pricePerNight,
    room.price_per_night,
    room.roomPrice,
    room.rate,
    room.basePrice,
  ];

  const found = possiblePrices.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !Number.isNaN(Number(value))
  );

  return Number(found || 0);
}

function getRoomName(room) {
  if (!room) return "Your selected room";

  return (
    room.name ||
    room.roomName ||
    room.title ||
    room.roomType ||
    "Selected room"
  );
}

function getRoomLocation(room) {
  if (!room) return "Nepal";

  if (typeof room.location === "string") return room.location;

  return (
    room.location?.name ||
    room.location?.city ||
    room.city ||
    room.address ||
    "Nepal"
  );
}

function getRoomImage(room) {
  if (!room) return FALLBACK_IMAGE;

  if (Array.isArray(room.images) && room.images.length > 0) {
    const firstImage = room.images[0];

    if (typeof firstImage === "string") return firstImage;

    if (firstImage?.url) return firstImage.url;
    if (firstImage?.secure_url) return firstImage.secure_url;
  }

  return (
    room.image ||
    room.imageUrl ||
    room.coverImage ||
    room.featuredImage ||
    FALLBACK_IMAGE
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  const difference = end.getTime() - start.getTime();

  if (difference <= 0) return 0;

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const roomId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("room");
  }, [location.search]);

  useEffect(() => {
    let active = true;

    async function loadRoom() {
      if (!roomId) {
        setLoadingRoom(false);
        setRoomError("No room was selected for this booking.");
        return;
      }

      try {
        setLoadingRoom(true);
        setRoomError("");

        const response = await getRoom(roomId);

        console.log("Room API response:", response);

        const normalized = normalizeRoomResponse(response);

        console.log("Normalized room:", normalized);
        console.log("Room price:", getRoomPrice(normalized));

        if (active) {
          setRoom(normalized);
        }
      } catch (error) {
        console.error("Failed to load room:", error);

        if (active) {
          setRoomError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load the selected room."
          );
        }
      } finally {
        if (active) {
          setLoadingRoom(false);
        }
      }
    }

    loadRoom();

    return () => {
      active = false;
    };
  }, [roomId]);

  const roomPrice = useMemo(() => getRoomPrice(room), [room]);

  const roomName = useMemo(() => getRoomName(room), [room]);

  const roomLocation = useMemo(() => getRoomLocation(room), [room]);

  const propertyImage = useMemo(() => getRoomImage(room), [room]);

  const nights = useMemo(
    () => calculateNights(form.checkIn, form.checkOut),
    [form.checkIn, form.checkOut]
  );

  const guestCount = Number(form.guests || 0);
  const roomCount = Number(form.rooms || 0);

  const total = useMemo(() => {
    if (!roomPrice || !nights || !roomCount) return 0;

    return roomPrice * nights * roomCount;
  }, [roomPrice, nights, roomCount]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (submitError) {
      setSubmitError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitError("");

    if (!roomId || !room) {
      setSubmitError("Please select a valid room before continuing.");
      return;
    }

    if (!form.firstName.trim()) {
      setSubmitError("Please enter your first name.");
      return;
    }

    if (!form.lastName.trim()) {
      setSubmitError("Please enter your last name.");
      return;
    }

    if (!form.email.trim()) {
      setSubmitError("Please enter your email address.");
      return;
    }

    if (!form.phone.trim()) {
      setSubmitError("Please enter your phone number.");
      return;
    }

    if (guestCount < 1 || guestCount > 20) {
      setSubmitError("Guests must be between 1 and 20.");
      return;
    }

    if (roomCount < 1 || roomCount > 10) {
      setSubmitError("Rooms must be between 1 and 10.");
      return;
    }

    if (!form.checkIn) {
      setSubmitError("Please select your check-in date.");
      return;
    }

    if (!form.checkOut) {
      setSubmitError("Please select your check-out date.");
      return;
    }

    if (nights <= 0) {
      setSubmitError("Check-out date must be after check-in date.");
      return;
    }

    if (roomPrice <= 0) {
      setSubmitError("The selected room does not have a valid price.");
      return;
    }

    if (!form.roomType) {
      setSubmitError("Please select a room type.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        room: roomId,
        guestName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        phone: `${form.countryCode}${form.phone.trim()}`,
        guests: guestCount,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        countryCode: form.countryCode,
        passportNumber: form.passportNumber.trim(),
        citizenshipNumber: form.citizenshipNumber.trim(),
        nationality: form.nationality.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        rooms: roomCount,
        roomType: form.roomType,
        paymentMethod: "pay_at_hotel",
      };

      console.log("Booking payload:", payload);

      const response = await fetch(BOOKINGS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            responseText ||
            "Unable to complete the booking."
        );
      }

      const booking =
        data?.booking ||
        data?.data ||
        data?.result ||
        data ||
        {};

      const bookingReference =
        booking?.bookingReference ||
        data?.bookingReference ||
        "";

      console.log("Booking reference:", bookingReference);

      setConfirmation({
        bookingReference,
        guestName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        phone: `${form.countryCode}${form.phone.trim()}`,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: guestCount,
        rooms: roomCount,
        roomType: form.roomType,
        nights,
        total,
      });
    } catch (error) {
      console.error("Booking submission error:", error);

      setSubmitError(
        error?.message ||
          "Something went wrong while creating your booking."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleWhatsAppConfirmation() {
    if (!confirmation) return;

       const message = `
Hello Backpacker Gateways,

I have made a booking through Backpacker Gateways and would like to proceed with the next steps to secure my reservation.

Booking Reference: ${confirmation.bookingReference || "Pending"}

Guest Name: ${confirmation.guestName}
Email: ${confirmation.email}
Phone: ${confirmation.phone}

Property: ${roomName}
Location: ${roomLocation}

Room Type: ${confirmation.roomType}
Check-in: ${formatDate(confirmation.checkIn)}
Check-out: ${formatDate(confirmation.checkOut)}
Guests: ${confirmation.guests}
Rooms: ${confirmation.rooms}
Nights: ${confirmation.nights}

Total: ${formatCurrency(confirmation.total)}

Payment Method: Pay at hotel.

Please let me know the next steps to confirm and secure my booking.

Thank you,
${confirmation.guestName}
`.trim();
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (loadingRoom) {
    return (
      <div className="booking-page booking-loading-page">
        <div className="booking-loading-card">
          <div className="loading-spinner" />
          <h2>Preparing your reservation</h2>
          <p>Please wait while we load your selected property.</p>
        </div>
      </div>
    );
  }

  if (roomError && !room) {
    return (
      <div className="booking-page">
        <header className="booking-header">
          <div className="booking-header-inner">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>

            <div className="booking-brand">
              <span className="brand-dot" />
              <span>BACKPACKER GATEWAYS</span>
            </div>
          </div>
        </header>

        <main className="booking-error-page">
          <div className="booking-error-card">
            <div className="error-icon">!</div>
            <h1>Unable to load this property</h1>
            <p>{roomError}</p>

            <button
              type="button"
              className="primary-action"
              onClick={() => navigate(-1)}
            >
              Back to property
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="booking-page">
        <header className="booking-header">
          <div className="booking-header-inner">
            <div className="booking-brand">
              <span className="brand-dot" />
              <span>BACKPACKER GATEWAYS</span>
            </div>
          </div>
        </header>

        <main className="confirmation-page">
          <div className="confirmation-card">
            <div className="success-icon">✓</div>

            <span className="confirmation-eyebrow">
              RESERVATION RECEIVED
            </span>

            <h1>Your booking is confirmed</h1>

            <p className="confirmation-intro">
              Thank you, {confirmation.guestName}. Your reservation request
              has been successfully received.
            </p>

            <div className="confirmation-contact-note">
              <strong>
                Our Customer Operations Manager will contact you soon.
              </strong>

              <span>
                We will reach out to you shortly to confirm the details of
                your stay and assist you with the next steps.
              </span>
            </div>

            <div className="confirmation-id">
              <span>Booking reference</span>
              <strong>
                {confirmation.bookingReference || "Pending"}
              </strong>
            </div>

            <div className="confirmation-summary">
              <div className="confirmation-property">
                <img src={propertyImage} alt={roomName} />

                <div>
                  <h2>{roomName}</h2>
                  <p>{roomLocation}</p>
                </div>
              </div>

              <div className="confirmation-grid">
                <div>
                  <span>Check-in</span>
                  <strong>{formatDate(confirmation.checkIn)}</strong>
                </div>

                <div>
                  <span>Check-out</span>
                  <strong>{formatDate(confirmation.checkOut)}</strong>
                </div>

                <div>
                  <span>Guests</span>
                  <strong>{confirmation.guests}</strong>
                </div>

                <div>
                  <span>Rooms</span>
                  <strong>{confirmation.rooms}</strong>
                </div>

                <div>
                  <span>Room type</span>
                  <strong>
                    {confirmation.roomType
                      ? confirmation.roomType.charAt(0).toUpperCase() +
                        confirmation.roomType.slice(1)
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="confirmation-total">
                <span>Total stay</span>
                <strong>{formatCurrency(confirmation.total)}</strong>
              </div>
            </div>

            <div className="confirmation-actions">
              <button
                type="button"
                className="whatsapp-button"
                onClick={handleWhatsAppConfirmation}
              >
                Confirm via WhatsApp
              </button>

              <button
                type="button"
                className="secondary-action"
                onClick={() => navigate("/rooms")}
              >
                Browse more properties
              </button>
            </div>

            <p className="confirmation-note">
              Payment method: <strong>Pay at hotel</strong>
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <header className="booking-header">
        <div className="booking-header-inner">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back to property
          </button>

          <div className="booking-brand">
            <span className="brand-dot" />
            <span>BACKPACKER GATEWAYS</span>
          </div>
        </div>
      </header>

      <main className="booking-container">
        <div className="booking-intro">
          <div className="intro-content">
            <span className="intro-eyebrow">RESERVE YOUR STAY</span>

            <h1>Complete your booking</h1>

            <p>
              Enter your details below to secure your stay in Nepal.
            </p>
          </div>
        </div>

        <div className="booking-grid">
          <form className="booking-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">GUEST DETAILS</span>
                  <h2>Tell us who will be staying</h2>
                </div>
              </div>

              <div className="form-grid two-columns">
                <div className="field">
                  <label htmlFor="firstName">
                    First name <span>*</span>
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Your first name"
                    autoComplete="given-name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="lastName">
                    Last name <span>*</span>
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Your last name"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="form-grid two-columns">
                <div className="field">
                  <label htmlFor="email">
                    Email address <span>*</span>
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
                </div>

                <div className="field">
                  <label htmlFor="phone">
                    WhatsApp / phone <span>*</span>
                  </label>

                  <div className="phone-input">
                    <select
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleChange}
                      aria-label="Country code"
                    >
                      {COUNTRY_CODES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code}
                        </option>
                      ))}
                    </select>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">
                    TRAVELLER INFORMATION
                  </span>
                  <h2>Travel document details</h2>
                </div>
              </div>

              <div className="form-grid two-columns">
                <div className="field">
                  <label htmlFor="passportNumber">
                    Passport number{" "}
                    <span className="optional-label">Optional</span>
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

                <div className="field">
                  <label htmlFor="citizenshipNumber">
                    Citizenship number{" "}
                    <span className="optional-label">Optional</span>
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
              </div>

              <div className="form-grid two-columns">
                <div className="field">
                  <label htmlFor="nationality">Nationality</label>

                  <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    value={form.nationality}
                    onChange={handleChange}
                    placeholder="e.g. American"
                    autoComplete="country-name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="city">City</label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Your city"
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="address">Address</label>

                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Your current address"
                  rows="3"
                  autoComplete="street-address"
                />
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">YOUR STAY</span>
                  <h2>Choose your dates and guests</h2>
                </div>
              </div>

              <div className="form-grid two-columns">
                <div className="field">
                  <label htmlFor="checkIn">
                    Check-in <span>*</span>
                  </label>

                  <input
                    id="checkIn"
                    name="checkIn"
                    type="date"
                    value={form.checkIn}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="field">
                  <label htmlFor="checkOut">
                    Check-out <span>*</span>
                  </label>

                  <input
                    id="checkOut"
                    name="checkOut"
                    type="date"
                    value={form.checkOut}
                    onChange={handleChange}
                    min={
                      form.checkIn ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
              </div>

              {/* ROOM TYPE */}
              <div className="field full-width">
                <label htmlFor="roomType">
                  Room type <span>*</span>
                </label>

                <select
                  id="roomType"
                  name="roomType"
                  value={form.roomType}
                  onChange={handleChange}
                >
                  <option value="">Select room type</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="twin">Twin</option>
                </select>
              </div>

              <div className="form-grid two-columns">
                <div className="field">
                  <label htmlFor="guests">
                    Guests <span>*</span>
                  </label>

                  <input
                    id="guests"
                    name="guests"
                    type="number"
                    min="1"
                    max="20"
                    value={form.guests}
                    onChange={handleChange}
                  />

                  <small>Maximum 20 guests</small>
                </div>

                <div className="field">
                  <label htmlFor="rooms">
                    Rooms <span>*</span>
                  </label>

                  <input
                    id="rooms"
                    name="rooms"
                    type="number"
                    min="1"
                    max="10"
                    value={form.rooms}
                    onChange={handleChange}
                  />

                  <small>Maximum 10 rooms</small>
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">PAYMENT</span>
                  <h2>Payment method</h2>
                </div>
              </div>

              <div className="payment-option active">
                <div className="payment-radio">
                  <span />
                </div>

                <div className="payment-content">
                  <strong>Pay at hotel</strong>

                  <p>
                    Complete your reservation now and pay directly at
                    the property during your stay.
                  </p>
                </div>

                <div className="payment-badge">SELECTED</div>
              </div>
            </section>

            {submitError && (
              <div className="form-error" role="alert">
                <span>!</span>
                <p>{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="button-spinner" />
                  Processing reservation...
                </>
              ) : (
                <>
                  Complete reservation
                  <span>→</span>
                </>
              )}
            </button>

            <p className="secure-note">
              By completing this reservation, you agree to our booking
              terms and property policies.
            </p>
          </form>

          <aside className="booking-sidebar">
            <div className="property-card">
              <div className="property-image-wrapper">
                <img
                  src={propertyImage}
                  alt={roomName}
                  className="property-image"
                />

                <span className="property-label">
                  YOUR PROPERTY
                </span>
              </div>

              <div className="property-card-content">
                <span className="property-location">
                  {roomLocation}
                </span>

                <h2>{roomName}</h2>

                <div className="property-divider" />

                <div className="stay-preview">
                  <div>
                    <span>Check-in</span>
                    <strong>
                      {formatDate(form.checkIn)}
                    </strong>
                  </div>

                  <div className="stay-arrow">→</div>

                  <div>
                    <span>Check-out</span>
                    <strong>
                      {formatDate(form.checkOut)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="price-card">
              <div className="price-card-header">
                <h2>Price summary</h2>
              </div>

              <div className="price-row">
                <span>
                  {formatCurrency(roomPrice)} × {nights || 0}{" "}
                  {nights === 1 ? "night" : "nights"}
                </span>

                <strong>
                  {formatCurrency(roomPrice * (nights || 0))}
                </strong>
              </div>

              <div className="price-row">
                <span>
                  {roomCount} {roomCount === 1 ? "room" : "rooms"}
                </span>

                <strong>
                  {formatCurrency(
                    roomPrice * (nights || 0) * roomCount
                  )}
                </strong>
              </div>

              <div className="price-divider" />

              <div className="total-row">
                <div>
                  <span>Total</span>
                  <small>Pay at hotel</small>
                </div>

                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            <div className="trust-card">
              <div className="trust-item">
                <span className="trust-icon">✓</span>

                <div>
                  <strong>Secure reservation</strong>
                  <p>Your information is protected.</p>
                </div>
              </div>

              <div className="trust-item">
                <span className="trust-icon">✓</span>

                <div>
                  <strong>Pay at hotel</strong>
                  <p>No online payment required.</p>
                </div>
              </div>

              <div className="trust-item">
                <span className="trust-icon">✓</span>

                <div>
                  <strong>Local support</strong>
                  <p>We're here during your Nepal journey.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}