import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Community.css";

const API_URL = "https://backpacker-gateways-2.onrender.com";

export default function CommunityPost() {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/community/${id}`
        );

        if (!response.ok) {
          throw new Error("Post not found");
        }

        const data = await response.json();

        if (data.status && data.status !== "approved") {
          throw new Error("This post is not available.");
        }

        setPost(data);
      } catch (err) {
        console.error("Community post error:", err);

        setError(
          err.message ||
            "Sorry, the community post you are looking for does not exist."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const formatPostDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="community-page">
        <section className="community-post-not-found">
          <div className="community-container">
            <h1>Loading Post...</h1>
            <p>Please wait while we load the community post.</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="community-page">
        <section className="community-post-not-found">
          <div className="community-container">
            <h1>Post Not Found</h1>

            <p>
              {error ||
                "Sorry, the community post you are looking for does not exist."}
            </p>

            <Link
              to="/community"
              className="community-primary-btn"
            >
              Back to Community
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="community-page">
      <section className="community-post-detail">
        <div className="community-container">

          {/* BACK BUTTON */}
          <Link
            to="/community"
            className="back-community-link"
          >
            ← Back to Community
          </Link>

          {/* POST HEADER */}
          <div className="community-post-detail-header">
            <span className="post-category">
              {post.category?.toUpperCase() || "TRAVEL"}
            </span>

            <h1>{post.title}</h1>

            <div className="post-detail-meta">
              <span>
                By {post.author || "Backpacker Gateways"}
              </span>

              <span>
                {post.location || "Nepal"}
              </span>

              <span>
                {formatPostDate(post.createdAt)}
              </span>
            </div>
          </div>

          {/* FEATURED IMAGE */}
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              className="community-post-detail-image"
            />
          ) : (
            <div className="community-post-detail-image community-post-image-placeholder">
              <span>
                {post.location || "Nepal"}
              </span>
            </div>
          )}

          {/* POST CONTENT */}
          <article
            className="community-post-article"
            dangerouslySetInnerHTML={{
              __html: post.content || "",
            }}
          />

          {/* BOTTOM CTA */}
          <div className="community-post-bottom">
            <div className="community-post-bottom-content">
              <span className="community-post-bottom-label">
                BACKPACKER GATEWAYS COMMUNITY
              </span>

              <h3>
                Discover more stories from travellers around the world.
              </h3>
            </div>

            <Link
              to="/community/posts"
              className="community-primary-btn"
            >
              Explore More Posts →
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}