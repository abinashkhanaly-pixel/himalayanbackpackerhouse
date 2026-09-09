import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>
          Have a question about your stay, trekking plans, or Nepal adventure?
          We would love to hear from you.
        </p>
      </section>

      {/* Contact Content */}
      <section className="contact-section">

        {/* Contact Information */}
        <div className="contact-info">
          <h2>Get in Touch</h2>

          <p>
            Whether you are planning a relaxing stay or an exciting Himalayan
            adventure, our team is here to help.
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
              <p>info@himalayanbackpackerhouse.com</p>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-icon">🕒</div>
            <div>
              <h3>Opening Hours</h3>
              <p>Every day: 7:00 AM – 10:00 PM</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="contact-form-container">
          <h2>Send Us a Message</h2>

          {submitted && (
            <div className="success-message">
              Thank you! Your message has been submitted successfully.
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                required
              ></textarea>
            </div>

            <button type="submit" className="contact-submit">
              Send Message
            </button>

          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="contact-cta">
        <h2>Ready for Your Himalayan Adventure?</h2>
        <p>
          Get in touch with us and let us help you plan your perfect Nepal
          experience.
        </p>
      </section>

    </div>
  );
};

export default Contact;
