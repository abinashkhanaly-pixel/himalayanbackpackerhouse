
import React, { useEffect, useState } from "react";
import "./Contact.css";

const API_URL =
  "https://backpacker-gateways-2.onrender.com/api/inquiries";

const initialFormData = {
  name: "",
  email: "",
  countryCode: "+977",
  phone: "",
  service: "Hotel Booking",
  checkIn: "",
  checkOut: "",
  guests: "1",
  message: "",
};

const Contact = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Contact page SEO metadata
  useEffect(() => {
    const previousTitle = document.title;
    const pageTitle =
      "Contact Us | Luxury Hotel Booking in Nepal - Backpacker Gateways";

    const pageDescription =
      "Contact Backpacker Gateways for luxury hotel booking in Nepal, luxury hotels in Kathmandu, 4-star and 5-star stays, and Himalayan retreats near Kathmandu.";

    document.title = pageTitle;

    let descriptionTag = document.querySelector(
      'meta[name="description"]'
    );

    const descriptionWasPresent = Boolean(descriptionTag);
    const previousDescription =
      descriptionTag?.getAttribute("content");

    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.appendChild(descriptionTag);
    }

    descriptionTag.setAttribute("content", pageDescription);

    let canonicalTag = document.querySelector(
      'link[rel="canonical"]'
    );

    const canonicalWasPresent = Boolean(canonicalTag);
    const previousCanonical = canonicalTag?.getAttribute("href");

    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalTag);
    }

    canonicalTag.setAttribute(
      "href",
      `${window.location.origin}/contact`
    );

    return () => {
      document.title = previousTitle;

      if (descriptionWasPresent) {
        if (previousDescription !== null) {
          descriptionTag.setAttribute(
            "content",
            previousDescription
          );
        }
      } else {
        descriptionTag.remove();
      }

      if (canonicalWasPresent) {
        if (previousCanonical !== null) {
          canonicalTag.setAttribute("href", previousCanonical);
        }
      } else {
        canonicalTag.remove();
      }
    };
  }, []);

  const today = new Date().toLocaleDateString("en-CA");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitted(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitted(false);
    setErrorMessage("");

    if (
      formData.checkIn &&
      formData.checkOut &&
      formData.checkOut < formData.checkIn
    ) {
      setErrorMessage(
        "Check-out date must be the same as or later than check-in date."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit your inquiry."
        );
      }

      setSubmitted(true);
      setFormData({ ...initialFormData });
    } catch (error) {
      console.error("Inquiry submission error:", error);

      setErrorMessage(
        error.message ||
          "Something went wrong. Please try again or contact our team directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="contact-page">
      {/* LUXURY HOTEL SEO HERO */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span>BACKPACKER GATEWAYS · NEPAL</span>

          <h1>
            Contact Us for Luxury Hotel Booking in Nepal
          </h1>

          <p>
            Planning a relaxing stay in Nepal? Explore luxury hotels
            in Kathmandu, premium 4-star and 5-star hotel options,
            and peaceful Himalayan retreats near the city. Tell us
            your travel dates and preferences, and our team will help
            you explore suitable accommodation options and understand
            the next steps for your hotel booking inquiry.
          </p>

          <div className="contact-hero-trust">
            <span>Personalised Assistance</span>
            <span>Clear Booking Information</span>
            <span>Plan Your Stay with Confidence</span>
          </div>
        </div>
      </section>

      {/* MAIN CONTACT SECTION */}
      <section className="contact-section">
        {/* CONTACT INFORMATION */}
        <div className="contact-info">
          <span className="contact-eyebrow">
            GET IN TOUCH
          </span>

          <h2>
            Let’s Find the Right Hotel for Your Stay
          </h2>

          <p className="contact-intro">
            Choosing the right accommodation makes a difference
            to your Nepal trip. Whether you are looking for luxury
            hotels in Kathmandu, a 5-star hotel in Nepal, comfortable
            4-star accommodation, or a peaceful mountain retreat,
            contact Backpacker Gateways to discuss your preferences
            and explore your options.
          </p>

          <div className="contact-detail">
            <div>
              <h3>Our Location</h3>
              <p>Kathmandu, Nepal</p>
              <small>
                Contact us about hotel options across Nepal.
              </small>
            </div>
          </div>

          <div className="contact-detail">
            <div>
              <h3>Phone / WhatsApp</h3>
              <p>
                <a href="tel:+9779709914688">
                  +977 9709914688
                </a>
              </p>
              <small>
                Ask our team about your hotel booking inquiry.
              </small>
            </div>
          </div>

          <div className="contact-detail">
            <div>
              <h3>Email Us</h3>
              <p>
                <a href="mailto:info@himalayanbackpackerhouse.com">
                  info@himalayanbackpackerhouse.com
                </a>
              </p>
              <small>
                Share your preferred destination and travel dates.
              </small>
            </div>
          </div>

          <div className="contact-detail">
            <div>
              <h3>A Clear Booking Process</h3>
              <p>Start with your requirements.</p>
              <small>
                Discuss suitable options, availability, rates,
                and booking terms before deciding.
              </small>
            </div>
          </div>

          {/* TRUST PANEL */}
          <div className="contact-trust-panel">
            <h3>Book with Confidence</h3>

            <p>
              We want you to have the information you need before
              deciding on your stay. Tell us what matters to you,
              and our team can help you understand the next steps.
            </p>

            <ul>
              <li>Share your preferred hotel or destination.</li>
              <li>Tell us your dates and number of guests.</li>
              <li>Ask questions about your accommodation options.</li>
              <li>Confirm availability and terms before finalising.</li>
            </ul>
          </div>
        </div>

        {/* INQUIRY FORM */}
        <div className="contact-form-container">
          <div className="form-header">
            <span>HOTEL BOOKING ASSISTANCE</span>

            <h2>Send Your Hotel Booking Inquiry</h2>

            <p>
              Tell us about your trip so we can better understand
              your preferred hotel, location, and accommodation needs.
            </p>
          </div>

          {submitted && (
            <div
              className="success-message"
              role="status"
              aria-live="polite"
            >
              <strong>Thank you for contacting us!</strong>
              <p>
                Your inquiry was submitted successfully.
                Our team will follow up using the contact details
                you provided.
              </p>
            </div>
          )}

          {errorMessage && (
            <div
              className="error-message"
              role="alert"
              aria-live="assertive"
            >
              {errorMessage}
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
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  maxLength={100}
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
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  maxLength={254}
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
                    aria-label="Country calling code"
                  >
                    <option value="+977">🇳🇵 +977</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+31">🇳🇱 +31</option>
                    <option value="+41">🇨🇭 +41</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+974">🇶🇦 +974</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+66">🇹🇭 +66</option>
                  </select>

                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel-national"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    required
                    maxLength={25}
                  />
                </div>

                <small className="field-hint">
                  Add a reachable number, preferably WhatsApp.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="service">
                  What Do You Need?
                </label>

                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="Hotel Booking">
                    Luxury Hotel Booking
                  </option>
                  <option value="Trekking Package">
                    Trekking Package
                  </option>
                  <option value="Tourist Vehicle">
                    Tourist Vehicle
                  </option>
                  <option value="Gear Rental">
                    Gear Rental
                  </option>
                  <option value="Nepal Tour">
                    Nepal Tour
                  </option>
                  <option value="General Inquiry">
                    General Inquiry
                  </option>
                </select>
              </div>
            </div>

            {/* DATES */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="checkIn">
                  Check-in Date
                </label>

                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  min={today}
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkOut">
                  Check-out Date
                </label>

                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  min={formData.checkIn || today}
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
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6 Guests</option>
                <option value="7">7 Guests</option>
                <option value="8">8+ Guests</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div className="form-group">
              <label htmlFor="message">
                Your Travel Requirements
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Preferred hotel, Kathmandu or another destination, budget per night, room preferences, travel dates, or questions..."
                rows={5}
                maxLength={2000}
              />

              <small className="field-hint">
                Include your preferred location, hotel category,
                approximate budget, or special requests.
              </small>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="contact-submit"
              disabled={submitting}
            >
              {submitting
                ? "Sending Your Inquiry..."
                : "Submit Hotel Booking Inquiry →"}
            </button>

            <p className="form-note">
              Submitting an inquiry does not confirm a reservation.
              Hotel availability, rates, and booking terms must be
              confirmed before your booking is finalised.
            </p>
          </form>
        </div>
      </section>

      {/* SEO CONTENT + INTERNAL LINK */}
      <section className="contact-seo-section">
        <div className="contact-seo-content">
          <span className="contact-eyebrow">
            DISCOVER YOUR STAY
          </span>

          <h2>
            Explore Luxury Hotels in Nepal
          </h2>

          <p>
            Searching for luxury accommodation in Nepal? Explore
            hotel options for a relaxing city stay, premium hotels
            in Kathmandu, 4-star accommodation, and 5-star hotels
            across Nepal. If you prefer a quieter escape, consider
            exploring Himalayan retreats near Kathmandu. Your ideal
            stay depends on your destination, dates, preferences,
            and the facilities offered by each property.
          </p>

          <p>
            Whether you are planning a Nepal holiday, comparing
            luxury hotel options, or looking for assistance with
            a hotel reservation, share your requirements with
            Backpacker Gateways before making your decision.
          </p>

          <a href="/rooms" className="contact-rooms-link">
            Explore Hotels in Nepal →
          </a>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="contact-cta">
        <span>BACKPACKER GATEWAYS</span>

        <h2>
          Your Next Stay Starts with the Right Choice.
        </h2>

        <p>
          Explore. Compare. Ask Questions. Plan Your Stay.
        </p>

        <a href="/rooms" className="contact-cta-link">
          Discover Hotels
        </a>
      </section>
    </main>
  );
};

export default Contact;
