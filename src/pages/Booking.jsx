import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoom } from "../services/roomApi";

const BOOKINGS_API =
  "https://backpacker-gateways-2.onrender.com/api/bookings";

const WHATSAPP_NUMBER =
  import.meta.env.VITE_BOOKING_WHATSAPP || "9779800000000";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85";

const COUNTRY_CODES = [
  { code: "+977", name: "Nepal" },
  { code: "+1", name: "United States" },
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
  { code: "+971", name: "UAE" },
  { code: "+65", name: "Singapore" },
  { code: "+64", name: "New Zealand" },
  { code: "+7", name: "Russia" },
  { code: "+55", name: "Brazil" },
  { code: "+27", name: "South Africa" },
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
};

const normalizeRoomResponse = (data) => {
  if (!data) return null;

  // Direct room:
  // { _id, name, price }
  if (data?._id || data?.id) {
    return data;
  }

  // { room: { _id, name, price } }
  if (data?.room?._id || data?.room?.id) {
    return data.room;
  }

  // { data: { _id, name, price } }
  if (data?.data?._id || data?.data?.id) {
    return data.data;
  }

  // { data: { room: {...} } }
  if (data?.data?.room?._id || data?.data?.room?.id) {
    return data.data.room;
  }

  // Last fallback
  return data?.room || data?.data || data;
};

const getRoomPrice = (room) => {
  if (!room) return 0;

  const possiblePrices = [
    room.price,
    room.roomPrice,
    room.nightlyPrice,
    room.pricePerNight,
    room.pricing?.price,
    room.pricing?.nightly,
    room.pricing?.pricePerNight,
  ];

  for (const value of possiblePrices) {
    if (value !== undefined && value !== null && value !== "") {
      const number = Number(
        String(value).replace(/[^0-9.-]/g, "")
      );

      if (Number.isFinite(number) && number > 0) {
        return number;
      }
    }
  }

  return 0;
};

const getRoomName = (room) => {
  return (
    room?.name ||
    room?.roomName ||
    room?.title ||
    room?.roomType ||
    "Luxury Room"
  );
};

const getRoomLocation = (room) => {
  return (
    room?.location ||
    room?.city ||
    room?.destination ||
    room?.address ||
    "Nepal"
  );
};

