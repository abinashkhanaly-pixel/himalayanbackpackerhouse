import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImage,
} from "../services/roomApi";

const API_URL =
  "https://backpacker-gateways-2.onrender.com";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [creatingPost, setCreatingPost] = useState(false);

  // =========================
  // ROOM FORM
  // =========================

  const [form, setForm] = useState({
    name: "",
    destination: "",
    seoSlug: "",
    seoTitle: "",
    seoDescription: "",
    description: "",
    price: "",
    capacity: "",
    beds: "",
    amenities: "",
    images: [],
    available: true,
  });

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // =========================
  // COMMUNITY FORM
  // =========================

  const [communityForm, setCommunityForm] = useState({
    title: "",
    category: "Travel",
    author: "Backpacker Gateways",
    location: "Nepal",
    image: "",
    content: "",
    featured: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [savingRoom, setSavingRoom] = useState(false);

  // =========================
  // ROOMS
  // =========================

  const loadRooms = async () => {
    try {
      setLoading(true);

      const result = await getRooms();

      if (Array.isArray(result?.data)) {
        setRooms(result.data);
      } else if (Array.isArray(result)) {
        setRooms(result);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error("ADMIN ROOM ERROR:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // COMMUNITY POSTS
  // =========================

  const loadPosts = async () => {
    try {
      setPostsLoading(true);

      const response = await fetch(
        `${API_URL}/api/community`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load community posts"
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setPosts(data);
      } else if (Array.isArray(data?.data)) {
        setPosts(data.data);
      } else if (Array.isArray(data?.posts)) {
        setPosts(data.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error(
        "COMMUNITY ADMIN ERROR:",
        error
      );
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    loadPosts();
  }, []);

  // =========================
  // ROOM FORM
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      destination: "",
      seoSlug: "",
      seoTitle: "",
      seoDescription: "",
      description: "",
      price: "",
      capacity: "",
      beds: "",
      amenities: "",
      images: [],
      available: true,
    });

    setImageUrlInput("");
    setUploadStatus("");
    setEditingId(null);
  };

  // =========================
  // ADD IMAGE URL
  // =========================

  const addImageUrl = () => {
    const url = imageUrlInput.trim();

    if (!url) return;

    setForm((previous) => {
      if (previous.images.includes(url)) {
        return previous;
      }

      return {
        ...previous,
        images: [
          ...previous.images,
          url,
        ],
      };
    });

    setImageUrlInput("");
  };

  // =========================
  // REMOVE IMAGE
  // =========================

  const removeImage = (index) => {
    setForm((previous) => ({
      ...previous,
      images: previous.images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      ),
    }));
  };

  // =========================
  // UPLOAD IMAGES
  // =========================

  const handleImageUpload = async (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    try {
      setUploadingImages(true);
      setUploadStatus(
        `Uploading ${files.length} image${
          files.length > 1 ? "s" : ""
        }...`
      );

      const uploadedUrls = [];

      for (
        let index = 0;
        index < files.length;
        index++
      ) {
        const file = files[index];

        setUploadStatus(
          `Uploading image ${
            index + 1
          } of ${files.length}...`
        );

        const result =
          await uploadRoomImage(file);

        const uploadedUrl =
          result?.data?.url ||
          result?.url;

        if (!uploadedUrl) {
          throw new Error(
            "Image uploaded but no image URL was returned."
          );
        }

        uploadedUrls.push(uploadedUrl);
      }

      setForm((previous) => ({
        ...previous,
        images: [
          ...previous.images,
          ...uploadedUrls,
        ],
      }));

      setUploadStatus(
        `${uploadedUrls.length} image${
          uploadedUrls.length > 1
            ? "s"
            : ""
        } uploaded successfully.`
      );
    } catch (error) {
      console.error(
        "IMAGE UPLOAD ERROR:",
        error
      );

      setUploadStatus("");

      alert(
        error.message ||
          "Image upload failed."
      );
    } finally {
      setUploadingImages(false);

      event.target.value = "";
    }
  };

  // =========================
  // ROOM SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadingImages) {
      alert(
        "Please wait until image uploads are finished."
      );
      return;
    }

    try {
      setSavingRoom(true);

      const cleanSlug = form.seoSlug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const roomData = {
        name: form.name.trim(),
        destination:
          form.destination.trim(),

        // SEO
        seoSlug: cleanSlug,
        seoTitle:
          form.seoTitle.trim(),
        seoDescription:
          form.seoDescription.trim(),

        // ROOM
        description:
          form.description,
        price: Number(form.price),
        capacity: Number(
          form.capacity
        ),
        beds: form.beds,

        amenities:
          form.amenities
            .split(",")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),

        images: form.images
          .map((image) =>
            image.trim()
          )
          .filter(Boolean),

        available: form.available,
      };

      if (editingId) {
        await updateRoom(
          editingId,
          roomData
        );

        alert(
          "Room updated successfully"
        );
      } else {
        await createRoom(roomData);

        alert(
          "Room added successfully"
        );
      }

      resetForm();

      await loadRooms();
    } catch (error) {
      console.error(
        "ROOM SAVE ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to save room."
      );
    } finally {
      setSavingRoom(false);
    }
  };

  // =========================
  // EDIT ROOM
  // =========================

  const handleEdit = (room) => {
    setEditingId(room._id);

    setForm({
      name: room.name || "",
      destination:
        room.destination || "",

      seoSlug:
        room.seoSlug || "",
      seoTitle:
        room.seoTitle || "",
      seoDescription:
        room.seoDescription || "",

      description:
        room.description || "",
      price:
        room.price ?? "",
      capacity:
        room.capacity ?? "",
      beds:
        room.beds || "",

      amenities:
        room.amenities?.join(
          ", "
        ) || "",

      images: Array.isArray(
        room.images
      )
        ? room.images
        : [],

      available:
        room.available ?? true,
    });

    setImageUrlInput("");
    setUploadStatus("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE ROOM
  // =========================

  const handleDelete = async (
    id
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this room?"
      );

    if (!confirmDelete) return;

    try {
      await deleteRoom(id);

      alert(
        "Room deleted successfully"
      );

      await loadRooms();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================
  // COMMUNITY FORM
  // =========================

  const handleCommunityChange = (
    e
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setCommunityForm({
      ...communityForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleContentChange = (
    value
  ) => {
    setCommunityForm({
      ...communityForm,
      content: value,
    });
  };

  const resetCommunityForm = () => {
    setCommunityForm({
      title: "",
      category: "Travel",
      author: "Backpacker Gateways",
      location: "Nepal",
      image: "",
      content: "",
      featured: false,
    });
  };

  const handleCreatePost = async (
    e
  ) => {
    e.preventDefault();

    try {
      setCreatingPost(true);

      const response =
        await fetch(
          `${API_URL}/api/community`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              communityForm
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create community post"
        );
      }

      alert(
        "Community post created successfully. It is now pending approval."
      );

      resetCommunityForm();

      await loadPosts();
    } catch (error) {
      console.error(
        "CREATE POST ERROR:",
        error
      );

      alert(error.message);
    } finally {
      setCreatingPost(false);
    }
  };

  // =========================
  // COMMUNITY ACTIONS
  // =========================

  const updatePostStatus = async (
    post,
    status
  ) => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/community/${post._id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update post"
        );
      }

      alert(
        `Post ${status} successfully`
      );

      await loadPosts();
    } catch (error) {
      console.error(
        "POST STATUS ERROR:",
        error
      );

      alert(error.message);
    }
  };

  const deletePost = async (
    id
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this community post?"
      );

    if (!confirmDelete) return;

    try {
      const response =
        await fetch(
          `${API_URL}/api/community/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete community post"
        );
      }

      alert(
        "Community post deleted successfully"
      );

      await loadPosts();
    } catch (error) {
      console.error(
        "DELETE POST ERROR:",
        error
      );

      alert(error.message);
    }
  };

  const getPostTitle = (
    post
  ) => {
    return (
      post.title ||
      post.name ||
      post.heading ||
      "Community Post"
    );
  };

  const getPostText = (
    post
  ) => {
    return (
      post.content ||
      post.description ||
      post.text ||
      post.body ||
      ""
    );
  };

  const getPostImage = (
    post
  ) => {
    return (
      post.image ||
      post.imageUrl ||
      post.images?.[0] ||
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
    );
  };

  const getPostStatus = (
    post
  ) => {
    return post.status || "pending";
  };

  // =========================
  // RICH TEXT EDITOR
  // =========================

  const quillModules = {
    toolbar: [
      [
        {
          header: [
            1,
            2,
            3,
            4,
            false,
          ],
        },
      ],
      [
        "bold",
        "italic",
        "underline",
        "strike",
      ],
      [{ align: [] }],
      [
        { list: "ordered" },
        { list: "bullet" },
      ],
      ["blockquote"],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "list",
    "bullet",
    "blockquote",
    "link",
  ];

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* ================= HEADER ================= */}

        <div className="admin-header">
          <div>
            <span>
              BACKPACKER GATEWAYS
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage rooms, hotels and
              community posts.
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={() => {
              loadRooms();
              loadPosts();
            }}
          >
            Refresh Dashboard
          </button>
        </div>

        {/* ================= ROOM MANAGEMENT ================= */}

        <div className="section-label">
          ROOM MANAGEMENT
        </div>

        <div className="admin-card">

          <h2>
            {editingId
              ? "Edit Room"
              : "Add New Room"}
          </h2>

          <form
            onSubmit={handleSubmit}
          >

            <div className="form-grid">

              {/* ROOM NAME */}

              <div className="field">

                <label>
                  Room / Hotel Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  placeholder="Deluxe Mountain View Room"
                  required
                />

              </div>

              {/* DESTINATION */}

              <div className="field">

                <label>
                  Destination
                </label>

                <input
                  name="destination"
                  value={
                    form.destination
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Kathmandu, Nepal"
                  required
                />

              </div>

              {/* SEO */}

              <div className="field full seo-heading">

                <strong>
                  SEO SETTINGS
                </strong>

                <small>
                  These fields help Google
                  understand and display
                  this room page.
                </small>

              </div>

              {/* SEO SLUG */}

              <div className="field">

                <label>
                  SEO URL / Slug
                </label>

                <input
                  name="seoSlug"
                  value={
                    form.seoSlug
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="deluxe-mountain-view-room-kathmandu"
                />

                <small>
                  Lowercase words separated
                  by hyphens. Do not include
                  https://
                </small>

              </div>

              {/* SEO TITLE */}

              <div className="field">

                <label>
                  SEO Title
                </label>

                <input
                  name="seoTitle"
                  value={
                    form.seoTitle
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Deluxe Mountain View Room in Kathmandu | Backpacker Gateways"
                />

                <small>
                  Keep the title clear and
                  preferably around 50–60
                  characters.
                </small>

              </div>

              {/* SEO DESCRIPTION */}

              <div className="field full">

                <label>
                  SEO Description
                </label>

                <textarea
                  name="seoDescription"
                  value={
                    form.seoDescription
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Book a Deluxe Mountain View Room in Kathmandu with Backpacker Gateways. Comfortable accommodation near Thamel with modern amenities."
                  rows="4"
                />

                <small>
                  Write a unique, natural
                  description. Around 150–160
                  characters is a good target.
                </small>

              </div>

              {/* PRICE */}

              <div className="field">

                <label>
                  Price Per Night (NPR)
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={
                    handleChange
                  }
                  placeholder="3200"
                  min="0"
                  required
                />

              </div>

              {/* CAPACITY */}

              <div className="field">

                <label>
                  Guest Capacity
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={
                    form.capacity
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="2"
                  min="1"
                  required
                />

              </div>

              {/* BEDS */}

              <div className="field">

                <label>
                  Beds
                </label>

                <input
                  name="beds"
                  value={form.beds}
                  onChange={
                    handleChange
                  }
                  placeholder="1 Double Bed"
                />

              </div>

              {/* =========================
                  IMAGE UPLOAD
              ========================= */}

              <div className="field full image-management">

                <label>
                  Room Images
                </label>

                <div className="upload-box">

                  <div className="upload-title">
                    Upload images from your
                    computer or phone
                  </div>

                  <div className="upload-help">
                    JPG, JPEG, PNG or WebP.
                    Images are automatically
                    optimized and stored as WebP.
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={
                      handleImageUpload
                    }
                    disabled={
                      uploadingImages
                    }
                  />

                  {uploadingImages && (
                    <div className="upload-status uploading">
                      {uploadStatus ||
                        "Uploading images..."}
                    </div>
                  )}

                  {!uploadingImages &&
                    uploadStatus && (
                      <div className="upload-status success">
                        {uploadStatus}
                      </div>
                    )}

                </div>

                {/* OLD URL OPTION */}

                <div className="legacy-image-box">

                  <label>
                    Add Existing Image URL
                  </label>

                  <div className="url-add-row">

                    <input
                      type="url"
                      value={
                        imageUrlInput
                      }
                      onChange={(e) =>
                        setImageUrlInput(
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/image.jpg"
                    />

                    <button
                      type="button"
                      className="add-image-btn"
                      onClick={
                        addImageUrl
                      }
                    >
                      Add URL
                    </button>

                  </div>

                  <small>
                    Existing external image
                    URLs can still be used.
                  </small>

                </div>

                {/* IMAGE PREVIEW */}

                {form.images.length >
                  0 && (
                  <div className="image-preview-section">

                    <div className="image-preview-heading">

                      <strong>
                        Selected Images
                      </strong>

                      <span>
                        {form.images.length}{" "}
                        image
                        {form.images.length !==
                        1
                          ? "s"
                          : ""}
                      </span>

                    </div>

                    <div className="image-preview-grid">

                      {form.images.map(
                        (
                          image,
                          index
                        ) => (

                          <div
                            className="image-preview-card"
                            key={`${image}-${index}`}
                          >

                            <img
                              src={image}
                              alt={`Room image ${
                                index + 1
                              }`}
                            />

                            {index ===
                              0 && (
                              <span className="main-image-badge">
                                MAIN IMAGE
                              </span>
                            )}

                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() =>
                                removeImage(
                                  index
                                )
                              }
                              disabled={
                                uploadingImages
                              }
                            >
                              ×
                            </button>

                            <div className="image-number">
                              Image{" "}
                              {index + 1}
                            </div>

                          </div>

                        )
                      )}

                    </div>

                    <small>
                      The first image is used as
                      the main room image.
                    </small>

                  </div>
                )}

              </div>

              {/* DESCRIPTION */}

              <div className="field full">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the hotel or room..."
                  rows="5"
                  required
                />

              </div>

              {/* AMENITIES */}

              <div className="field full">

                <label>
                  Amenities
                </label>

                <input
                  name="amenities"
                  value={
                    form.amenities
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Mountain View, WiFi, Restaurant, Hot Shower"
                />

                <small>
                  Separate amenities using
                  commas.
                </small>

              </div>

              {/* AVAILABLE */}

              <div className="available-field">

                <label>

                  <input
                    type="checkbox"
                    name="available"
                    checked={
                      form.available
                    }
                    onChange={
                      handleChange
                    }
                  />

                  Room Available

                </label>

              </div>

            </div>

            <div className="form-buttons">

              <button
                type="submit"
                className="save-btn"
                disabled={
                  savingRoom ||
                  uploadingImages
                }
              >
                {savingRoom
                  ? editingId
                    ? "Updating Room..."
                    : "Adding Room..."
                  : editingId
                  ? "Update Room"
                  : "Add Room"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    resetForm
                  }
                  disabled={
                    savingRoom
                  }
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </div>

        {/* ================= EXISTING ROOMS ================= */}

        <div className="rooms-admin-section">

          <div className="rooms-title">

            <h2>
              Existing Rooms
            </h2>

            <span>
              {rooms.length} rooms
            </span>

          </div>

          {loading ? (

            <div className="loading">
              Loading rooms...
            </div>

          ) : rooms.length ===
            0 ? (

            <div className="empty">
              No rooms found.
            </div>

          ) : (

            <div className="admin-rooms-grid">

              {rooms.map(
                (room) => (

                  <div
                    className="admin-room-card"
                    key={room._id}
                  >

                    <img
                      src={
                        room.images?.[0] ||
                        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={
                        room.name
                      }
                    />

                    <div className="admin-room-content">

                      <h3>
                        {room.name}
                      </h3>

                      <p className="destination">
                        {
                          room.destination
                        }
                      </p>

                      {room.seoSlug && (
                        <p className="seo-url-display">
                          /rooms/
                          {
                            room.seoSlug
                          }
                        </p>
                      )}

                      <p>
                        {
                          room.description
                        }
                      </p>

                      <div className="room-meta">

                        <strong>
                          NPR{" "}
                          {Number(
                            room.price ||
                              0
                          ).toLocaleString(
                            "en-NP"
                          )}
                        </strong>

                        <span>
                          {
                            room.capacity
                          }{" "}
                          Guests
                        </span>

                      </div>

                      <div className="admin-actions">

                        <button
                          onClick={() =>
                            handleEdit(
                              room
                            )
                          }
                          className="edit-btn"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              room._id
                            )
                          }
                          className="delete-btn"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* ================= COMMUNITY ================= */}

        <div className="community-section">

          <div className="community-header">

            <div>

              <div className="section-label">
                COMMUNITY MANAGEMENT
              </div>

              <h2>
                Community Posts
              </h2>

              <p>
                Create, review and manage
                community posts.
              </p>

            </div>

            <button
              className="refresh-community-btn"
              onClick={
                loadPosts
              }
            >
              Refresh Posts
            </button>

          </div>

          {/* ================= CREATE NEW POST ================= */}

          <div className="community-create-card">

            <div className="create-post-heading">

              <div>

                <span className="create-label">
                  ADMIN POST
                </span>

                <h3>
                  Create New Community
                  Post
                </h3>

                <p>
                  Publish a new story,
                  travel update, guide or
                  community announcement.
                </p>

              </div>

            </div>

            <form
              onSubmit={
                handleCreatePost
              }
              className="community-form"
            >

              <div className="community-form-grid">

                <div className="field">

                  <label>
                    Post Title
                  </label>

                  <input
                    name="title"
                    value={
                      communityForm.title
                    }
                    onChange={
                      handleCommunityChange
                    }
                    placeholder="10 Things to Know Before Everest Base Camp"
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      communityForm.category
                    }
                    onChange={
                      handleCommunityChange
                    }
                  >

                    <option value="Travel">
                      Travel
                    </option>

                    <option value="Trekking">
                      Trekking
                    </option>

                    <option value="Adventure">
                      Adventure
                    </option>

                    <option value="Destination">
                      Destination
                    </option>

                    <option value="Tips">
                      Travel Tips
                    </option>

                    <option value="News">
                      News
                    </option>

                    <option value="Community">
                      Community
                    </option>

                  </select>

                </div>

                <div className="field">

                  <label>
                    Author
                  </label>

                  <input
                    name="author"
                    value={
                      communityForm.author
                    }
                    onChange={
                      handleCommunityChange
                    }
                    placeholder="Backpacker Gateways"
                  />

                </div>

                <div className="field">

                  <label>
                    Location
                  </label>

                  <input
                    name="location"
                    value={
                      communityForm.location
                    }
                    onChange={
                      handleCommunityChange
                    }
                    placeholder="Nepal"
                  />

                </div>

                <div className="field full">

                  <label>
                    Image URL
                  </label>

                  <input
                    name="image"
                    value={
                      communityForm.image
                    }
                    onChange={
                      handleCommunityChange
                    }
                    placeholder="https://..."
                  />

                  <small>
                    Add a public image URL
                    for the post.
                  </small>

                </div>

                {/* RICH TEXT */}

                <div className="field full">

                  <label>
                    Post Content
                  </label>

                  <div className="rich-editor">

                    <ReactQuill
                      theme="snow"
                      value={
                        communityForm.content
                      }
                      onChange={
                        handleContentChange
                      }
                      modules={
                        quillModules
                      }
                      formats={
                        quillFormats
                      }
                      placeholder="Write your community post here..."
                    />

                  </div>

                  <small className="editor-help">
                    Use the toolbar to add
                    headings, bold text,
                    lists and text alignment.
                  </small>

                </div>

                <div className="featured-field">

                  <label>

                    <input
                      type="checkbox"
                      name="featured"
                      checked={
                        communityForm.featured
                      }
                      onChange={
                        handleCommunityChange
                      }
                    />

                    Feature this post

                  </label>

                </div>

              </div>

              <div className="community-form-buttons">

                <button
                  type="submit"
                  className="create-post-btn"
                  disabled={
                    creatingPost
                  }
                >
                  {creatingPost
                    ? "Creating Post..."
                    : "Create Community Post"}
                </button>

                <button
                  type="button"
                  className="clear-post-btn"
                  onClick={
                    resetCommunityForm
                  }
                  disabled={
                    creatingPost
                  }
                >
                  Clear
                </button>

              </div>

            </form>

          </div>

          {/* ================= POST LIST ================= */}

          {postsLoading ? (

            <div className="loading">
              Loading community posts...
            </div>

          ) : posts.length ===
            0 ? (

            <div className="empty">
              No community posts found.
            </div>

          ) : (

            <div className="community-grid">

              {posts.map((post) => {

                const status =
                  getPostStatus(
                    post
                  );

                return (

                  <div
                    className="community-card"
                    key={post._id}
                  >

                    <img
                      src={getPostImage(
                        post
                      )}
                      alt={getPostTitle(
                        post
                      )}
                    />

                    <div className="community-content">

                      <div className="post-top">

                        <span className="post-label">
                          COMMUNITY
                        </span>

                        <span
                          className={`status ${status}`}
                        >
                          {status}
                        </span>

                      </div>

                      <h3>
                        {getPostTitle(
                          post
                        )}
                      </h3>

                      {post.author && (
                        <p className="post-author">
                          By{" "}
                          {post.author}
                        </p>
                      )}

                      {post.category && (
                        <p className="post-category">
                          {
                            post.category
                          }
                          {post.location
                            ? ` • ${post.location}`
                            : ""}
                        </p>
                      )}

                      <div
                        className="post-text"
                        dangerouslySetInnerHTML={{
                          __html:
                            getPostText(
                              post
                            ),
                        }}
                      />

                      <div className="post-actions">

                        <button
                          className="approve-btn"
                          onClick={() =>
                            updatePostStatus(
                              post,
                              "approved"
                            )
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() =>
                            updatePostStatus(
                              post,
                              "rejected"
                            )
                          }
                        >
                          Reject
                        </button>

                        <button
                          className="delete-post-btn"
                          onClick={() =>
                            deletePost(
                              post._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </div>

      </div>

      <style>{`

        * {
          box-sizing: border-box;
        }

        .admin-page {
          min-height: 100vh;
          background: #f5f7f4;
          padding: 50px 20px;
          color: #18231d;
          font-family: Arial, Helvetica, sans-serif;
        }

        .admin-container {
          max-width: 1250px;
          margin: auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 35px;
        }

        .admin-header span {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #8b6b3f;
        }

        .admin-header h1 {
          margin: 8px 0;
          font-size: 42px;
        }

        .admin-header p {
          margin: 0;
          color: #68716b;
        }

        .refresh-btn,
        .refresh-community-btn {
          border: 0;
          background: #18231d;
          color: white;
          padding: 13px 20px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
        }

        .section-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #8b6b3f;
          margin-bottom: 10px;
        }

        .admin-card {
          background: white;
          border: 1px solid #e1e6e1;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 45px;
          box-shadow: 0 10px 30px rgba(24,35,29,.06);
        }

        .admin-card h2 {
          margin-top: 0;
          margin-bottom: 25px;
        }

        .form-grid,
        .community-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 13px;
          font-weight: 800;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          border: 1px solid #d8ded8;
          border-radius: 9px;
          padding: 13px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          background: white;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #8b6b3f;
        }

        .field small {
          color: #777;
          line-height: 1.5;
        }

        /* ================= SEO ================= */

        .seo-heading {
          margin-top: 5px;
          padding: 15px 18px;
          background: #f7f9f7;
          border: 1px solid #e1e6e1;
          border-radius: 10px;
        }

        .seo-heading strong {
          font-size: 13px;
          letter-spacing: 1.5px;
          color: #8b6b3f;
        }

        .seo-heading small {
          margin-top: 2px;
        }

        .seo-url-display {
          color: #8b6b3f !important;
          font-size: 12px !important;
          font-weight: 700;
          word-break: break-all;
        }

        .available-field,
        .featured-field {
          grid-column: 1 / -1;
        }

        .available-field label,
        .featured-field label {
          display: flex;
          gap: 10px;
          align-items: center;
          font-weight: 700;
        }

        .form-buttons {
          display: flex;
          gap: 10px;
          margin-top: 25px;
        }

        .save-btn,
        .cancel-btn {
          padding: 13px 24px;
          border-radius: 9px;
          border: 0;
          cursor: pointer;
          font-weight: 800;
        }

        .save-btn {
          background: #18231d;
          color: white;
        }

        .save-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: #e8ece8;
          color: #18231d;
        }

        /* ================= IMAGE UPLOAD ================= */

        .image-management {
          padding: 20px;
          background: #fafcfa;
          border: 1px solid #e1e6e1;
          border-radius: 14px;
        }

        .upload-box {
          border: 2px dashed #cdd6cd;
          border-radius: 12px;
          padding: 25px;
          background: white;
        }

        .upload-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .upload-help {
          color: #68716b;
          font-size: 13px;
          margin-bottom: 15px;
        }

        .upload-box input[type="file"] {
          padding: 10px;
          background: #f7f9f7;
          cursor: pointer;
        }

        .upload-status {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .upload-status.uploading {
          background: #f5eee0;
          color: #8b6b3f;
        }

        .upload-status.success {
          background: #e5f1e7;
          color: #347044;
        }

        .legacy-image-box {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #e1e6e1;
        }

        .legacy-image-box > label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 800;
        }

        .url-add-row {
          display: flex;
          gap: 10px;
        }

        .url-add-row input {
          flex: 1;
        }

        .add-image-btn {
          border: 0;
          border-radius: 9px;
          background: #18231d;
          color: white;
          padding: 0 18px;
          font-weight: 800;
          cursor: pointer;
        }

        .image-preview-section {
          margin-top: 20px;
        }

        .image-preview-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .image-preview-heading strong {
          font-size: 14px;
        }

        .image-preview-heading span {
          color: #68716b;
          font-size: 13px;
        }

        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .image-preview-card {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          border: 1px solid #dce3dc;
          background: white;
        }

        .image-preview-card img {
          width: 100%;
          height: 145px;
          display: block;
          object-fit: cover;
        }

        .main-image-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #18231d;
          color: white;
          padding: 5px 7px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 800;
        }

        .remove-image-btn {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 50%;
          background: rgba(163,61,50,.95);
          color: white;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
        }

        .remove-image-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .image-number {
          padding: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #68716b;
        }

        /* ================= EXISTING ROOMS ================= */

        .rooms-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .rooms-title h2 {
          margin: 0;
          font-size: 28px;
        }

        .rooms-title span {
          color: #68716b;
          font-size: 14px;
        }

        .admin-rooms-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .admin-room-card {
          overflow: hidden;
          background: white;
          border: 1px solid #e1e6e1;
          border-radius: 18px;
        }

        .admin-room-card img {
          width: 100%;
          height: 210px;
          object-fit: cover;
          display: block;
        }

        .admin-room-content {
          padding: 20px;
        }

        .admin-room-content h3 {
          margin: 0 0 7px;
          font-size: 20px;
        }

        .admin-room-content p {
          color: #68716b;
          font-size: 13px;
          line-height: 1.5;
        }

        .admin-room-content .destination {
          color: #8b6b3f;
          font-weight: 700;
        }

        .room-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-top: 1px solid #edf0ed;
          border-bottom: 1px solid #edf0ed;
        }

        .room-meta strong {
          color: #8b6b3f;
        }

        .room-meta span {
          font-size: 13px;
          color: #68716b;
        }

        .admin-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .admin-actions button {
          flex: 1;
          padding: 11px;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 800;
        }

        .edit-btn {
          background: #eef1ed;
          color: #18231d;
        }

        .delete-btn {
          background: #f5e7e5;
          color: #a33d32;
        }

        .loading,
        .empty {
          background: white;
          padding: 60px;
          text-align: center;
          border-radius: 18px;
          color: #68716b;
          border: 1px solid #e1e6e1;
        }

        /* ================= COMMUNITY ================= */

        .community-section {
          margin-top: 70px;
          padding-top: 45px;
          border-top: 1px solid #dfe5df;
        }

        .community-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 25px;
        }

        .community-header h2 {
          margin: 0 0 7px;
          font-size: 30px;
        }

        .community-header p {
          margin: 0;
          color: #68716b;
        }

        .community-create-card {
          background: white;
          border: 1px solid #e1e6e1;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 35px;
          box-shadow: 0 10px 30px rgba(24,35,29,.06);
        }

        .create-post-heading {
          margin-bottom: 25px;
        }

        .create-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #8b6b3f;
        }

        .create-post-heading h3 {
          margin: 8px 0;
          font-size: 24px;
        }

        .create-post-heading p {
          margin: 0;
          color: #68716b;
          font-size: 14px;
        }

        /* ================= RICH EDITOR ================= */

        .rich-editor {
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
        }

        .rich-editor .ql-toolbar {
          border: 1px solid #d8ded8;
          border-radius: 10px 10px 0 0;
          background: #f7f9f7;
          padding: 12px;
        }

        .rich-editor .ql-container {
          border: 1px solid #d8ded8;
          border-top: 0;
          border-radius: 0 0 10px 10px;
          min-height: 320px;
          font-size: 16px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .rich-editor .ql-editor {
          min-height: 320px;
          line-height: 1.8;
          padding: 20px;
          text-align: left;
        }

        .rich-editor .ql-editor p {
          margin-bottom: 15px;
        }

        .rich-editor .ql-editor h1,
        .rich-editor .ql-editor h2,
        .rich-editor .ql-editor h3 {
          margin-top: 20px;
          margin-bottom: 12px;
        }

        .rich-editor .ql-editor.ql-blank::before {
          color: #999;
          font-style: normal;
          left: 20px;
        }

        .rich-editor:focus-within .ql-toolbar {
          border-color: #8b6b3f;
        }

        .rich-editor:focus-within .ql-container {
          border-color: #8b6b3f;
        }

        .editor-help {
          display: block;
          margin-top: 5px;
          color: #777;
          font-size: 12px;
        }

        /* ================= BUTTONS ================= */

        .community-form-buttons {
          display: flex;
          gap: 10px;
          margin-top: 25px;
        }

        .create-post-btn,
        .clear-post-btn {
          border: 0;
          border-radius: 9px;
          padding: 13px 22px;
          font-weight: 800;
          cursor: pointer;
        }

        .create-post-btn {
          background: #18231d;
          color: white;
        }

        .create-post-btn:disabled,
        .clear-post-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .clear-post-btn {
          background: #e8ece8;
          color: #18231d;
        }

        /* ================= POST GRID ================= */

        .community-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .community-card {
          overflow: hidden;
          background: white;
          border: 1px solid #e1e6e1;
          border-radius: 18px;
        }

        .community-card > img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }

        .community-content {
          padding: 20px;
        }

        .post-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .post-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #8b6b3f;
        }

        .status {
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .status.pending {
          background: #f5eee0;
          color: #8b6b3f;
        }

        .status.approved {
          background: #e5f1e7;
          color: #347044;
        }

        .status.rejected {
          background: #f5e7e5;
          color: #a33d32;
        }

        .community-content h3 {
          margin: 0 0 7px;
          font-size: 20px;
        }

        .post-author {
          font-size: 12px;
          color: #8b6b3f !important;
          font-weight: 700;
        }

        .post-category {
          font-size: 12px !important;
          color: #8b6b3f !important;
          font-weight: 700;
        }

        .post-text {
          color: #68716b;
          font-size: 13px;
          line-height: 1.6;
          min-height: 60px;
          overflow: hidden;
        }

        .post-text p {
          margin: 0 0 10px;
        }

        .post-text h1,
        .post-text h2,
        .post-text h3 {
          color: #18231d;
        }

        .post-actions {
          display: flex;
          gap: 7px;
          margin-top: 18px;
        }

        .post-actions button {
          flex: 1;
          border: 0;
          padding: 10px 6px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 800;
          font-size: 12px;
        }

        .approve-btn {
          background: #e5f1e7;
          color: #347044;
        }

        .reject-btn {
          background: #f5eee0;
          color: #8b6b3f;
        }

        .delete-post-btn {
          background: #f5e7e5;
          color: #a33d32;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 900px) {

          .admin-rooms-grid,
          .community-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .image-preview-grid {
            grid-template-columns: repeat(3, 1fr);
          }

        }

        @media (max-width: 650px) {

          .admin-page {
            padding: 30px 15px;
          }

          .admin-header,
          .community-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .form-grid,
          .community-form-grid {
            grid-template-columns: 1fr;
          }

          .field.full,
          .available-field,
          .featured-field {
            grid-column: auto;
          }

          .admin-rooms-grid,
          .community-grid {
            grid-template-columns: 1fr;
          }

          .image-preview-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .url-add-row {
            flex-direction: column;
          }

          .add-image-btn {
            min-height: 45px;
          }

          .rich-editor .ql-toolbar {
            padding: 8px;
          }

          .rich-editor .ql-container,
          .rich-editor .ql-editor {
            min-height: 250px;
          }

        }

      `}</style>

    </div>
  );
}