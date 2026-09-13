
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const heroImages = [
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=2200&q=90",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=2200&q=90",
];

const destinations = [
  {
    name: "Kathmandu",
    location: "Bagmati, Nepal",
    price: "120+ Stays",
    image:
      "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Pokhara",
    location: "Gandaki, Nepal",
    price: "From $20",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Everest Region",
    location: "Khumbu, Nepal",
    price: "Trekking Paradise",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Annapurna Region",
    location: "Gandaki, Nepal",
    price: "Most Popular",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Langtang",
    location: "Central Nepal",
    price: "Peaceful Trails",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=85",
  },
];

const categories = [
  {
    icon: "♙",
    title: "Backpacker Stays",
    subtitle: "Comfortable stays",
  },
  {
    icon: "▥",
    title: "Budget Hostel",
    subtitle: "From $5",
  },
  {
    icon: "♜",
    title: "Mid-Range",
    subtitle: "From $20",
  },
  {
    icon: "▦",
    title: "Deluxe",
    subtitle: "From $50",
  },
  {
    icon: "♛",
    title: "Luxury",
    subtitle: "From $100+",
  },
  {
    icon: "⌂",
    title: "Trekking Lodges",
    subtitle: "Mountain stays",
  },
  {
    icon: "⌁",
    title: "Camping",
    subtitle: "Wild escapes",
  },
  {
    icon: "⌘",
    title: "Homestay",
    subtitle: "Live local",
  },
  {
    icon: "◇",
    title: "Gear Rental",
    subtitle: "Trek essentials",
  },
  {
    icon: "♟",
    title: "Hiking Trails",
    subtitle: "Find your trail",
  },
  {
  icon: "🚐",
  title: "Tourist Vehicle Rental",
  subtitle: "Travel Nepal Comfortably",
  link: "/vehicles",
}
];

const hotels = [
  {
    name: "Backpacker Nest",
    location: "Thamel, Kathmandu",
    rating: "4.8",
    reviews: "342",
    price: "$8",
    type: "Backpacker",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=85",
    tags: ["Free WiFi", "Rooftop", "Common Kitchen"],
    badge: "Best for Solo & Groups",
  },
  {
    name: "Maya Boutique Hotel",
    location: "Lakeside, Pokhara",
    rating: "4.9",
    reviews: "518",
    price: "$45",
    type: "Deluxe",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
    tags: ["Mountain View", "Breakfast", "Airport Pickup"],
    badge: "Top Rated",
  },
  {
    name: "Aloft Himalayan Resort",
    location: "Nagarkot, Kathmandu",
    rating: "4.9",
    reviews: "210",
    price: "$120",
    type: "Luxury",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    tags: ["Infinity Pool", "Spa", "Luxury"],
    badge: "Sunrise View",
  },
];

const gear = [
  {
    name: "Trekking Backpack",
    detail: "50L",
    price: "$4",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Down Jacket",
    detail: "-20°C",
    price: "$6",
    image:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Hiking Boots",
    detail: "Waterproof",
    price: "$5",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Sleeping Bag",
    detail: "-10°C",
    price: "$4",
    image:
      "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Trekking Poles",
    detail: "Lightweight",
    price: "$2",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=700&q=85",
  },
];

const experiences = [
  {
    name: "Basantapur Durbar Square",
    location: "Kathmandu",
    category: "Historical",
    image:
      "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Lakeside Pokhara",
    location: "Pokhara",
    category: "Relaxing",
    image:
      "https://images.unsplash.com/photo-1518002054494-3a6f94352e9dd?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Thamel Food Street",
    location: "Kathmandu",
    category: "Foodie",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85",
  },
];

const communityPosts = [
  {
    title: "How to Trek Manaslu Circuit",
    text: "Everything you need to know before starting one of Nepal's most incredible mountain journeys.",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Backpacking Nepal on a Budget",
    text: "Smart ways to travel across Nepal without spending a fortune.",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Must Visit Places in Kathmandu",
    text: "A local guide to temples, food, culture and hidden corners of Kathmandu.",
    image:
      "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1000&q=85",
  },
];

const hotelFilters = [
  "All",
  "Budget",
  "Backpacker",
  "Deluxe",
  "Luxury",
  "Boutique",
];

