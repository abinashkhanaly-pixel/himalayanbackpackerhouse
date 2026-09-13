import "./Community.css";
import { Link } from "react-router-dom";

const practicalActions = [
  {
    number: "01",
    icon: "✈",
    label: "BEFORE ARRIVAL",
    title: "Check Your Visa",
    text: "Check Nepal visa requirements, Visa on Arrival information and entry requirements before you fly.",
    type: "link",
    href: "/visa-checker",
    action: "CHECK VISA",
  },
  {
    number: "02",
    icon: "🏔",
    label: "TREKKING",
    title: "Check Trek Permits",
    text: "Understand the permits, conservation fees and special permissions your trekking route may require.",
    type: "anchor",
    href: "#travel-information",
    action: "CHECK PERMITS",
  },
  {
    number: "03",
    icon: "🛡",
    label: "ESSENTIAL",
    title: "Travel Insurance",
    text: "Make sure your insurance covers trekking, altitude, emergency treatment and evacuation.",
    type: "anchor",
    href: "#travel-information",
    action: "CHECK INSURANCE",
  },
  {
    number: "04",
    icon: "🚌",
    label: "GET AROUND",
    title: "Flights & Transport",
    text: "Plan airport transfers, tourist vehicles, domestic flights and local transportation.",
    type: "link",
    href: "/vehicles",
    action: "PLAN TRANSPORT",
  },
  {
    number: "05",
    icon: "🛏",
    label: "ACCOMMODATION",
    title: "Where to Stay",
    text: "Find accommodation in Kathmandu and plan your stay before and after your trek.",
    type: "link",
    href: "/rooms",
    action: "FIND A STAY",
  },
  {
    number: "06",
    icon: "🌦",
    label: "CHECK BEFORE YOU GO",
    title: "Weather & Conditions",
    text: "Check destination weather, road conditions and current travel information.",
    type: "anchor",
    href: "#travel-information",
    action: "CHECK CONDITIONS",
  },
  {
    number: "07",
    icon: "🚨",
    label: "SAFETY",
    title: "Emergency & Safety",
    text: "Keep emergency contacts, tourist police, hospitals and safety information available.",
    type: "anchor",
    href: "#travel-information",
    action: "EMERGENCY INFO",
  },
  {
    number: "08",
    icon: "📄",
    label: "PREPARE",
    title: "Travel Documents",
    text: "Organise your passport, visa, insurance, flight, hotel and trekking documents.",
    type: "anchor",
    href: "#travel-information",
    action: "PREPARE DOCUMENTS",
  },
  {
    number: "09",
    icon: "💳",
    label: "ARRIVAL ESSENTIALS",
    title: "Money & Connectivity",
    text: "Prepare Nepalese rupees, ATM access, cards, SIM or eSIM and mobile data.",
    type: "anchor",
    href: "#travel-information",
    action: "PLAN MONEY & SIM",
  },
  {
    number: "10",
    icon: "🤝",
    label: "COMMUNITY",
    title: "Meet Other Travellers",
    text: "Connect with people arriving in Nepal and find trekking partners or travel companions.",
    type: "link",
    href: "/signup",
    action: "CONNECT",
  },
];

export default function Community() {
  return (
    <main className="community-page">

      <section
        className="coming-nepal-section"
        id="coming-to-nepal"
      >
        <div className="community-container">

          <div className="coming-nepal-header">

            <div>

              <span className="coming-nepal-kicker">
                BEFORE YOU COME TO NEPAL
              </span>

              <h1>
                Coming to Nepal?
                <strong> Start Here.</strong>
              </h1>

              <p>
                Everything important you should check, prepare and plan
                before your Nepal adventure begins.
              </p>

            </div>

          </div>

          <div className="coming-nepal-grid">

            {practicalActions.map((item) => (

              <article
                className={`coming-nepal-card ${
                  item.number === "10"
                    ? "coming-nepal-community-card"
                    : ""
                }`}
                key={item.number}
              >

                <span className="coming-nepal-number">
                  {item.number}
                </span>

                <div className="coming-nepal-top">

                  <div className="coming-nepal-icon">
                    {item.icon}
                  </div>

                  <span className="coming-nepal-label">
                    {item.label}
                  </span>

                </div>

                <h2>
                  {item.title}
                </h2>

                <p>
                  {item.text}
                </p>

                {item.type === "link" && (
                  <Link to={item.href}>
                    {item.action} →
                  </Link>
                )}

                {item.type === "external" && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.action} →
                  </a>
                )}

                {item.type === "anchor" && (
                  <a href={item.href}>
                    {item.action} →
                  </a>
                )}

              </article>

            ))}

          </div>

          <div className="coming-nepal-connect">

            <div>

              <span>
                TRAVELLERS COMING TO NEPAL
              </span>

              <h3>
                Arriving soon?
                <strong> Connect before you travel.</strong>
              </h3>

              <p>
                Tell the community when you are arriving, where you are
                going and what kind of travel partner you are looking for.
              </p>

            </div>

            <Link
              to="/signup"
              className="coming-nepal-connect-btn"
            >
              I'M COMING TO NEPAL →
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}