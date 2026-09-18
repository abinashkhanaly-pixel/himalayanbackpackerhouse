import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../services/roomApi";

const PAGE_TITLE = "Luxury Hotels in Nepal | Backpacker Gateways";

const PAGE_DESCRIPTION =
  "Discover luxury hotels in Nepal, from Kathmandu and Pokhara to Chitwan and other popular destinations. Compare rooms, facilities and book your stay with Backpacker Gateways.";

const PAGE_CANONICAL =
  "https://www.backpackergateways.com/rooms";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const previousTitle = document.title;

    const metaSelectors = [
      'meta[name="description"]',
      'meta[name="keywords"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:url"]',
      'meta[property="og:type"]',
      'meta[property="og:image"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'meta[name="twitter:card"]',
      'link[rel="canonical"]',
    ];

    const previousMeta = metaSelectors.map((selector) => {
      const element = document.head.querySelector(selector);

      return {
        selector,
        element,
        attributes: element
          ? Array.from(element.attributes).map((attr) => [
              attr.name,
              attr.value,
            ])
          : null,
      };
    });

    const setMeta = (selector, attribute, content) => {
      let element = document.head.querySelector(selector);

      if (!element) {
        element = document.createElement(
          attribute === "href" ? "link" : "meta"
        );

        if (attribute === "href") {
          element.setAttribute("rel", "canonical");
        }

        document.head.appendChild(element);
      }

      element.setAttribute(attribute, content);
    };

    document.title = PAGE_TITLE;

    setMeta(
      'meta[name="description"]',
      "content",
      PAGE_DESCRIPTION
    );

    setMeta(
      'meta[name="keywords"]',
      "content",
      "luxury hotels in Nepal, luxury hotels Nepal, hotels in Nepal, best hotels in Nepal, luxury hotel Kathmandu, luxury hotel Pokhara, hotels Kathmandu, hotels Pokhara, Nepal hotels, Backpacker Gateways"
    );

    setMeta(
      'meta[property="og:title"]',
      "content",
      PAGE_TITLE
    );

    setMeta(
      'meta[property="og:description"]',
      "content",
      PAGE_DESCRIPTION
    );

    setMeta(
      'meta[property="og:url"]',
      "content",
      PAGE_CANONICAL
    );

    setMeta(
      'meta[property="og:type"]',
      "content",
      "website"
    );

    setMeta(
      'meta[property="og:image"]',
      "content",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80"
    );

    setMeta(
      'meta[name="twitter:card"]',
      "content",
      "summary_large_image"
    );

    setMeta(
      'meta[name="twitter:title"]',
      "content",
      PAGE_TITLE
    );

    setMeta(
      'meta[name="twitter:description"]',
      "content",
      PAGE_DESCRIPTION
    );

    setMeta(
      'link[rel="canonical"]',
      "href",
      PAGE_CANONICAL
    );

    async function loadRooms() {
      try {
        const result = await getRooms();

        console.log("ROOM RESULT:", result);

        if (Array.isArray(result?.data)) {
          setRooms(result.data);
        } else if (Array.isArray(result)) {
          setRooms(result);
        } else {
          setRooms([]);
        }
      } catch (error) {
        console.error("ROOM ERROR:", error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    }

    loadRooms();

    return () => {
      document.title = previousTitle;

      previousMeta.forEach(
        ({ selector, element, attributes }) => {
          const currentElement =
            document.head.querySelector(selector);

          if (element && attributes) {
            if (currentElement) {
              Array.from(currentElement.attributes).forEach(
                (attr) => {
                  currentElement.removeAttribute(attr.name);
                }
              );

              attributes.forEach(([name, value]) => {
                currentElement.setAttribute(name, value);
              });
            } else {
              const restored =
                document.createElement(
                  element.tagName.toLowerCase()
                );

              attributes.forEach(([name, value]) => {
                restored.setAttribute(name, value);
              });

              document.head.appendChild(restored);
            }
          } else if (currentElement) {
            currentElement.remove();
          }
        }
      );
    };
  }, []);

  return (
    <div className="rooms-page">

      {/* HERO */}

      <section className="rooms-hero">

        <div className="rooms-hero-overlay">

          <div className="rooms-hero-content">

            <span>LUXURY HOTELS IN NEPAL</span>

            <h1>
              Luxury Hotels
              <br />
              in Nepal
            </h1>

            <p>
              Discover luxury hotels and premium stays
              across Nepal. From Kathmandu and Pokhara
              to Chitwan and the Himalayas, find comfortable
              rooms, excellent facilities and memorable stays.
            </p>

          </div>

        </div>

      </section>

      {/* ROOMS */}

      <section className="rooms-section">

        <div className="rooms-container">

          <div className="section-heading">

            <span>
              EXPLORE HOTELS IN NEPAL
            </span>

            <h2>
              Luxury Hotels in Nepal
            </h2>

            <p>
              Explore carefully selected hotels and stays
              across Nepal. Compare rooms, prices,
              facilities and locations before booking
              your next Himalayan stay.
            </p>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="loading">
              Loading luxury hotels in Nepal...
            </div>
          )}

          {/* ROOMS */}

          {!loading && rooms.length > 0 && (

            <>

              <div className="rooms-count">

                <strong>
                  {rooms.length}
                </strong>{" "}
                hotels and stays available

              </div>

              <div className="rooms-grid">

                {rooms.map((room) => (

                  <article
                    className="room-card"
                    key={room._id}
                  >

                    {/* IMAGE */}

                    <div className="room-image">

                      <img
                        src={
                          room.images?.[0] ||
                          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
                        }
                        alt={`${room.name} in ${
                          room.destination || "Nepal"
                        }`}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />

                      {room.available && (
                        <span className="available">
                          ● Available
                        </span>
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="room-content">

                      <div className="room-top">

                        <div>

                          <h3>
                            {room.name}
                          </h3>

                          <p className="location">
                            📍 {room.destination}
                          </p>

                        </div>

                        <div className="price">

                          <strong>
                            NPR{" "}
                            {Number(
                              room.price || 0
                            ).toLocaleString("en-NP")}
                          </strong>

                          <small>
                            per night
                          </small>

                        </div>

                      </div>

                      <p className="description">
                        {room.description}
                      </p>

                      {/* INFO */}

                      <div className="info">

                        <span>
                          👥 {room.capacity} Guests
                        </span>

                        <span>
                          🛏 {room.beds}
                        </span>

                      </div>

                      {/* AMENITIES */}

                      <div className="amenities">

                        {room.amenities
                          ?.slice(0, 4)
                          .map(
                            (item, index) => (
                              <span key={index}>
                                {item}
                              </span>
                            )
                          )}

                      </div>

                      {/* BUTTONS */}

                      <div className="buttons">

                        <Link
                          to={`/rooms/${
                            room.seoSlug || room._id
                          }`}
                          className="details"
                        >
                          View Details
                        </Link>

                        <Link
                          to={`/booking?room=${room._id}`}
                          className="book"
                        >
                          Book Now
                        </Link>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            </>

          )}

          {/* NO ROOMS */}

          {!loading && rooms.length === 0 && (

            <div className="no-rooms">

              <h2>
                Luxury Hotels in Nepal
              </h2>

              <p>
                No hotel rooms are currently available.
                Please check again soon.
              </p>

            </div>

          )}

        </div>

      </section>

      {/* SEO CONTENT */}

      <section className="rooms-seo-section">

        <div className="rooms-seo-container">

          <h2>
            Find Luxury Hotels in Nepal
          </h2>

          <p>
            Looking for luxury hotels in Nepal?
            Backpacker Gateways helps travelers discover
            quality hotels and comfortable stays in some
            of Nepal's most popular destinations.
          </p>

          <p>
            Explore hotels in Kathmandu, Pokhara,
            Chitwan and other destinations across Nepal.
            Compare room types, prices, facilities and
            locations to find a stay that matches your
            travel plans.
          </p>

          <p>
            Whether you are visiting Nepal for a holiday,
            business trip, trekking adventure or cultural
            experience, explore our hotel collection and
            find your ideal place to stay.
          </p>

        </div>

      </section>

      {/* CSS */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .rooms-page {
          width: 100%;
          min-height: 100vh;
          background: #f7f8f6;
          color: #18231d;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* HERO */

        .rooms-hero {
          width: 100%;
          min-height: 500px;

          background-image:
            url("https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2000&q=85");

          background-size: cover;
          background-position: center;
        }

        .rooms-hero-overlay {
          min-height: 500px;
          width: 100%;

          display: flex;
          align-items: center;

          background:
            linear-gradient(
              90deg,
              rgba(10,20,15,.82),
              rgba(10,20,15,.35),
              rgba(10,20,15,.15)
            );
        }

        .rooms-hero-content {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 6%;
          color: white;
        }

        .rooms-hero-content span {
          display: block;
          margin-bottom: 18px;

          font-size: 13px;
          font-weight: 800;
          letter-spacing: 3px;
        }

        .rooms-hero-content h1 {
          margin: 0 0 20px;

          font-size:
            clamp(44px, 6vw, 76px);

          line-height: 1.05;
          font-weight: 700;
        }

        .rooms-hero-content p {
          max-width: 680px;

          margin: 0;

          font-size: 18px;
          line-height: 1.7;

          color: rgba(255,255,255,.9);
        }

        /* SECTION */

        .rooms-section {
          padding: 90px 6%;
        }

        .rooms-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* HEADING */

        .section-heading {
          max-width: 800px;
          margin: 0 auto 50px;
          text-align: center;
        }

        .section-heading span {
          color: #8b6b3f;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 2px;
        }

        .section-heading h2 {
          margin: 12px 0 16px;

          font-size:
            clamp(34px, 5vw, 54px);

          line-height: 1.1;
        }

        .section-heading p {
          margin: 0;

          color: #68716b;

          font-size: 17px;
          line-height: 1.7;
        }

        /* COUNT */

        .rooms-count {
          margin-bottom: 20px;

          color: #68716b;

          font-size: 14px;
        }

        .rooms-count strong {
          color: #18231d;
        }

        /* GRID */

        .rooms-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 28px;
        }

        /* CARD */

        .room-card {
          overflow: hidden;

          background: white;

          border: 1px solid #e2e6e1;

          border-radius: 22px;

          box-shadow:
            0 12px 35px
            rgba(24,35,29,.08);

          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .room-card:hover {
          transform:
            translateY(-7px);

          box-shadow:
            0 22px 50px
            rgba(24,35,29,.14);
        }

        /* IMAGE */

        .room-image {
          position: relative;

          height: 260px;

          overflow: hidden;

          background: #dfe5df;
        }

        .room-image img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          transition:
            transform .5s ease;
        }

        .room-card:hover
        .room-image img {
          transform:
            scale(1.06);
        }

        .available {
          position: absolute;

          top: 16px;
          left: 16px;

          padding:
            8px 13px;

          background:
            rgba(255,255,255,.95);

          border-radius: 30px;

          color: #28613b;

          font-size: 12px;
          font-weight: 800;
        }

        /* CONTENT */

        .room-content {
          padding: 24px;
        }

        .room-top {
          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-start;

          gap: 15px;
        }

        .room-top h3 {
          margin: 0 0 8px;

          font-size: 22px;

          line-height: 1.25;

          color: #18231d;
        }

        .location {
          margin: 0;

          color: #8b6b3f;

          font-size: 12px;

          font-weight: 700;
        }

        .price {
          text-align: right;

          flex-shrink: 0;
        }

        .price strong {
          display: block;

          color: #8b6b3f;

          font-size: 19px;
        }

        .price small {
          color: #8b918d;

          font-size: 11px;
        }

        .description {
          margin: 18px 0;

          color: #68716b;

          font-size: 14px;

          line-height: 1.65;

          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* INFO */

        .info {
          display: flex;

          flex-wrap: wrap;

          gap: 8px;

          padding-bottom: 18px;

          border-bottom:
            1px solid #eceeeb;
        }

        .info span {
          padding:
            8px 10px;

          background:
            #f4f6f3;

          border-radius: 8px;

          color: #4d5751;

          font-size: 12px;

          font-weight: 600;
        }

        /* AMENITIES */

        .amenities {
          display: flex;

          flex-wrap: wrap;

          gap: 8px;

          margin:
            17px 0 22px;
        }

        .amenities span {
          color: #59635d;

          font-size: 12px;
        }

        .amenities span:not(:last-child)::after {
          content: "•";

          margin-left: 8px;

          color: #aaa;
        }

        /* BUTTONS */

        .buttons {
          display: flex;

          gap: 10px;
        }

        .details,
        .book {
          flex: 1;

          text-align: center;

          padding:
            13px 12px;

          border-radius: 10px;

          text-decoration: none;

          font-size: 13px;

          font-weight: 800;

          transition: .25s ease;
        }

        .details {
          color: #26332b;

          background: white;

          border:
            1px solid #d8ddd8;
        }

        .details:hover {
          background: #f3f5f2;
        }

        .book {
          color: white;

          background: #18231d;

          border:
            1px solid #18231d;
        }

        .book:hover {
          background: #8b6b3f;

          border-color:
            #8b6b3f;
        }

        /* SEO CONTENT */

        .rooms-seo-section {
          padding:
            0 6% 90px;
        }

        .rooms-seo-container {
          max-width: 950px;
          margin: 0 auto;

          padding: 45px;

          background: white;

          border:
            1px solid #e2e6e1;

          border-radius: 22px;
        }

        .rooms-seo-container h2 {
          margin:
            0 0 20px;

          font-size:
            clamp(28px, 4vw, 40px);

          line-height: 1.2;
        }

        .rooms-seo-container p {
          margin:
            0 0 16px;

          color: #68716b;

          font-size: 16px;

          line-height: 1.8;
        }

        .rooms-seo-container p:last-child {
          margin-bottom: 0;
        }

        /* LOADING */

        .loading {
          padding: 100px 20px;

          text-align: center;

          color: #68716b;

          font-size: 18px;
        }

        /* NO ROOMS */

        .no-rooms {
          padding: 80px 20px;

          background: white;

          border-radius: 20px;

          text-align: center;
        }

        .no-rooms h2 {
          margin-bottom: 10px;
        }

        .no-rooms p {
          color: #68716b;
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {

          .rooms-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }

        @media (max-width: 650px) {

          .rooms-hero {
            min-height: 430px;
          }

          .rooms-hero-overlay {
            min-height: 430px;
          }

          .rooms-hero-content {
            padding:
              50px 20px;
          }

          .rooms-hero-content h1 {
            font-size:
              clamp(42px, 12vw, 58px);
          }

          .rooms-hero-content p {
            font-size: 16px;
          }

          .rooms-section {
            padding:
              60px 18px;
          }

          .rooms-grid {
            grid-template-columns: 1fr;
          }

          .room-top {
            flex-direction: column;
          }

          .price {
            text-align: left;
          }

          .buttons {
            flex-direction: column;
          }

          .rooms-seo-section {
            padding:
              0 18px 60px;
          }

          .rooms-seo-container {
            padding: 28px 22px;
          }

        }

      `}</style>

    </div>
  );
}