const whyUs = [
  {
    icon: "▣",
    title: "Verified Hotels",
    text: "& Hostels",
  },
  {
    icon: "⌖",
    title: "Real Google Map",
    text: "Integration",
  },
  {
    icon: "♙",
    title: "Local Guides",
    text: "& Support",
  },
  {
    icon: "▢",
    title: "Secure Booking",
    text: "& Payment",
  },
  {
    icon: "◇",
    title: "Gear Rental",
    text: "& Delivery",
  },
  {
    icon: "♧",
    title: "Community of",
    text: "Travellers",
  },
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  const [whereOpen, setWhereOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [hotelFilter, setHotelFilter] = useState("All");

  const totalGuests = adults + children;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  const closeDropdowns = () => {
    setWhereOpen(false);
    setDateOpen(false);
    setGuestOpen(false);
  };

  const selectDestination = (name) => {
    setDestination(name);
    setWhereOpen(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (destination) {
      params.set("destination", destination);
    }

    if (checkIn) {
      params.set("checkIn", checkIn);
    }

    if (checkOut) {
      params.set("checkOut", checkOut);
    }

    params.set("adults", String(adults));
    params.set("children", String(children));

    window.location.href = `/rooms?${params.toString()}`;
  };

  const filteredHotels =
    hotelFilter === "All"
      ? hotels
      : hotels.filter((hotel) => hotel.type === hotelFilter);

  return (
    <main className="home-page">
      {/* HERO */}
      <section className="hero">
        <div className="hero-backgrounds">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`hero-background ${
                currentImage === index ? "active" : ""
              }`}
              style={{
                backgroundImage: `url("${image}")`,
              }}
            />
          ))}
        </div>

        <div className="hero-overlay" />

        {/* NAVBAR */}
        <header className="hero-navbar">
          <Link to="/" className="brand">
            <div className="brand-mark">
              <span>⌃</span>
              <span>⌃</span>
              <span>⌃</span>
            </div>

            <div className="brand-text">
              <strong>Backpacker Gateways</strong>
              <small>Explore · Stay · Trek · Connect</small>
            </div>
          </Link>

          <nav className="main-navigation">
            <Link to="/" className="active">
              Home
            </Link>

            <Link to="/rooms">Stay</Link>
            <Link to="/trekking">Trekking</Link>
            <Link to="/gear">Gear</Link>
            <Link to="/experiences">Places</Link>
            <Link to="/community">Community</Link>
            <Link to="/blog">Blog</Link>
          </nav>

          <div className="navbar-actions">
            <button type="button" className="currency-button">
              USD <span>⌄</span>
            </button>

            <button type="button" className="language-button">
              EN <span>⌄</span>
            </button>

            <Link to="/login" className="login-button">
              Login
            </Link>

            <Link to="/signup" className="signup-button">
              Sign Up
            </Link>
          </div>
        </header>

        {/* HERO CONTENT */}
        <div className="hero-content">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span />
              HIMALAYAN TRAVEL PLATFORM
            </div>

            <h1>
              Your Himalayan Adventure,
              <br />
              <span>All in One Gateway</span>
            </h1>

            <p className="hero-description">
              Discover places&nbsp; · &nbsp;Book stays&nbsp; · &nbsp;Get
              trekking gear&nbsp; · &nbsp;Explore like a local
            </p>

            <div className="hero-tagline">Travel Light, Live Fully.</div>
          </div>

          {/* SEARCH */}
          <div className="search-wrapper">
            <div className="search-tabs">
              <button
                type="button"
                className="search-tab active"
                onClick={closeDropdowns}
              >
                <span>▣</span>
                Hotels &amp; Hostels
              </button>

              <Link to="/trekking" className="search-tab">
                <span>⌁</span>
                Trekking Packages
              </Link>

              <Link to="/gear" className="search-tab">
                <span>◇</span>
                Gear Shop
              </Link>

              <Link to="/experiences" className="search-tab">
                <span>⌖</span>
                Places
              </Link>
            </div>

            <div className="search-bar">
              {/* WHERE */}
              <button
                type="button"
                className={`search-field ${whereOpen ? "active" : ""}`}
                onClick={() => {
                  setWhereOpen(!whereOpen);
                  setDateOpen(false);
                  setGuestOpen(false);
                }}
              >
                <span className="search-icon">⌖</span>

                <span className="search-field-content">
                  <small>WHERE ARE YOU GOING?</small>
                  <strong>
                    {destination || "e.g. Kathmandu, Pokhara, EBC"}
                  </strong>
                </span>

                <span className="field-chevron">⌄</span>
              </button>

              <div className="search-divider" />

              {/* DATE */}
              <button
                type="button"
                className={`search-field ${dateOpen ? "active" : ""}`}
                onClick={() => {
                  setDateOpen(!dateOpen);
                  setWhereOpen(false);
                  setGuestOpen(false);
                }}
              >
                <span className="search-icon">◷</span>

                <span className="search-field-content">
                  <small>CHECK IN – CHECK OUT</small>

                  <strong>
                    {checkIn
                      ? `${checkIn}${checkOut ? ` — ${checkOut}` : ""}`
                      : "Add date"}
                  </strong>
                </span>

                <span className="field-chevron">⌄</span>
              </button>

              <div className="search-divider" />

              {/* GUESTS */}
              <button
                type="button"
                className={`search-field ${guestOpen ? "active" : ""}`}
                onClick={() => {
                  setGuestOpen(!guestOpen);
                  setWhereOpen(false);
                  setDateOpen(false);
                }}
              >
                <span className="search-icon">♙</span>

                <span className="search-field-content">
                  <small>GUESTS</small>

                  <strong>
                    {totalGuests}{" "}
                    {totalGuests === 1 ? "Guest" : "Guests"}
                  </strong>
                </span>

                <span className="field-chevron">⌄</span>
              </button>

              <button
                type="button"
                className="search-button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSearch();
                }}
              >
                <span>⌕</span>
                Search
              </button>
            </div>

            {/* DESTINATION DROPDOWN */}
            {whereOpen && (
              <div
                className="search-dropdown destination-dropdown"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="dropdown-heading">
                  <span>EXPLORE NEPAL</span>
                  <strong>Where are you going?</strong>
                </div>

                <div className="destination-options">
                  {destinations.slice(0, 4).map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => selectDestination(item.name)}
                    >
                      <img src={item.image} alt={item.name} />

                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.location}</small>
                      </span>

                      <b>→</b>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DATE DROPDOWN */}
            {dateOpen && (
              <div
                className="search-dropdown date-dropdown"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="dropdown-heading">
                  <span>YOUR STAY</span>
                  <strong>When are you travelling?</strong>
                </div>

                <div className="date-fields">
                  <label>
                    <span>CHECK-IN</span>

                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(event) => setCheckIn(event.target.value)}
                    />
                  </label>

                  <label>
                    <span>CHECK-OUT</span>

                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || undefined}
                      onChange={(event) => setCheckOut(event.target.value)}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="done-button"
                  onClick={() => setDateOpen(false)}
                >
                  Done
                </button>
              </div>
            )}

            {/* GUEST DROPDOWN */}
            {guestOpen && (
              <div
                className="search-dropdown guest-dropdown"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="dropdown-heading">
                  <span>TRAVELLERS</span>
                  <strong>Who's joining you?</strong>
                </div>

                <GuestRow
                  title="Adults"
                  subtitle="Age 13+"
                  value={adults}
                  decrease={() => setAdults(Math.max(1, adults - 1))}
                  increase={() => setAdults(adults + 1)}
                />

                <GuestRow
                  title="Children"
                  subtitle="Age 2–12"
                  value={children}
                  decrease={() => setChildren(Math.max(0, children - 1))}
                  increase={() => setChildren(children + 1)}
                />

                <button
                  type="button"
                  className="done-button"
                  onClick={() => setGuestOpen(false)}
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* TRUST */}
          <div className="hero-trust">
            <span className="trust-check">✓</span>

            <strong>Trusted by travellers from 50+ countries</strong>

            <span className="trust-separator" />

            <span>Local expertise</span>
          </div>
        </div>

        {/* SLIDER */}
        <div className="hero-slides">
          {heroImages.map((_, index) => (
            <button
              type="button"
              key={index}
              className={currentImage === index ? "active" : ""}
              onClick={() => setCurrentImage(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* HERO STATS */}
        <div className="hero-bottom">
          <div className="hero-stat">
            <strong>28+</strong>
            <span>Years of experience</span>
          </div>

          <div className="hero-stat">
            <strong>50+</strong>
            <span>Countries welcomed</span>
          </div>

          <div className="hero-stat">
            <strong>4.9</strong>
            <span>Traveller rating</span>
          </div>

          <Link to="/experiences" className="hero-explore-link">
            Explore Nepal <span>↗</span>
          </Link>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="category-section">
        <div className="category-container">
          {categories.map((category) => (
            <Link
              to={category.title === "Tourist Vehicle Rental" ? "/vehicles" : "/rooms"}
              className="category-item"
              key={category.title}
            >
              <div className="category-icon">{category.icon}</div>

              <strong>{category.title}</strong>

              <small>{category.subtitle}</small>
            </Link>
          ))}
        </div>
      </section>

      {/* TRENDING DESTINATIONS */}
      <section className="content-section trending-section">
        <div className="section-top">
          <div>
            <span className="section-label">EXPLORE NEPAL</span>
            <h2>Trending Destinations</h2>
          </div>

          <Link to="/experiences">See All →</Link>
        </div>

        <div className="destination-grid-modern">
          {destinations.map((item) => (
            <Link
              to="/experiences"
              className="trending-card"
              key={item.name}
            >
              <img src={item.image} alt={item.name} loading="lazy" />

              <div className="trending-card-overlay" />

              <div className="trending-card-content">
                <h3>{item.name}</h3>
                <span>{item.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOTELS */}
      <section className="content-section hotel-section">
        <div className="section-top">
          <div>
            <span className="section-label">STAY YOUR WAY</span>
            <h2>Hotels for Every Traveler</h2>
          </div>

          <button type="button" className="map-view-button">
            ⌖ &nbsp; Map View
          </button>
        </div>

        <div className="hotel-filter-row">
          <div className="hotel-filters">
            {hotelFilters.map((filter) => (
              <button
                type="button"
                key={filter}
                className={hotelFilter === filter ? "active" : ""}
                onClick={() => setHotelFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="hotel-layout">
          <div className="hotel-cards">
            {filteredHotels.map((hotel) => (
              <Link to="/rooms" className="hotel-card" key={hotel.name}>
                <div className="hotel-image">
                  <img src={hotel.image} alt={hotel.name} loading="lazy" />

                  <button
                    type="button"
                    className="favorite-button"
                    onClick={(event) => event.preventDefault()}
                    aria-label={`Save ${hotel.name}`}
                  >
                    ♡
                  </button>
                </div>

                <div className="hotel-card-body">
                  <div className="hotel-title-row">
                    <div>
                      <h3>{hotel.name}</h3>
                      <p>⌖ {hotel.location}</p>
                    </div>

                    <div className="hotel-rating">
                      ★ {hotel.rating}
                      <small>({hotel.reviews})</small>
                    </div>
                  </div>

                  <div className="hotel-tags">
                    {hotel.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="hotel-bottom">
                    <span className="hotel-badge">
                      ✓ {hotel.badge}
                    </span>

                    <div className="hotel-price">
                      <strong>{hotel.price}</strong>
                      <small>/night</small>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* MAP */}
          <div className="map-card">
            <div className="map-background">
              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />

              <MapPin className="map-pin pin-one" color="blue" />
              <MapPin className="map-pin pin-two" color="red" />
              <MapPin className="map-pin pin-three" color="orange" />
              <MapPin className="map-pin pin-four" color="blue" />
              <MapPin className="map-pin pin-five" color="blue" />

              <div className="map-label">Kathmandu</div>
            </div>

            <div className="map-hotel-preview">
              <img
                src={hotels[0].image}
                alt={hotels[0].name}
              />

              <div>
                <strong>{hotels[0].name}</strong>
                <span>★ {hotels[0].rating} · {hotels[0].type}</span>
                <b>{hotels[0].price}/night</b>
              </div>
            </div>

            <button type="button" className="explore-map-button">
              ⌖ &nbsp; Explore on Map
            </button>
          </div>
        </div>
      </section>

      {/* GEAR */}
      <section className="content-section gear-section">
        <div className="section-top">
          <div>
            <span className="section-label">TREK SMART</span>
            <h2>Trekking &amp; Hiking Gear</h2>
          </div>

          <span className="section-helper">
            Rent or Buy&nbsp; – &nbsp;Travel Smart
          </span>

          <Link to="/gear">View Shop →</Link>
        </div>

        <div className="gear-grid">
          {gear.map((item) => (
            <Link to="/gear" className="gear-card" key={item.name}>
              <div className="gear-image">
                <img src={item.image} alt={item.name} loading="lazy" />
              </div>

              <div className="gear-content">
                <h3>{item.name}</h3>
                <span>{item.detail}</span>

                <div className="gear-price">
                  {item.price}
                  <small>/day</small>
                </div>

                <b className="rent-label">Rent</b>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="content-section experience-section">
        <div className="section-top">
          <div>
            <span className="section-label">GO BEYOND STAYS</span>
            <h2>Places &amp; Experiences</h2>
          </div>

          <div className="experience-categories">
            <button type="button" className="active">
              Food
            </button>
            <button type="button">Culture</button>
            <button type="button">Cafe</button>
            <button type="button">Adventure</button>
            <button type="button">Nightlife</button>
          </div>
        </div>

        <div className="experience-grid">
          {experiences.map((item) => (
            <Link
              to="/experiences"
              className="experience-card"
              key={item.name}
            >
              <img src={item.image} alt={item.name} loading="lazy" />

              <div className="experience-content">
                <h3>{item.name}</h3>
                <span>⌖ {item.location}</span>
                <b>{item.category}</b>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="content-section community-section">
        <div className="section-top">
          <div>
            <span className="section-label">TRAVEL TOGETHER</span>

            <h2>Backpacker Community</h2>

            <p className="section-subtitle">
              Share · Plan · Travel Together
            </p>
          </div>

          <div className="community-members">
            <div className="avatar-stack">
              <span>U</span>
              <span>A</span>
              <span>M</span>
              <span>R</span>
            </div>

            <small>2.5K Travelers</small>
          </div>
        </div>

        <div className="community-grid">
          {communityPosts.map((post) => (
            <Link
              to="/community" 
              className="community-card"
              key={post.title}
            >
              <img src={post.image} alt={post.title} loading="lazy" />

              <div className="community-card-body">
                <h3>{post.title}</h3>

                <p>{post.text}</p>

                <span>Read More →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-background" />

        <div className="cta-content">
          <span className="section-label">YOUR NEXT ADVENTURE</span>

          <h2>
            Plan Less.
            <br />
            Explore More.
          </h2>

          <p>Join Backpacker Gateways Today</p>

          <small>
            Find your place, your people, your adventure.
          </small>

          <div className="cta-buttons">
            <Link to="/signup" className="cta-primary">
              Create Free Account
            </Link>

            <Link to="/experiences" className="cta-secondary">
              <span>▷</span>
              Watch Tour
            </Link>
          </div>
        </div>

        <div className="cta-person">
          <div className="cta-person-shape" />
        </div>
      </section>

      {/* WHY US */}
      <section className="why-section">
        <div className="why-heading">
          <span className="section-label">TRAVEL WITH CONFIDENCE</span>

          <h2>Why Backpacker Gateways?</h2>
        </div>

        <div className="why-grid">
          {whyUs.map((item) => (
            <div className="why-card" key={item.title}>
              <div className="why-icon">{item.icon}</div>

              <strong>{item.title}</strong>

              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="brand footer-logo">
              <div className="brand-mark">
                <span>⌃</span>
                <span>⌃</span>
                <span>⌃</span>
              </div>

              <div className="brand-text">
                <strong>Backpacker Gateways</strong>

                <small>
                  Explore · Stay · Trek · Connect
                </small>
              </div>
            </Link>

            <p>
              The ultimate platform for backpackers,
              hikers and travellers to explore Nepal
              and beyond with comfort, confidence
              and freedom.
            </p>

            <div className="social-links">
              <a href="#instagram" aria-label="Instagram">
                ◎
              </a>

              <a href="#youtube" aria-label="YouTube">
                ▶
              </a>

              <a href="#x" aria-label="X">
                X
              </a>

              <a href="#facebook" aria-label="Facebook">
                f
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>

            <Link to="/rooms">Hotels</Link>
            <Link to="/trekking">Trekking</Link>
            <Link to="/gear">Gear Shop</Link>
            <Link to="/experiences">Places</Link>
            <Link to="/blog">Blog</Link>
          </div>

          <div className="footer-column">
            <h4>Company</h4>

            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>

          <div className="footer-column app-column">
            <h4>Get the App</h4>

            <a href="#google-play" className="app-button">
              <small>GET IT ON</small>
              <strong>Google Play</strong>
            </a>

            <a href="#app-store" className="app-button">
              <small>Download on the</small>
              <strong>App Store</strong>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 Backpacker Gateways. All rights reserved.
          </span>

          <span>Made with ♥ in Nepal</span>
        </div>
      </footer>
    </main>
  );
}

function GuestRow({
  title,
  subtitle,
  value,
  decrease,
  increase,
}) {
  return (
    <div className="guest-row">
      <div className="guest-information">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>

      <div className="guest-counter">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            decrease();
          }}
          aria-label={`Decrease ${title}`}
        >
          −
        </button>

        <strong>{value}</strong>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            increase();
          }}
          aria-label={`Increase ${title}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function MapPin({ className = "", color = "blue" }) {
  return (
    <span className={`${className} map-pin-${color}`}>
      <span />
    </span>
  );
}



