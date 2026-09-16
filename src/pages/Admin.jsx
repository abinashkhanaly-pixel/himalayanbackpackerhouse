import React from "react";
import { Link } from "react-router-dom";

const Admin = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f7f8fa",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: "240px",
          minHeight: "100vh",
          background: "#111827",
          color: "#fff",
          padding: "30px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "40px",
          }}
        >
          BACKPACKER
          <br />
          GATEWAYS
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Link
            to="/admin/dashboard"
            style={{
              color: "#fff",
              textDecoration: "none",
              padding: "12px",
              borderRadius: "8px",
              background: "#374151",
            }}
          >
            📊 Dashboard
          </Link>

          <Link
            to="/admin/rooms"
            style={{
              color: "#fff",
              textDecoration: "none",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            🏨 Rooms & Hotels
          </Link>

          <Link
            to="/admin/trekking"
            style={{
              color: "#fff",
              textDecoration: "none",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            🏔️ Trekking
          </Link>

          <Link
            to="/admin/trekking/add"
            style={{
              color: "#fff",
              textDecoration: "none",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            ➕ Add Trek
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "32px",
          }}
        >
          Admin Dashboard
        </h1>

        <p
          style={{
            margin: "0 0 35px",
            color: "#6b7280",
          }}
        >
          Manage your Backpacker Gateways website.
        </p>

        {/* DASHBOARD CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 360px))",
            gap: "24px",
            justifyContent: "start",
          }}
        >
          {/* ROOMS CARD */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "28px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "15px" }}>
              🏨
            </div>

            <h2 style={{ margin: "0 0 10px" }}>
              Rooms & Hotels
            </h2>

            <p
              style={{
                color: "#6b7280",
                lineHeight: "1.6",
              }}
            >
              Manage hotel rooms, accommodation listings
              and room information.
            </p>

            <Link to="/admin/rooms">
              <button
                style={{
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Manage Rooms
              </button>
            </Link>
          </div>

          {/* TREKKING CARD */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "28px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "15px" }}>
              🏔️
            </div>

            <h2 style={{ margin: "0 0 10px" }}>
              Trekking
            </h2>

            <p
              style={{
                color: "#6b7280",
                lineHeight: "1.6",
              }}
            >
              Manage trekking packages, itineraries,
              gear information and SEO content.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <Link to="/admin/trekking">
                <button
                  style={{
                    padding: "11px 18px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Manage Treks
                </button>
              </Link>

              <Link to="/admin/trekking/add">
                <button
                  style={{
                    padding: "11px 18px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Add Trek
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;