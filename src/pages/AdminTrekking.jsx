
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminTrekking.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backpacker-gateways-2.onrender.com/api";

function AdminTrekking() {
  const [treks, setTreks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load treks from MongoDB
  const fetchTreks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/treks`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to load trekking packages"
        );
      }

      const trekData =
        result?.data?.treks ||
        result?.data ||
        result?.treks ||
        [];

      setTreks(Array.isArray(trekData) ? trekData : []);
    } catch (err) {
      console.error("Fetch treks error:", err);
      setError(err.message || "Failed to load trekking packages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreks();
  }, []);

  const filteredTreks = treks.filter((trek) =>
    (trek.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Toggle published status in MongoDB
  const togglePublished = async (id) => {
    const trek = treks.find(
      (item) => item._id === id
    );

    if (!trek) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/treks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            published: !trek.published,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to update trek status"
        );
      }

      const updatedTrek =
        result?.data?.trek ||
        result?.data ||
        result?.trek;

      setTreks((current) =>
        current.map((item) =>
          item._id === id
            ? updatedTrek || {
                ...item,
                published: !item.published,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Toggle published error:", err);
      alert(
        err.message || "Failed to update trek status."
      );
    }
  };

  // Delete trek from MongoDB
  const deleteTrek = async (id) => {
    const trek = treks.find(
      (item) => item._id === id
    );

    if (!trek) {
      return;
    }

    if (
      !window.confirm(
        `Delete "${trek.name}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/treks/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to delete trek"
        );
      }

      setTreks((current) =>
        current.filter(
          (item) => item._id !== id
        )
      );
    } catch (err) {
      console.error("Delete trek error:", err);
      alert(
        err.message || "Failed to delete trek."
      );
    }
  };

  return (
    <div className="admin-trekking-page">

      <div className="admin-trekking-header">
        <div>
          <p className="admin-eyebrow">
            BACKPACKER GATEWAYS
          </p>

          <h1>Trekking Management</h1>

          <p>
            Manage trekking packages, prices, availability
            and content.
          </p>
        </div>

        <Link
          to="/admin/trekking/add"
          className="admin-add-trek-btn"
        >
          + Add New Trek
        </Link>
      </div>

      <div className="admin-trekking-stats">

        <div className="admin-stat-card">
          <span>Total Treks</span>
          <strong>{treks.length}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Published</span>

          <strong>
            {
              treks.filter(
                (trek) => trek.published
              ).length
            }
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>Drafts</span>

          <strong>
            {
              treks.filter(
                (trek) => !trek.published
              ).length
            }
          </strong>
        </div>

      </div>

      <div className="admin-trekking-toolbar">

        <input
          type="text"
          placeholder="Search trekking packages..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {loading && (
        <div style={{ padding: "30px", textAlign: "center" }}>
          Loading trekking packages...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "20px",
            color: "red",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="admin-trekking-table-wrapper">

          <table className="admin-trekking-table">

            <thead>
              <tr>
                <th>Image</th>
                <th>Trek</th>
                <th>Duration</th>
                <th>Difficulty</th>
                <th>Altitude</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredTreks.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No trekking packages found.
                  </td>
                </tr>
              ) : (
                filteredTreks.map((trek) => (

                  <tr key={trek._id}>

                    <td>
                      <img
                        src={
                          trek.mainImage ||
                          "/backpacker-logo.png"
                        }
                        alt={trek.name}
                        className="admin-trek-thumb"
                      />
                    </td>

                    <td>
                      <strong>
                        {trek.name}
                      </strong>

                      <small>
                        /trekking/{trek.slug}
                      </small>
                    </td>

                    <td>
                      {trek.duration}
                    </td>

                    <td>
                      {trek.difficulty}
                    </td>

                    <td>
                      {trek.maxAltitude}
                    </td>

                    <td>
                      {trek.currency === "USD"
                        ? "$"
                        : ""}
                      {trek.price}
                    </td>

                    <td>

                      <button
                        className={
                          trek.published
                            ? "status-published"
                            : "status-draft"
                        }
                        onClick={() =>
                          togglePublished(
                            trek._id
                          )
                        }
                      >
                        {trek.published
                          ? "Published"
                          : "Draft"}
                      </button>

                    </td>

                    <td>

                      <div className="admin-action-buttons">

                        <Link
                          to={`/trekking/${trek.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-view"
                        >
                          View
                        </Link>

                        <Link
                          to={`/admin/trekking/edit/${trek._id}`}
                          className="action-edit"
                        >
                          Edit
                        </Link>

                        <button
                          className="action-delete"
                          onClick={() =>
                            deleteTrek(
                              trek._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default AdminTrekking;


