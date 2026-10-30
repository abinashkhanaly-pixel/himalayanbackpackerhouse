
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./About.css";

const SITE = "https://www.backpackergateways.com";
const URL = SITE + "/about";

const TITLE =
  "About Backpacker Gateways | Luxury Hotel Booking Nepal";

const DESC =
  "Discover Backpacker Gateways, a luxury hotel booking platform in Nepal. Explore 4-star and 5-star hotels in Kathmandu, Pokhara, Chitwan and premium Himalayan destinations. Meet our co-founders and learn about our hotel booking platform.";

const WA =
  "https://wa.me/9779851181005?text=" +
  encodeURIComponent(
    "Hello, I want to book a luxury hotel in Nepal."
  );

const OFFERS = [
  {
    t: "5-star hotels",
    p: "Discover premium 5-star hotels offering luxury accommodation and hospitality across Nepal.",
  },
  {
    t: "4-star hotels",
    p: "Explore quality 4-star hotels combining comfort, convenience and value.",
  },
  {
    t: "Himalayan retreats",
    p: "Discover premium mountain retreats in destinations such as Dhulikhel and Nagarkot.",
  },
  {
    t: "Hotels across Nepal",
    p: "Explore accommodation options in Kathmandu, Pokhara, Chitwan and other destinations.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${URL}#aboutpage`,
  name: TITLE,
  url: URL,
  description: DESC,
  isPartOf: {
    "@id": `${SITE}/#website`,
  },
  mainEntity: {
    "@id": `${SITE}/#organization`,
  },
};

function upsert(selector, tag, attrs) {
  let el = document.head.querySelector(selector);

  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }

  Object.entries(attrs).forEach(([k, v]) => {
    el.setAttribute(k, v);
  });
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

    const existingSchema =
      document.getElementById("about-jsonld");

    if (existingSchema) {
      existingSchema.remove();
    }

    const script = document.createElement("script");
    script.id = "about-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);

    document.head.appendChild(script);

    return () => {
      document.getElementById("about-jsonld")?.remove();
    };
  }, []);

  return (
    <main className="ab">

      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-wrap">
          <span className="ab-kicker">
            ABOUT BACKPACKER GATEWAYS
          </span>

          <h1>
            <span className="ab-hero-highlight">
              Luxury hotels across Nepal,
            </span>{" "}
            <span className="ab-hero-subhighlight">
              <em>booked with confidence.</em>
            </span>
          </h1>

          <p className="ab-lead">
            Backpacker Gateways is a luxury hotel booking platform
            in Nepal. We help travellers discover premium
            accommodation, explore 4-star and 5-star hotels, compare
            stays and request hotel bookings across Kathmandu,
            Pokhara, Chitwan and other destinations in Nepal.
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
            Our mission is to make discovering and booking Nepal's
            finest 4-star and 5-star hotels easier for travellers
            around the world. Through Backpacker Gateways, travellers
            can explore premium hotels in Kathmandu, Pokhara and
            Chitwan, along with Himalayan retreats in Dhulikhel and
            Nagarkot. We simplify the hotel discovery and booking
            request process, help travellers choose suitable stays
            and provide booking assistance. Guests can pay directly
            at the property where supported by the hotel's booking
            terms, giving travellers a convenient way to plan their
            stay in Nepal.
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
          <span className="ab-label">
            THE PEOPLE BEHIND US
          </span>

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
                <strong>Co-Founder</strong>

                <p>
                  Umesh Gupta is a co-founder of Backpacker Gateways
                  and an entrepreneur with experience across
                  organisations in Nepal, including Abhiwadan
                  Expedition and Trip Holidays and Gramayana
                  Hotels, Nayabazar. His experience in travel and
                  hospitality contributes to the platform's vision
                  and direction.
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
                <strong>Co-Founder</strong>

                <p>
                  Bikash Khanal is a co-founder of Backpacker
                  Gateways and leads its technology development.
                  With expertise in MERN stack development, he is
                  building the platform's digital infrastructure,
                  hotel discovery experience and booking technology
                  to make luxury hotel reservations simpler and
                  more accessible.
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
            Visit us at 3rd Floor, Sanima Bank Building,
            Sorhakhutte, Nayabazar, Kathmandu. With Abhiwadan
            Expedition and Trip Holidays.
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
