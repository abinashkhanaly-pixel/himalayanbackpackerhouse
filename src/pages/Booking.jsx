import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoom } from "../services/roomApi";

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
  const [success, setSuccess] = useState("");
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
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!room) {
      setError("Room information is missing.");
      return;
    }

    if (
      form.checkIn &&
      form.checkOut &&
      new Date(form.checkOut) <= new Date(form.checkIn)
    ) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

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
            guests: Number(form.guests),
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

      setSuccess(
        "Your booking request has been submitted successfully!"
      );

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
        <div className="booking-spinner"></div>
        <p>Loading your selected room...</p>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="booking-error">
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
    );
  }

  return (
    <>
      <style>{`
        .booking-loading {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f5f7f4;
          font-family: Arial, Helvetica, sans-serif;
        }

        .booking-spinner {
          width: 42px;
          height: 42px;
          border: 4px solid #d9ded9;
          border-top-color: #967247;
          border-radius: 50%;
          animation: bookingSpin 0.8s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes bookingSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .booking-error {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: Arial, Helvetica, sans-serif;
          padding: 30px;
          box-sizing: border-box;
        }

        .booking-error h2 {
          color: #18231d;
          margin-bottom: 10px;
        }

        .booking-error p {
          color: #68716b;
        }

        .booking-error button {
          margin-top: 20px;
          padding: 13px 22px;
          border: none;
          border-radius: 10px;
          background: #18231d;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .booking-page {
          min-height: 100vh;
          background: #f5f7f4;
          padding: 70px 6%;
          font-family: Arial, Helvetica, sans-serif;
          box-sizing: border-box;
        }

        .booking-container {
          max-width: 1150px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 40px;
          align-items: start;
        }

        .booking-form-card,
        .booking-summary {
          background: white;
          border: 1px solid #e2e6e2;
          border-radius: 22px;
          padding: 32px;
          box-shadow: 0 15px 45px rgba(20, 35, 25, 0.07);
          box-sizing: border-box;
        }

        .booking-label {
          color: #967247;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .booking-title {
          margin: 10px 0;
          font-size: clamp(38px, 5vw, 56px);
          line-height: 1.05;
          letter-spacing: -2px;
          color: #18231d;
        }

        .booking-description {
          color: #707871;
          line-height: 1.7;
          margin-bottom: 30px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: #37433b;
          font-size: 13px;
          font-weight: 700;
        }

        .form-group input,
        .form-group select {
          box-sizing: border-box;
          width: 100%;
          padding: 14px;
          border: 1px solid #d9ded9;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          background: white;
          color: #18231d;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #967247;
          box-shadow: 0 0 0 3px rgba(150, 114, 71, 0.1);
        }

        .submit-booking {
          width: 100%;
          margin-top: 25px;
          padding: 16px;
          border: none;
          border-radius: 11px;
          background: #18231d;
          color: white;
          font-weight: 800;
          cursor: pointer;
          transition: 0.25s;
        }

        .submit-booking:hover:not(:disabled) {
          background: #967247;
          transform: translateY(-2px);
        }

        .submit-booking:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .booking-message {
          margin-bottom: 22px;
          padding: 15px 17px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
        }

        .booking-success {
          background: #eaf7ed;
          color: #28613b;
          border: 1px solid #cce7d3;
        }

        .booking-error-message {
          background: #fff0f0;
          color: #a13b3b;
          border: 1px solid #efcccc;
        }

        .summary-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-radius: 15px;
          margin-bottom: 22px;
          display: block;
        }

        .summary-title {
          margin: 0 0 8px;
          font-size: 24px;
          color: #18231d;
        }

        .summary-description {
          color: #747c76;
          font-size: 13px;
          line-height: 1.6;
        }

        .summary-price {
          margin-top: 25px;
          padding: 18px;
          background: #f5f7f4;
          border-radius: 14px;
        }

        .summary-price strong {
          display: block;
          color: #967247;
          font-size: 27px;
        }

        .summary-price span {
          color: #777f79;
          font-size: 12px;
        }

        .summary-details {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e8ece8;
        }

        .summary-details p {
          margin: 8px 0;
          color: #68716b;
          font-size: 13px;
        }

        @media (max-width: 800px) {
          .booking-container {
            grid-template-columns: 1fr;
          }

          .booking-summary {
            order: -1;
          }
        }

        @media (max-width: 550px) {
          .booking-page {
            padding: 40px 18px;
          }

          .booking-form-card,
          .booking-summary {
            padding: 22px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .booking-title {
            font-size: 34px;
          }
        }
      `}</style>

      <div className="booking-page">
        <div className="booking-container">

          <div className="booking-form-card">
            <span className="booking-label">
              Himalayan Backpacker House
            </span>

            <h1 className="booking-title">
              Reserve Your Stay
            </h1>

            <p className="booking-description">
              Tell us a little about your trip and we'll
              prepare your Himalayan stay.
            </p>

            {success && (
              <div className="booking-message booking-success">
                {success}
              </div>
            )}

            {error && (
              <div className="booking-message booking-error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+977 ..."
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
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
                      {
                        length: room.capacity || 1,
                      },
                      (_, index) => index + 1
                    ).map((number) => (
                      <option
                        key={number}
                        value={number}
                      >
                        {number} Guest
                        {number > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
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

              <button
                type="submit"
                className="submit-booking"
                disabled={loading}
              >
                {loading
                  ? "Submitting Booking..."
                  : "Request Booking"}
              </button>
            </form>
          </div>

          <aside className="booking-summary">

            <img
              className="summary-image"
              src={
                room.images?.[0] ||
                "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
              }
              alt={room.name || "Selected room"}
            />

            <h2 className="summary-title">
              {room.name}
            </h2>

            <p className="summary-description">
              {room.description}
            </p>

            <div className="summary-price">
              <strong>
                NPR{" "}
                {Number(room.price || 0).toLocaleString(
                  "en-NP"
                )}
              </strong>

              <span>per night</span>
            </div>

            <div className="summary-details">
              <p>
                Capacity: {room.capacity || 1} Guests
              </p>

              <p>
                Bed: {room.beds || "Standard Bed"}
              </p>

              <p>
                Status:{" "}
                {room.available
                  ? "Available"
                  : "Currently Unavailable"}
              </p>
            </div>

          </aside>

        </div>
      </div>
    </>
  );
};

export default Booking;
