
import { Link } from "react-router-dom";
import "./Footer.css";

const BRAND = "Backpacker Gateways";
const EMAIL = ""; // Add your official business email when available
const REL = "noopener noreferrer";

const PHONES = [
  { label: "+977 9851181005", wa: "9779851181005" },
  { label: "+977 9709914688", wa: "9779709914688" },
];

const WA_TEXT = encodeURIComponent(
  "Hello Backpacker Gateways, I want to book a luxury hotel in Nepal."
);

const waLink = (n) => `https://wa.me/${n}?text=${WA_TEXT}`;

const MAPS =
  "https://www.google.com/maps/search/?api=1" +
  "&query=Backpacker+Gateways+Sorhakhutte+Nayabazar+Kathmandu";

const CITIES = [
  { name: "Kathmandu", to: "/rooms?city=kathmandu" },
  { name: "Pokhara", to: "/rooms?city=pokhara" },
  { name: "Chitwan", to: "/rooms?city=chitwan" },
  { name: "All over Nepal", to: "/rooms" },
];

const DESCRIPTION =
  "Backpacker Gateways is a luxury hotel booking platform in Nepal. " +
  "Discover and request bookings at premium 4-star and 5-star hotels " +
  "in Kathmandu, Pokhara, Chitwan and destinations across Nepal.";

const WA_PATH = [
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15",
  "-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463",
  "-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606",
  ".134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52",
  "-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01",
  "-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074",
  ".149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118",
  ".571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347",
  "m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374",
  "a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898",
  "a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884",
  "m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892",
  "c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448",
  "h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
].join("");

const PEAKS_BACK = [
  "M0 120V64",
  "C70 50 120 18 200 22",
  "C270 26 320 62 390 58",
  "C470 54 520 10 610 6",
  "C690 3 730 44 800 50",
  "C880 57 930 20 1010 18",
  "C1090 16 1140 52 1220 48",
  "C1300 44 1370 20 1440 30",
  "V120Z",
].join("");

const PEAKS_FRONT = [
  "M0 120V80",
  "C60 74 110 40 170 38",
  "C230 36 270 70 330 66",
  "C400 61 440 20 520 14",
  "C590 9 640 52 700 58",
  "C770 66 810 30 880 24",
  "C950 18 990 56 1060 60",
  "C1130 64 1180 28 1250 30",
  "C1320 32 1380 62 1440 52",
  "V120Z",
].join("");

function WhatsAppIcon() {
  return (
    <svg
      className="hf-wa-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d={WA_PATH} />
    </svg>
  );
}

function Peaks() {
  return (
    <svg
      className="hf-peaks"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className="hf-peaks-back" d={PEAKS_BACK} />
      <path className="hf-peaks-front" d={PEAKS_FRONT} />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="hf">
      <Peaks />

      <div className="hf-body">
        <div className="hf-wrap hf-top">
          <div className="hf-top-text">
            <h2>
              Luxury hotel stays across Nepal, booked with confidence.
            </h2>

            <div className="hf-chips">
              {CITIES.map((c) => (
                <Link key={c.name} to={c.to} className="hf-chip">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hf-top-actions">
            <Link to="/booking" className="hf-btn">
              Book a luxury hotel
            </Link>

            {PHONES.map((p) => (
              <a
                key={p.wa}
                href={waLink(p.wa)}
                target="_blank"
                rel={REL}
                className="hf-wa"
                aria-label={`Chat on WhatsApp ${p.label}`}
              >
                <WhatsAppIcon />
                <span>{p.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="hf-wrap hf-grid">
          <div className="hf-brand">
            <Link to="/" className="hf-logo" aria-label={`${BRAND} home`}>
              <span className="hf-mark">B</span>

              <span className="hf-name">
                <strong>Backpacker</strong>
                <small>Gateways</small>
              </span>
            </Link>

            <p>{DESCRIPTION}</p>
          </div>

          <nav className="hf-col" aria-label="Luxury hotels">
            <h3>Luxury hotels</h3>

            <Link to="/rooms?city=kathmandu">
              5-star hotels in Kathmandu
            </Link>

            <Link to="/rooms?city=pokhara">
              5-star hotels in Pokhara
            </Link>

            <Link to="/rooms?city=chitwan">
              5-star hotels in Chitwan
            </Link>

            <Link to="/trekking">
              Trekking and experiences
            </Link>
          </nav>

          <nav className="hf-col" aria-label="Company">
            <h3>Company</h3>

            <Link to="/about">About us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/booking">Booking</Link>
            <Link to="/community">Community</Link>
          </nav>

          <address className="hf-col hf-contact">
            <h3>Corporate office</h3>

            <a
              className="hf-addr"
              href={MAPS}
              target="_blank"
              rel={REL}
            >
              3rd Floor, Sanima Bank Building, Sorhakhutte,
              Nayabazar, Kathmandu, Nepal
            </a>

            <span className="hf-note">
              Near Abhiwadan Expedition and Trip Holidays
            </span>

            {EMAIL && (
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            )}
          </address>
        </div>

        <div className="hf-wrap hf-bottom">
          <span>
            &copy; {new Date().getFullYear()} {BRAND}.
            Nepal's luxury hotel booking platform.
          </span>

          <span>
            Kathmandu &middot; Pokhara &middot; Chitwan
            &middot; All over Nepal
          </span>
        </div>
      </div>
    </footer>
  );
}
