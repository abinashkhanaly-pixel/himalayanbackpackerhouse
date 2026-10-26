import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./About.css";

const SITE = "https://www.backpackergateways.com";
const URL = SITE + "/about";
const TITLE = "About Backpacker Gateways | Luxury Hotels in Nepal";
const DESC =
  "Backpacker Gateways is Nepal's luxury hotel brand. " +
  "Book 5-star and 4-star hotels in Kathmandu, Pokhara, " +
  "Chitwan and a Himalayan retreat near Kathmandu.";

const WA =
  "https://wa.me/9779851181005?text=" +
  encodeURIComponent("Hello, I want to book a luxury hotel in Nepal.");

const OFFERS = [
  {
    t: "5-star hotels",
    p: "Grand stays with the finest rooms, service and dining.",
  },
  {
    t: "4-star hotels",
    p: "Comfort and style at a smarter price.",
  },
  {
    t: "Himalayan retreat",
    p: "A luxury mountain retreat close to Kathmandu.",
  },
  {
    t: "All over Nepal",
    p: "Kathmandu, Pokhara, Chitwan and more.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: TITLE,
  url: URL,
  description: DESC,
  mainEntity: {
    "@type": "Organization",
    name: "Backpacker Gateways",
    url: SITE,
    founder: { "@type": "Person", name: "Umesh Gupta" },
    areaServed: ["Kathmandu", "Pokhara", "Chitwan", "Nepal"],
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Third Floor, Sanima Bank Building, Sorhakhutte, Nayabazar",
      addressLocality: "Kathmandu",
      addressCountry: "NP",
    },
  },
};

function upsert(selector, tag, attrs) {
  let el = document.head.querySelector(selector);

  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }

  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

function Photo({ src, name, initials }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="ab-avatar">{initials}</span>;
  }

  return (
    <img
      className="ab-photo"
      src={src}
      alt={name}
      width="120"
      height="120"
      onError={() => setFailed(true)}
    />
  );
}

export default function About() {
  useEffect(() => {
    document.title = TITLE;

    upsert('meta[name="description"]', "meta", {
      name: "description",
      content: DESC,
    });

    upsert('link[rel="canonical"]', "link", {
      rel: "canonical",
      href: URL,
    });

    upsert('meta[property="og:title"]', "meta", {
      property: "og:title",
      content: TITLE,
    });

    upsert('meta[property="og:description"]', "meta", {
      property: "og:description",
      content: DESC,
    });

    upsert('meta[property="og:url"]', "meta", {
      property: "og:url",
      content: URL,
    });
  }, []);

  return (
    <main className="ab">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-wrap">
          <span className="ab-kicker">ABOUT BACKPACKER GATEWAYS</span>

          <h1>
            <span className="ab-hero-highlight">
              Luxury hotels across Nepal,
            </span>{" "}
            <span className="ab-hero-subhighlight">
              <em>booked with confidence.</em>
            </span>
          </h1>

          <p className="ab-lead">
            Backpacker Gateways is Nepal's luxury hotel brand. We help you
            book the best 5-star and 4-star hotels in Kathmandu, Pokhara,
            Chitwan and all over Nepal.
          </p>

          <div className="ab-actions">
            <Link to="/booking" className="ab-btn ab-btn-gold">
              Book a luxury hotel
            </Link>

            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="ab-btn ab-btn-line"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="ab-sec">
        <div className="ab-wrap ab-two">
          <div>
            <span className="ab-label">OUR MISSION</span>
            <h2>
              A grand vacation,
              <em> with luxury comfort.</em>
            </h2>
          </div>

          <p className="ab-text">
            Our mission is to make booking Nepal’s finest 4-star and 5-star
            hotels easy and accessible to travellers around the world.
            Discover premium hotels in Kathmandu and across Nepal, or find a
            peaceful Himalayan retreat in Dhulikhel and Nagarkot near
            Kathmandu. We make the booking process simple, help you choose
            the right stay, and assist you with your reservation. With
            convenient booking assistance and the option to pay directly at
            the property, subject to hotel terms, you can plan your Nepal
            stay with greater confidence.
          </p>
        </div>
      </section>

      {/* OFFERS */}
      <section className="ab-sec ab-soft">
        <div className="ab-wrap">
          <span className="ab-label">WHAT WE OFFER</span>

          <h2>
            Stay the way
            <em> you deserve.</em>
          </h2>

          <div className="ab-grid">
            {OFFERS.map((o) => (
              <article key={o.t} className="ab-card">
                <h3>{o.t}</h3>
                <p>{o.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PEOPLE */}
      <section className="ab-sec">
        <div className="ab-wrap">
          <span className="ab-label">THE PEOPLE BEHIND US</span>

          <h2>
            Built by
            <em> people who know Nepal.</em>
          </h2>

          <div className="ab-people">
            <article className="ab-person">
              <Photo
                src="/umesh-gupta.jpg"
                name="Umesh Gupta"
                initials="UG"
              />

              <div>
                <h3>Umesh Gupta</h3>
                <strong>Founder</strong>
                <p>
                  Umesh owns several organisations in Nepal, including
                  Abhiwadan Expedition and Trip Holidays and Gramayana
                  Hotels, Nayabazar. His years in travel and hospitality
                  shape every stay we offer.
                </p>
              </div>
            </article>

            <article className="ab-person">
              <Photo
                src="/bikash-khanal.jpg"
                name="Bikash Khanal"
                initials="BK"
              />

              <div>
                <h3>Bikash Khanal</h3>
                <strong>Senior MERN Stack Developer</strong>
                <p>
                  Bikash is the technology backbone of Backpacker Gateways.
                  He is developing this web app so booking a luxury hotel is
                  fast, simple and secure.
                </p>
              </div>
            </article>
          </div>

          <div className="ab-orgs">
            <span>Our family of organisations</span>
            <b>Abhiwadan Expedition and Trip Holidays</b>
            <b>Gramayana Hotels, Nayabazar</b>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="ab-cta">
        <div className="ab-wrap">
          <h2>
            Plan your luxury stay
            <em> in Nepal.</em>
          </h2>

          <p>
            Visit us at 3rd Floor, Sanima Bank Building, Sorhakhutte,
            Nayabazar, Kathmandu. With Abhiwadan Expedition and Trip
            Holidays.
          </p>

          <div className="ab-actions">
            <Link to="/booking" className="ab-btn ab-btn-gold">
              Book now
            </Link>

            <Link to="/contact" className="ab-btn ab-btn-line">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}