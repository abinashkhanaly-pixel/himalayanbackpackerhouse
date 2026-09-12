
import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+977",
    phone: "",
    service: "Hotel Booking",
    checkIn: "",
    checkOut: "",
    guests: "1",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitted(false);
    setSubmitting(true);

    try {
      const response = await fetch(
        "https://backpacker-gateways-2.onrender.com/api/inquiries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit inquiry."
        );
      }

      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        countryCode: "+977",
        phone: "",
        service: "Hotel Booking",
        checkIn: "",
        checkOut: "",
        guests: "1",
        message: "",
      });
    } catch (error) {
      console.error("Inquiry submission error:", error);

      alert(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">

      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span>BACKPACKER GATEWAYS</span>

          <h1>Plan Your Himalayan Adventure</h1>

          <p>
            Tell us what you need and our team will help you arrange your
            stay, trekking adventure, vehicle, gear rental, or Nepal trip.
          </p>
        </div>
      </section>

      {/* MAIN SECTION */}
      <section className="contact-section">

        {/* LEFT SIDE */}
        <div className="contact-info">

          <span className="contact-eyebrow">
            GET IN TOUCH
          </span>

          <h2>Let’s Plan Your Trip</h2>

          <p className="contact-intro">
            Whether you are looking for a comfortable stay in Kathmandu,
            planning a Himalayan trek, renting a vehicle, or exploring Nepal,
            Backpacker Gateways is here to help.
          </p>

          <div className="contact-detail">
            <div className="contact-icon">📍</div>

            <div>
              <h3>Our Location</h3>
              <p>Kathmandu, Nepal</p>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-icon">📞</div>

            <div>
              <h3>Phone</h3>
              <p>+977 9709914688</p>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-icon">✉️</div>

            <div>
              <h3>Email</h3>
              <p>
                info@himalayanbackpackerhouse.com
              </p>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-icon">🕒</div>

            <div>
              <h3>24/7 Support</h3>

              <p>
                Available 24 hours a day, 7 days a week
              </p>
            </div>
          </div>

        </div>

        {/* FORM */}
        <div className="contact-form-container">

          <div className="form-header">

            <span>BOOKING & INQUIRY</span>

            <h2>How Can We Help?</h2>

            <p>
              Fill in the details below and our team will get back to you.
            </p>

          </div>

          {/* SUCCESS MESSAGE */}
          {submitted && (
            <div className="success-message">
              <strong>Thank you!</strong>
              <br />
              Your inquiry has been received successfully.
              Our team will contact you soon.
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* NAME + EMAIL */}
            <div className="form-row">

              <div className="form-group">

                <label htmlFor="name">
                  Full Name <span>*</span>
                </label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="email">
                  Email Address <span>*</span>
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />

              </div>

            </div>

            {/* PHONE + SERVICE */}
            <div className="form-row">

              <div className="form-group">

                <label htmlFor="phone">
                  Phone / WhatsApp <span>*</span>
                </label>

                <div className="phone-input-wrapper">

                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="country-code"
                    aria-label="Country code"
                  >
                    <option value="+977">
                      🇳🇵 +977
                    </option>

                    <option value="+91">
                      🇮🇳 +91
                    </option>

                    <option value="+1">
                      🇺🇸 +1
                    </option>

                    <option value="+44">
                      🇬🇧 +44
                    </option>

                    <option value="+61">
                      🇦🇺 +61
                    </option>

                    <option value="+81">
                      🇯🇵 +81
                    </option>

                    <option value="+82">
                      🇰🇷 +82
                    </option>

                    <option value="+86">
                      🇨🇳 +86
                    </option>

                    <option value="+49">
                      🇩🇪 +49
                    </option>

                    <option value="+33">
                      🇫🇷 +33
                    </option>

                    <option value="+39">
                      🇮🇹 +39
                    </option>

                    <option value="+34">
                      🇪🇸 +34
                    </option>

                    <option value="+31">
                      🇳🇱 +31
                    </option>

                    <option value="+41">
                      🇨🇭 +41
                    </option>

                    <option value="+971">
                      🇦🇪 +971
                    </option>

                    <option value="+974">
                      🇶🇦 +974
                    </option>

                    <option value="+966">
                      🇸🇦 +966
                    </option>

                    <option value="+65">
                      🇸🇬 +65
                    </option>

                    <option value="+60">
                      🇲🇾 +60
                    </option>

                    <option value="+66">
                      🇹🇭 +66
                    </option>
                  </select>

                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    required
                  />

                </div>

                <small className="field-hint">
                  Include your WhatsApp number if available.
                </small>

              </div>

              <div className="form-group">

                <label htmlFor="service">
                  What do you need?
                </label>

                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option>Hotel Booking</option>
                  <option>Trekking Package</option>
                  <option>Tourist Vehicle</option>
                  <option>Gear Rental</option>
                  <option>Nepal Tour</option>
                  <option>General Inquiry</option>
                </select>

              </div>

            </div>

            {/* DATES */}
            <div className="form-row">

              <div className="form-group">

                <label htmlFor="checkIn">
                  Check-in / Start Date
                </label>

                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="checkOut">
                  Check-out / End Date
                </label>

                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* GUESTS */}
            <div className="form-group">

              <label htmlFor="guests">
                Number of Guests
              </label>

              <select
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
              >
                <option value="1">
                  1 Guest
                </option>

                <option value="2">
                  2 Guests
                </option>

                <option value="3">
                  3 Guests
                </option>

                <option value="4">
                  4 Guests
                </option>

                <option value="5">
                  5 Guests
                </option>

                <option value="6">
                  6 Guests
                </option>

                <option value="7">
                  7 Guests
                </option>

                <option value="8">
                  8+ Guests
                </option>
              </select>

            </div>

            {/* MESSAGE */}
            <div className="form-group">

              <label htmlFor="message">
                Your Message
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your trip, preferred hotel, trekking route, vehicle, dates, or anything else..."
                rows="6"
              ></textarea>

            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="contact-submit"
              disabled={submitting}
            >
              {submitting
                ? "Sending..."
                : "Send Booking Inquiry →"}
            </button>

            <p className="form-note">
              We provide 24/7 support and will respond to your inquiry as soon
              as possible.
            </p>

          </form>

        </div>

      </section>

      {/* BOTTOM CTA */}
      <section className="contact-cta">

        <span>BACKPACKER GATEWAYS</span>

        <h2>Your Journey Starts Here.</h2>

        <p>
          Stay. Trek. Explore. Connect.
        </p>

      </section>

    </div>
  );
};

export default Contact;