const getRoomImage = (room) => {
  if (!room) return FALLBACK_IMAGE;

  if (Array.isArray(room.images) && room.images.length > 0) {
    return room.images[0];
  }

  if (Array.isArray(room.photos) && room.photos.length > 0) {
    return room.photos[0];
  }

  return (
    room.image ||
    room.imageUrl ||
    room.coverImage ||
    room.thumbnail ||
    FALLBACK_IMAGE
  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  const difference = end.getTime() - start.getTime();
  const nights = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  return nights > 0 ? nights : 0;
};

const formatDate = (date) => {
  if (!date) return "—";

  const value = new Date(`${date}T00:00:00`);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const roomId = params.get("room");

  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState("");

  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // ==========================================
  // LOAD ROOM
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const loadRoom = async () => {
      if (!roomId) {
        setRoomError("No room was selected for booking.");
        setLoadingRoom(false);
        return;
      }

      try {
        setLoadingRoom(true);
        setRoomError("");

        const data = await getRoom(roomId);

        console.log(
          "========== BOOKING ROOM API =========="
        );
        console.log("FULL RESPONSE:", data);
        console.log("DIRECT PRICE:", data?.price);
        console.log(
          "ROOM PRICE:",
          data?.room?.price
        );
        console.log(
          "DATA PRICE:",
          data?.data?.price
        );
        console.log(
          "DATA ROOM PRICE:",
          data?.data?.room?.price
        );
        console.log(
          "======================================"
        );

        const normalizedRoom =
          normalizeRoomResponse(data);

        console.log(
          "NORMALIZED ROOM:",
          normalizedRoom
        );
        console.log(
          "FINAL ROOM PRICE:",
          getRoomPrice(normalizedRoom)
        );

        if (mounted) {
          setRoom(normalizedRoom);
        }
      } catch (err) {
        console.error("Failed to load room:", err);

        if (mounted) {
          setRoomError(
            err?.message ||
              "Unable to load this room. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoadingRoom(false);
        }
      }
    };

    loadRoom();

    return () => {
      mounted = false;
    };
  }, [roomId]);

  // ==========================================
  // ROOM DATA
  // ==========================================

  const roomPrice = useMemo(() => {
    return getRoomPrice(room);
  }, [room]);

  const roomName = useMemo(() => {
    return getRoomName(room);
  }, [room]);

  const roomLocation = useMemo(() => {
    return getRoomLocation(room);
  }, [room]);

  const propertyImage = useMemo(() => {
    return getRoomImage(room);
  }, [room]);

  const nights = useMemo(() => {
    return calculateNights(
      form.checkIn,
      form.checkOut
    );
  }, [form.checkIn, form.checkOut]);

  const guestCount = Number(form.guests || 1);
  const roomCount = Number(form.rooms || 1);

  const total = useMemo(() => {
    if (!roomPrice || !nights) return 0;

    return (
      roomPrice *
      nights *
      roomCount
    );
  }, [roomPrice, nights, roomCount]);

  // ==========================================
  // INPUT HANDLER
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ==========================================
  // SUBMIT BOOKING
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const phoneDigits = form.phone.replace(/\D/g, "");

    const guests = Number(form.guests);
    const rooms = Number(form.rooms);

    if (!room?._id && !room?.id) {
      setError(
        "Room information is unavailable. Please reload the page."
      );
      return;
    }

    if (!firstName) {
      setError("Please enter your first name.");
      return;
    }

    if (!lastName) {
      setError("Please enter your last name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (phoneDigits.length < 6) {
      setError(
        "Please enter a valid WhatsApp / phone number."
      );
      return;
    }

    if (!guests || guests < 1 || guests > 20) {
      setError(
        "Guests must be between 1 and 20."
      );
      return;
    }

    if (!rooms || rooms < 1 || rooms > 10) {
      setError(
        "Rooms must be between 1 and 10."
      );
      return;
    }

    if (!form.checkIn) {
      setError("Please select your check-in date.");
      return;
    }

    if (!form.checkOut) {
      setError("Please select your check-out date.");
      return;
    }

    const calculatedNights = calculateNights(
      form.checkIn,
      form.checkOut
    );

    if (calculatedNights <= 0) {
      setError(
        "Check-out must be after check-in."
      );
      return;
    }

    if (!roomPrice || roomPrice <= 0) {
      setError(
        "Room price could not be loaded. Please refresh the page and try again."
      );
      return;
    }

    try {
      setSubmitting(true);

      const roomReference =
        room._id || room.id;

      const payload = {
        room: roomReference,

        guestName:
          `${firstName} ${lastName}`.trim(),

        email,

        phone:
          `${form.countryCode}${phoneDigits}`,

        guests,

        checkIn: form.checkIn,

        checkOut: form.checkOut,

        firstName,

        lastName,

        countryCode: form.countryCode,

        passportNumber:
          form.passportNumber.trim(),

        citizenshipNumber:
          form.citizenshipNumber.trim(),

        nationality:
          form.nationality.trim(),

        city: form.city.trim(),

        address:
          form.address.trim(),

        rooms,

        paymentMethod: "pay_at_hotel",
      };

      console.log(
        "========== BOOKING PAYLOAD =========="
      );
      console.log(payload);
      console.log(
        "======================================"
      );

      const response = await fetch(
        BOOKINGS_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Booking failed (${response.status})`
        );
      }

      const bookingId =
        data?.booking?._id ||
        data?.booking?.id ||
        data?._id ||
        data?.id ||
        data?.bookingId ||
        data?.reference ||
        "";

      setConfirmation({
        bookingId,
        guestName:
          `${firstName} ${lastName}`.trim(),
        email,
        phone:
          `${form.countryCode}${phoneDigits}`,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests,
        rooms,
        nights: calculatedNights,
        total:
          roomPrice *
          calculatedNights *
          rooms,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Booking submission error:",
        err
      );

      setError(
        err?.message ||
          "We could not complete your booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // WHATSAPP
  // ==========================================

  const handleWhatsApp = () => {
    if (!confirmation) return;

    const message = [
      "Hello Backpacker Gateways,",
      "",
      "I have completed a booking request.",
      "",
      `Guest: ${confirmation.guestName}`,
      `Room: ${roomName}`,
      `Check-in: ${formatDate(
        confirmation.checkIn
      )}`,
      `Check-out: ${formatDate(
        confirmation.checkOut
      )}`,
      `Guests: ${confirmation.guests}`,
      `Rooms: ${confirmation.rooms}`,
      `Nights: ${confirmation.nights}`,
      `Total: ${formatCurrency(
        confirmation.total
      )}`,
      confirmation.bookingId
        ? `Booking ID: ${confirmation.bookingId}`
        : "",
      "",
      "Please confirm my reservation.",
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingRoom) {
    return (
      <>
        <style>{styles}</style>

        <div className="booking-page">
          <header className="booking-header">
            <div className="booking-header-inner">
              <button
                className="brand-button"
                onClick={() => navigate("/")}
              >
                <span className="brand-mark">
                  BG
                </span>

                <span>
                  <strong>
                    Backpacker Gateways
                  </strong>
                  <small>
                    Explore Nepal
                  </small>
                </span>
              </button>
            </div>
          </header>

          <main className="booking-loading">
            <div className="loading-spinner" />

            <h2>
              Preparing your booking
            </h2>

            <p>
              We're securely loading the
              selected property.
            </p>
          </main>
        </div>
      </>
    );
  }

  // ==========================================
  // ROOM ERROR
  // ==========================================

  if (roomError || !room) {
    return (
      <>
        <style>{styles}</style>

        <div className="booking-page">
          <header className="booking-header">
            <div className="booking-header-inner">
              <button
                className="brand-button"
                onClick={() => navigate("/")}
              >
                <span className="brand-mark">
                  BG
                </span>

                <span>
                  <strong>
                    Backpacker Gateways
                  </strong>
                  <small>
                    Explore Nepal
                  </small>
                </span>
              </button>
            </div>
          </header>

          <main className="booking-error-page">
            <div className="error-icon">
              !
            </div>

            <h1>
              Unable to load this room
            </h1>

            <p>
              {roomError ||
                "The selected property could not be found."}
            </p>

            <div className="error-actions">
              <button
                className="primary-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  navigate("/rooms")
                }
              >
                Browse Rooms
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  // ==========================================
  // CONFIRMATION
  // ==========================================

  if (confirmation) {
    return (
      <>
        <style>{styles}</style>

        <div className="booking-page">
          <header className="booking-header">
            <div className="booking-header-inner">
              <button
                className="brand-button"
                onClick={() => navigate("/")}
              >
                <span className="brand-mark">
                  BG
                </span>

                <span>
                  <strong>
                    Backpacker Gateways
                  </strong>
                  <small>
                    Explore Nepal
                  </small>
                </span>
              </button>
            </div>
          </header>

          <main className="confirmation-page">
            <section className="confirmation-card">
              <div className="success-icon">
                ✓
              </div>

              <div className="confirmation-heading">
                <span className="eyebrow">
                  BOOKING REQUEST RECEIVED
                </span>

                <h1>
                  Thank you,{" "}
                  {confirmation.guestName}.
                </h1>

                <p>
                  Your booking request has been
                  successfully submitted. Our
                  team will contact you to confirm
                  the reservation.
                </p>
              </div>

              {confirmation.bookingId && (
                <div className="booking-reference">
                  <span>
                    Booking reference
                  </span>

                  <strong>
                    {confirmation.bookingId}
                  </strong>
                </div>
              )}

              <div className="confirmation-layout">
                <div className="confirmation-property">
                  <img
                    src={propertyImage}
                    alt={roomName}
                  />

                  <div>
                    <span className="property-label">
                      YOUR PROPERTY
                    </span>

                    <h2>{roomName}</h2>

                    <p>
                      {roomLocation}
                    </p>
                  </div>
                </div>

                <div className="confirmation-details">
                  <div className="detail-row">
                    <span>Check-in</span>
                    <strong>
                      {formatDate(
                        confirmation.checkIn
                      )}
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>Check-out</span>
                    <strong>
                      {formatDate(
                        confirmation.checkOut
                      )}
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>Guests</span>
                    <strong>
                      {confirmation.guests}
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>Rooms</span>
                    <strong>
                      {confirmation.rooms}
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>Nights</span>
                    <strong>
                      {confirmation.nights}
                    </strong>
                  </div>

                  <div className="detail-row total-row">
                    <span>Total</span>
                    <strong>
                      {formatCurrency(
                        confirmation.total
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="confirmation-contact">
                <div>
                  <span>Email</span>
                  <strong>
                    {confirmation.email}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {confirmation.phone}
                  </strong>
                </div>
              </div>

              <div className="confirmation-actions">
                <button
                  className="whatsapp-button"
                  onClick={handleWhatsApp}
                >
                  <span className="whatsapp-icon">
                    W
                  </span>

                  Continue on WhatsApp
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate("/rooms")
                  }
                >
                  Browse More Hotels
                </button>
              </div>
            </section>
          </main>

          <footer className="booking-footer">
            <p>
              © {new Date().getFullYear()}{" "}
              Backpacker Gateways. All rights
              reserved.
            </p>
          </footer>
        </div>
      </>
    );
  }

  // ==========================================
  // MAIN BOOKING PAGE
  // ==========================================

  return (
    <>
      <style>{styles}</style>

      <div className="booking-page">
        {/* HEADER */}
        <header className="booking-header">
          <div className="booking-header-inner">
            <button
              className="brand-button"
              onClick={() => navigate("/")}
              aria-label="Back to homepage"
            >
              <span className="brand-mark">
                BG
              </span>

              <span className="brand-copy">
                <strong>
                  Backpacker Gateways
                </strong>

                <small>
                  Explore Nepal
                </small>
              </span>
            </button>

            <div className="secure-label">
              <span className="lock-icon">
                ✓
              </span>

              <span>
                Secure booking
              </span>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="booking-container">
          {/* TOP */}
          <section className="booking-intro">
            <button
              className="back-link"
              onClick={() =>
                navigate(-1)
              }
            >
              <span>←</span>
              Back to property
            </button>

            <div className="intro-content">
              <span className="eyebrow">
                RESERVE YOUR STAY
              </span>

              <h1>
                Complete your booking
              </h1>

              <p>
                Enter your details below to
                secure your stay in Nepal.
              </p>
            </div>
          </section>

          <div className="booking-grid">
            {/* LEFT FORM */}
            <form
              className="booking-form-card"
              onSubmit={handleSubmit}
            >
              {/* PERSONAL DETAILS */}
              <section className="form-section">
                <div className="section-heading">
                  <div className="section-number">
                    01
                  </div>

                  <div>
                    <h2>
                      Guest details
                    </h2>

                    <p>
                      Tell us who will be
                      staying.
                    </p>
                  </div>
                </div>

                <div className="form-grid two-columns">
                  <div className="field">
                    <label htmlFor="firstName">
                      First name{" "}
                      <span>*</span>
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Michael"
                      autoComplete="given-name"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="lastName">
                      Last name{" "}
                      <span>*</span>
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Carter"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="form-grid two-columns">
                  <div className="field">
                    <label htmlFor="email">
                      Email address{" "}
                      <span>*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="michael@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">
                      WhatsApp / phone{" "}
                      <span>*</span>
                    </label>

                    <div className="phone-input">
                      <select
                        name="countryCode"
                        value={
                          form.countryCode
                        }
                        onChange={
                          handleChange
                        }
                        aria-label="Country code"
                      >
                        {COUNTRY_CODES.map(
                          (country) => (
                            <option
                              key={
                                country.code
                              }
                              value={
                                country.code
                              }
                            >
                              {country.code}
                            </option>
                          )
                        )}
                      </select>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="9800000000"
                        autoComplete="tel"
                        inputMode="tel"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* TRAVEL DOCUMENTS */}
              <section className="form-section">
                <div className="section-heading">
                  <div className="section-number">
                    02
                  </div>

                  <div>
                    <h2>
                      Traveller information
                    </h2>

                    <p>
                      Additional information
                      for your reservation.
                    </p>
                  </div>
                </div>

                <div className="form-grid two-columns">
                  <div className="field">
                    <label htmlFor="nationality">
                      Nationality
                    </label>

                    <input
                      id="nationality"
                      name="nationality"
                      type="text"
                      value={
                        form.nationality
                      }
                      onChange={handleChange}
                      placeholder="American"
                      autoComplete="country-name"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="city">
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="New York"
                      autoComplete="address-level2"
                    />
                  </div>
                </div>

                <div className="form-grid two-columns">
                  <div className="field">
                    <label htmlFor="passportNumber">
                      Passport number
                    </label>

                    <input
                      id="passportNumber"
                      name="passportNumber"
                      type="text"
                      value={
                        form.passportNumber
                      }
                      onChange={handleChange}
                      placeholder="Passport number"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="citizenshipNumber">
                      Citizenship number
                    </label>

                    <input
                      id="citizenshipNumber"
                      name="citizenshipNumber"
                      type="text"
                      value={
                        form.citizenshipNumber
                      }
                      onChange={handleChange}
                      placeholder="Citizenship number"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="address">
                    Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Your residential address"
                    rows="3"
                    autoComplete="street-address"
                  />
                </div>
              </section>

              {/* STAY DETAILS */}
              <section className="form-section">
                <div className="section-heading">
                  <div className="section-number">
                    03
                  </div>

                  <div>
                    <h2>
                      Your stay
                    </h2>

                    <p>
                      Select your dates and
                      number of guests.
                    </p>
                  </div>
                </div>

                <div className="form-grid two-columns">
                  <div className="field">
                    <label htmlFor="checkIn">
                      Check-in{" "}
                      <span>*</span>
                    </label>

                    <input
                      id="checkIn"
                      name="checkIn"
                      type="date"
                      value={form.checkIn}
                      onChange={handleChange}
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="checkOut">
                      Check-out{" "}
                      <span>*</span>
                    </label>

                    <input
                      id="checkOut"
                      name="checkOut"
                      type="date"
                      value={form.checkOut}
                      onChange={handleChange}
                      min={
                        form.checkIn ||
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                    />
                  </div>
                </div>

                <div className="form-grid two-columns">
                  <div className="field">
                    <label htmlFor="guests">
                      Guests
                    </label>

                    <select
                      id="guests"
                      name="guests"
                      value={form.guests}
                      onChange={handleChange}
                    >
                      {Array.from(
                        { length: 20 },
                        (_, index) =>
                          index + 1
                      ).map((number) => (
                        <option
                          key={number}
                          value={number}
                        >
                          {number}{" "}
                          {number === 1
                            ? "guest"
                            : "guests"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="rooms">
                      Rooms
                    </label>

                    <select
                      id="rooms"
                      name="rooms"
                      value={form.rooms}
                      onChange={handleChange}
                    >
                      {Array.from(
                        { length: 10 },
                        (_, index) =>
                          index + 1
                      ).map((number) => (
                        <option
                          key={number}
                          value={number}
                        >
                          {number}{" "}
                          {number === 1
                            ? "room"
                            : "rooms"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* PAYMENT */}
              <section className="form-section payment-section">
                <div className="section-heading">
                  <div className="section-number">
                    04
                  </div>

                  <div>
                    <h2>
                      Payment
                    </h2>

                    <p>
                      No online payment is
                      required now.
                    </p>
                  </div>
                </div>

                <div className="payment-option active">
                  <div className="payment-radio">
                    <span />
                  </div>

                  <div className="payment-copy">
                    <strong>
                      Pay at hotel
                    </strong>

                    <span>
                      Payment will be settled
                      directly with the property.
                    </span>
                  </div>

                  <div className="payment-badge">
                    FREE
                  </div>
                </div>
              </section>

              {/* ERROR */}
              {error && (
                <div className="form-error">
                  <span>!</span>

                  <div>
                    <strong>
                      Booking could not be
                      completed
                    </strong>

                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* SUBMIT */}
              <div className="submit-area">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="button-spinner" />
                      Processing booking...
                    </>
                  ) : (
                    <>
                      Confirm booking
                      <span>→</span>
                    </>
                  )}
                </button>

                <p className="submit-note">
                  By continuing, you agree to
                  our booking terms and property
                  policies.
                </p>
              </div>
            </form>

            {/* RIGHT SIDEBAR */}
            <aside className="booking-sidebar">
              <div className="property-card">
                <div className="property-image-wrap">
                  <img
                    src={propertyImage}
                    alt={roomName}
                    onError={(event) => {
                      event.currentTarget.src =
                        FALLBACK_IMAGE;
                    }}
                  />

                  <span className="property-tag">
                    PREMIUM STAY
                  </span>
                </div>

                <div className="property-card-body">
                  <span className="property-label">
                    SELECTED PROPERTY
                  </span>

                  <h2>{roomName}</h2>

                  <p className="property-location">
                    <span>●</span>
                    {roomLocation}
                  </p>

                  <div className="property-divider" />

                  <div className="price-line">
                    <div>
                      <span>
                        Nightly rate
                      </span>

                      <strong>
                        {roomPrice > 0
                          ? formatCurrency(
                              roomPrice
                            )
                          : "Price unavailable"}
                      </strong>
                    </div>

                    <small>
                      per room / night
                    </small>
                  </div>
                </div>
              </div>

              {/* PRICE SUMMARY */}
              <div className="price-summary">
                <div className="summary-heading">
                  <h3>
                    Price summary
                  </h3>

                  <span>
                    {nights > 0
                      ? `${nights} ${
                          nights === 1
                            ? "night"
                            : "nights"
                        }`
                      : "Select dates"}
                  </span>
                </div>

                {roomPrice > 0 &&
                  nights > 0 && (
                    <>
                      <div className="summary-row">
                        <span>
                          {formatCurrency(
                            roomPrice
                          )}{" "}
                          × {nights} nights
                        </span>

                        <strong>
                          {formatCurrency(
                            roomPrice *
                              nights
                          )}
                        </strong>
                      </div>

                      {roomCount > 1 && (
                        <div className="summary-row">
                          <span>
                            × {roomCount} rooms
                          </span>

                          <strong>
                            {formatCurrency(
                              roomPrice *
                                nights *
                                roomCount
                            )}
                          </strong>
                        </div>
                      )}
                    </>
                  )}

                <div className="summary-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    {total > 0
                      ? formatCurrency(total)
                      : "—"}
                  </strong>
                </div>

                <p className="price-note">
                  Taxes and property charges may
                  be collected according to the
                  property's policy.
                </p>
              </div>

              {/* TRUST */}
              <div className="trust-card">
                <div className="trust-heading">
                  <span className="shield">
                    ✓
                  </span>

                  <strong>
                    Book with confidence
                  </strong>
                </div>

                <div className="trust-item">
                  <span>✓</span>

                  <div>
                    <strong>
                      Secure booking
                    </strong>

                    <small>
                      Your information is
                      transmitted securely.
                    </small>
                  </div>
                </div>

                <div className="trust-item">
                  <span>✓</span>

                  <div>
                    <strong>
                      Local support
                    </strong>

                    <small>
                      Our Nepal-based team is
                      here to help.
                    </small>
                  </div>
                </div>

                <div className="trust-item">
                  <span>✓</span>

                  <div>
                    <strong>
                      Pay at property
                    </strong>

                    <small>
                      No online payment required
                      for this booking.
                    </small>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="booking-footer">
          <p>
            © {new Date().getFullYear()}{" "}
            Backpacker Gateways. All rights
            reserved.
          </p>

          <div>
            <span>
              Nepal
            </span>

            <span>•</span>

            <span>
              Secure reservations
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

// ==========================================
// STYLES
// ==========================================

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  .booking-page {
    min-height: 100vh;
    background: #f5f7fa;
    color: #172b4d;
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  /* ========================================
     HEADER
  ======================================== */

  .booking-header {
    background: #ffffff;
    border-bottom: 1px solid #e6eaf0;
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .booking-header-inner {
    width: min(1240px, calc(100% - 40px));
    margin: 0 auto;
    min-height: 76px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand-button {
    border: 0;
    background: transparent;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #102a43;
    text-align: left;
  }

  .brand-mark {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: #102a43;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-family: Manrope, sans-serif;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .brand-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .brand-copy strong {
    font-family: Manrope, sans-serif;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.25px;
  }

  .brand-copy small {
    color: #728197;
    font-size: 11px;
    font-weight: 500;
  }

  .secure-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #637083;
    font-size: 12px;
    font-weight: 600;
  }

  .lock-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #e8f5ef;
    color: #23855f;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 800;
  }

  /* ========================================
     CONTAINER
  ======================================== */

  .booking-container {
    width: min(1240px, calc(100% - 40px));
    margin: 0 auto;
    padding: 34px 0 70px;
  }

  .booking-intro {
    margin-bottom: 28px;
  }

  .back-link {
    border: 0;
    background: transparent;
    padding: 0;
    color: #52657d;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .back-link:hover {
    color: #2167d5;
  }

  .back-link span {
    font-size: 18px;
    line-height: 1;
  }

  .eyebrow {
    color: #b98a48;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
  }

  .intro-content h1 {
    margin: 7px 0 7px;
    color: #102a43;
    font-family: Manrope, sans-serif;
    font-size: clamp(28px, 4vw, 38px);
    line-height: 1.15;
    letter-spacing: -1.2px;
    font-weight: 800;
  }

  .intro-content p {
    margin: 0;
    color: #718096;
    font-size: 14px;
    line-height: 1.6;
  }

  /* ========================================
     GRID
  ======================================== */

  .booking-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 390px;
    gap: 26px;
    align-items: start;
  }

  /* ========================================
     FORM CARD
  ======================================== */

  .booking-form-card {
    background: #ffffff;
    border: 1px solid #e5e9ef;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(16, 42, 67, 0.05);
    overflow: hidden;
  }

  .form-section {
    padding: 30px;
    border-bottom: 1px solid #edf0f4;
  }

  .section-heading {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    margin-bottom: 25px;
  }

  .section-number {
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: #edf4ff;
    color: #2167d5;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 800;
  }

  .section-heading h2 {
    margin: 0 0 4px;
    color: #172b4d;
    font-family: Manrope, sans-serif;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }

  .section-heading p {
    margin: 0;
    color: #8491a3;
    font-size: 12px;
    line-height: 1.5;
  }

  .form-grid {
    display: grid;
    gap: 18px;
    margin-bottom: 18px;
  }

  .two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field {
    min-width: 0;
  }

  .field label {
    display: block;
    margin-bottom: 7px;
    color: #334e68;
    font-size: 12px;
    font-weight: 700;
  }

  .field label span {
    color: #c54b4b;
  }

  .field input,
  .field select,
  .field textarea {
    width: 100%;
    border: 1px solid #d9e0e8;
    border-radius: 9px;
    background: #ffffff;
    color: #172b4d;
    outline: none;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .field input,
  .field select {
    min-height: 46px;
    padding: 0 13px;
    font-size: 13px;
  }

  .field textarea {
    min-height: 88px;
    resize: vertical;
    padding: 12px 13px;
    line-height: 1.5;
    font-size: 13px;
  }

  .field input::placeholder,
  .field textarea::placeholder {
    color: #a4afbd;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    border-color: #6e9ee8;
    box-shadow:
      0 0 0 3px rgba(33, 103, 213, 0.09);
  }

  .phone-input {
    display: grid;
    grid-template-columns: 86px minmax(0, 1fr);
    gap: 7px;
  }

  .phone-input select {
    padding: 0 8px;
  }

  /* ========================================
     PAYMENT
  ======================================== */

  .payment-section {
    border-bottom: 0;
  }

  .payment-option {
    min-height: 74px;
    border: 1px solid #dbe3ec;
    border-radius: 11px;
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 14px 15px;
  }

  .payment-option.active {
    border-color: #8bb1ed;
    background: #f7faff;
  }

  .payment-radio {
    width: 19px;
    height: 19px;
    border: 2px solid #2167d5;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
  }

  .payment-radio span {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #2167d5;
  }

  .payment-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .payment-copy strong {
    color: #243b53;
    font-size: 13px;
  }

  .payment-copy span {
    color: #8190a3;
    font-size: 11px;
    line-height: 1.45;
  }

  .payment-badge {
    margin-left: auto;
    color: #24835e;
    background: #eaf7f1;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.7px;
  }

  /* ========================================
     ERROR
  ======================================== */

  .form-error {
    margin: 0 30px 22px;
    padding: 13px 15px;
    border: 1px solid #f0caca;
    background: #fff7f7;
    border-radius: 9px;
    display: flex;
    gap: 11px;
    color: #8f3434;
  }

  .form-error > span {
    width: 22px;
    height: 22px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: #f4d8d8;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 800;
  }

  .form-error strong {
    font-size: 12px;
  }

  .form-error p {
    margin: 3px 0 0;
    font-size: 11px;
    line-height: 1.5;
  }

  /* ========================================
     SUBMIT
  ======================================== */

  .submit-area {
    padding: 0 30px 30px;
  }

  .submit-button {
    width: 100%;
    min-height: 52px;
    border: 0;
    border-radius: 9px;
    background: #2167d5;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 13px;
    font-weight: 800;
    transition:
      transform 0.18s ease,
      background 0.18s ease,
      box-shadow 0.18s ease;
  }

  .submit-button:hover:not(:disabled) {
    background: #1758bd;
    box-shadow: 0 7px 18px rgba(33, 103, 213, 0.2);
    transform: translateY(-1px);
  }

  .submit-button:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .submit-button > span:last-child {
    font-size: 18px;
  }

  .button-spinner,
  .loading-spinner {
    border: 3px solid rgba(255,255,255,0.35);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .button-spinner {
    width: 16px;
    height: 16px;
  }

  .submit-note {
    margin: 10px 0 0;
    color: #8b98a8;
    text-align: center;
    font-size: 10px;
    line-height: 1.5;
  }

  /* ========================================
     SIDEBAR
  ======================================== */

  .booking-sidebar {
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: sticky;
    top: 98px;
  }

  .property-card,
  .price-summary,
  .trust-card {
    background: #ffffff;
    border: 1px solid #e5e9ef;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 7px 25px rgba(16, 42, 67, 0.045);
  }

  .property-image-wrap {
    height: 205px;
    position: relative;
    overflow: hidden;
    background: #e8edf3;
  }

  .property-image-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .property-tag {
    position: absolute;
    left: 14px;
    bottom: 14px;
    padding: 6px 9px;
    border-radius: 6px;
    background: rgba(16, 42, 67, 0.88);
    color: #ffffff;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .property-card-body {
    padding: 20px;
  }

  .property-label {
    color: #b98a48;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.2px;
  }

  .property-card-body h2 {
    margin: 7px 0 7px;
    color: #172b4d;
    font-family: Manrope, sans-serif;
    font-size: 18px;
    line-height: 1.25;
    letter-spacing: -0.4px;
  }

  .property-location {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #758398;
    font-size: 11px;
  }

  .property-location span {
    color: #b98a48;
    font-size: 8px;
  }

  .property-divider {
    height: 1px;
    background: #edf0f4;
    margin: 17px 0;
  }

  .price-line {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
  }

  .price-line > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .price-line span {
    color: #8290a2;
    font-size: 10px;
  }

  .price-line strong {
    color: #102a43;
    font-family: Manrope, sans-serif;
    font-size: 19px;
    font-weight: 800;
  }

  .price-line small {
    color: #8d99a8;
    font-size: 9px;
    padding-bottom: 2px;
  }

  /* ========================================
     PRICE SUMMARY
  ======================================== */

  .price-summary {
    padding: 20px;
  }

  .summary-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding-bottom: 15px;
    border-bottom: 1px solid #edf0f4;
  }

  .summary-heading h3 {
    margin: 0;
    color: #243b53;
    font-family: Manrope, sans-serif;
    font-size: 14px;
    font-weight: 800;
  }

  .summary-heading span {
    color: #8794a5;
    font-size: 10px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 13px 0 0;
    color: #748195;
    font-size: 11px;
  }

  .summary-row strong {
    color: #42556e;
    font-size: 11px;
    white-space: nowrap;
  }

  .summary-total {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #edf0f4;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .summary-total span {
    color: #344e68;
    font-size: 12px;
    font-weight: 700;
  }

  .summary-total strong {
    color: #102a43;
    font-family: Manrope, sans-serif;
    font-size: 21px;
    font-weight: 800;
  }

  .price-note {
    margin: 11px 0 0;
    color: #929dac;
    font-size: 9px;
    line-height: 1.5;
  }

  /* ========================================
     TRUST
  ======================================== */

  .trust-card {
    padding: 20px;
  }

  .trust-heading {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 17px;
    color: #243b53;
    font-size: 12px;
  }

  .shield {
    width: 27px;
    height: 27px;
    border-radius: 8px;
    background: #e9f6f0;
    color: #24835e;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 800;
  }

  .trust-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 11px 0;
    border-top: 1px solid #f0f2f5;
  }

  .trust-item > span {
    color: #268566;
    font-size: 11px;
    font-weight: 800;
    padding-top: 1px;
  }

  .trust-item div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .trust-item strong {
    color: #42556e;
    font-size: 10px;
  }

  .trust-item small {
    color: #8a97a7;
    font-size: 9px;
    line-height: 1.45;
  }

  /* ========================================
     FOOTER
  ======================================== */

  .booking-footer {
    min-height: 65px;
    border-top: 1px solid #e2e7ed;
    background: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 0 max(20px, calc((100% - 1240px) / 2));
    color: #8a97a7;
    font-size: 10px;
  }

  .booking-footer p {
    margin: 0;
  }

  .booking-footer div {
    display: flex;
    gap: 8px;
  }

  /* ========================================
     LOADING / ERROR
  ======================================== */

  .booking-loading,
  .booking-error-page {
    min-height: calc(100vh - 141px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 38px;
    height: 38px;
    border-color: #dce7f8;
    border-top-color: #2167d5;
    margin-bottom: 20px;
  }

  .booking-loading h2,
  .booking-error-page h1 {
    margin: 0 0 8px;
    color: #102a43;
    font-family: Manrope, sans-serif;
    font-size: 23px;
  }

  .booking-loading p,
  .booking-error-page p {
    max-width: 450px;
    margin: 0;
    color: #7d8a9b;
    font-size: 13px;
    line-height: 1.6;
  }

  .error-icon {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: #fff0f0;
    color: #b44343;
    display: grid;
    place-items: center;
    font-size: 23px;
    font-weight: 800;
    margin-bottom: 20px;
  }

  .error-actions {
    margin-top: 22px;
    display: flex;
    gap: 10px;
  }

  .primary-button,
  .secondary-button {
    min-height: 44px;
    padding: 0 17px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
  }

  .primary-button {
    border: 0;
    background: #2167d5;
    color: #ffffff;
  }

  .secondary-button {
    border: 1px solid #d8e0e9;
    background: #ffffff;
    color: #344e68;
  }

  /* ========================================
     CONFIRMATION
  ======================================== */

  .confirmation-page {
    width: min(920px, calc(100% - 40px));
    margin: 0 auto;
    padding: 55px 0 70px;
  }

  .confirmation-card {
    background: #ffffff;
    border: 1px solid #e2e8ef;
    border-radius: 18px;
    padding: 42px;
    box-shadow: 0 12px 40px rgba(16, 42, 67, 0.06);
  }

  .success-icon {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #e8f6ef;
    color: #268566;
    display: grid;
    place-items: center;
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 20px;
  }

  .confirmation-heading h1 {
    margin: 7px 0 9px;
    color: #102a43;
    font-family: Manrope, sans-serif;
    font-size: 30px;
    letter-spacing: -0.8px;
  }

  .confirmation-heading p {
    max-width: 650px;
    margin: 0;
    color: #758398;
    font-size: 13px;
    line-height: 1.7;
  }

  .booking-reference {
    margin-top: 25px;
    padding: 14px 16px;
    background: #f5f8fc;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .booking-reference span {
    color: #8090a3;
    font-size: 10px;
    font-weight: 600;
  }

  .booking-reference strong {
    color: #2167d5;
    font-size: 12px;
    font-family: monospace;
  }

  .confirmation-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 280px;
    gap: 25px;
    margin-top: 28px;
    padding-top: 28px;
    border-top: 1px solid #edf0f4;
  }

  .confirmation-property {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .confirmation-property img {
    width: 125px;
    height: 100px;
    border-radius: 9px;
    object-fit: cover;
    flex: 0 0 auto;
  }

  .confirmation-property h2 {
    margin: 6px 0 5px;
    color: #243b53;
    font-family: Manrope, sans-serif;
    font-size: 17px;
  }

  .confirmation-property p {
    margin: 0;
    color: #8290a2;
    font-size: 11px;
  }

  .confirmation-details {
    border-left: 1px solid #edf0f4;
    padding-left: 25px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 8px 0;
  }

  .detail-row span {
    color: #8390a0;
    font-size: 10px;
  }

  .detail-row strong {
    color: #344e68;
    font-size: 10px;
    text-align: right;
  }

  .detail-row.total-row {
    margin-top: 6px;
    padding-top: 13px;
    border-top: 1px solid #edf0f4;
  }

  .detail-row.total-row span {
    color: #344e68;
    font-weight: 700;
  }

  .detail-row.total-row strong {
    color: #102a43;
    font-family: Manrope, sans-serif;
    font-size: 17px;
  }

  .confirmation-contact {
    margin-top: 28px;
    padding: 18px;
    border-radius: 10px;
    background: #f8fafc;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .confirmation-contact div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .confirmation-contact span {
    color: #8794a5;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .confirmation-contact strong {
    color: #42556e;
    font-size: 11px;
    word-break: break-word;
  }

  .confirmation-actions {
    display: flex;
    gap: 10px;
    margin-top: 28px;
  }

  .whatsapp-button {
    min-height: 48px;
    padding: 0 18px;
    border: 0;
    border-radius: 8px;
    background: #24835e;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    font-size: 12px;
    font-weight: 800;
  }

  .whatsapp-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.85);
    display: grid;
    place-items: center;
    font-size: 8px;
  }

  /* ========================================
     ANIMATION
  ======================================== */

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ========================================
     TABLET
  ======================================== */

  @media (max-width: 1050px) {
    .booking-grid {
      grid-template-columns: minmax(0, 1fr) 330px;
      gap: 18px;
    }

    .booking-sidebar {
      top: 92px;
    }

    .property-image-wrap {
      height: 180px;
    }
  }

  /* ========================================
     SMALL TABLET
  ======================================== */

  @media (max-width: 850px) {
    .booking-grid {
      grid-template-columns: 1fr;
    }

    .booking-sidebar {
      position: static;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }

    .property-card {
      grid-column: 1 / -1;
    }

    .trust-card {
      grid-column: 1 / -1;
    }

    .property-image-wrap {
      height: 240px;
    }

    .confirmation-layout {
      grid-template-columns: 1fr;
    }

    .confirmation-details {
      border-left: 0;
      border-top: 1px solid #edf0f4;
      padding: 20px 0 0;
    }
  }

  /* ========================================
     MOBILE
  ======================================== */

  @media (max-width: 620px) {
    .booking-header-inner {
      width: calc(100% - 28px);
      min-height: 68px;
    }

    .secure-label span:last-child {
      display: none;
    }

    .booking-container {
      width: calc(100% - 24px);
      padding-top: 24px;
    }

    .booking-intro {
      margin-bottom: 20px;
    }

    .back-link {
      margin-bottom: 18px;
    }

    .intro-content h1 {
      font-size: 28px;
    }

    .form-section {
      padding: 23px 18px;
    }

    .two-columns {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .form-grid {
      margin-bottom: 15px;
    }

    .form-error {
      margin: 0 18px 18px;
    }

    .submit-area {
      padding: 0 18px 22px;
    }

    .booking-sidebar {
      display: flex;
    }

    .property-image-wrap {
      height: 220px;
    }

    .confirmation-page {
      width: calc(100% - 24px);
      padding: 30px 0 45px;
    }

    .confirmation-card {
      padding: 25px 18px;
      border-radius: 14px;
    }

    .confirmation-heading h1 {
      font-size: 25px;
    }

    .confirmation-property {
      align-items: flex-start;
    }

    .confirmation-property img {
      width: 95px;
      height: 80px;
    }

    .confirmation-contact {
      grid-template-columns: 1fr;
      gap: 13px;
    }

    .confirmation-actions {
      flex-direction: column;
    }

    .whatsapp-button,
    .confirmation-actions .secondary-button {
      width: 100%;
    }

    .booking-footer {
      min-height: auto;
      padding: 18px 14px;
      flex-direction: column;
      align-items: flex-start;
      gap: 7px;
    }
  }

  /* ========================================
     SMALL MOBILE
  ======================================== */

  @media (max-width: 390px) {
    .booking-container {
      width: calc(100% - 18px);
    }

    .booking-header-inner {
      width: calc(100% - 18px);
    }

    .brand-mark {
      width: 37px;
      height: 37px;
      border-radius: 8px;
    }

    .brand-copy strong {
      font-size: 13px;
    }

    .brand-copy small {
      font-size: 9px;
    }

    .intro-content h1 {
      font-size: 25px;
    }

    .form-section {
      padding: 20px 14px;
    }

    .section-heading {
      gap: 10px;
    }

    .section-number {
      width: 30px;
      height: 30px;
    }

    .section-heading h2 {
      font-size: 15px;
    }

    .field input,
    .field select {
      min-height: 44px;
    }

    .form-error {
      margin-left: 14px;
      margin-right: 14px;
    }

    .submit-area {
      padding-left: 14px;
      padding-right: 14px;
    }

    .property-card-body,
    .price-summary,
    .trust-card {
      padding: 17px;
    }

    .property-image-wrap {
      height: 190px;
    }

    .phone-input {
      grid-template-columns: 78px minmax(0, 1fr);
    }
  }

  /* ========================================
     320px
  ======================================== */

  @media (max-width: 330px) {
    .booking-header-inner {
      width: calc(100% - 14px);
    }

    .booking-container {
      width: calc(100% - 14px);
    }

    .brand-copy {
      display: none;
    }

    .intro-content h1 {
      font-size: 23px;
    }

    .form-section {
      padding: 18px 12px;
    }

    .submit-area {
      padding-left: 12px;
      padding-right: 12px;
    }

    .form-error {
      margin-left: 12px;
      margin-right: 12px;
    }

    .summary-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 4px;
    }

    .confirmation-page {
      width: calc(100% - 14px);
    }
  }
`;

export default Booking;