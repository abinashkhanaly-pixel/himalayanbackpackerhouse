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

const API_URL = "https://backpacker-gateways-2.onrender.com";

const DEFAULT_FORM = {
  name: "",
  destination: "",

  // SEO
  seoSlug: "",
  seoTitle: "",
  seoDescription: "",

  // Room
  description: "",
  price: "",
  capacity: "",
  beds: "",
  amenities: "",
  images: [],
  available: true,

  // Property
  propertyType: "Hotel",
  starCategory: "",
  checkIn: "14:00",
  checkOut: "12:00",
  languages: "",

  // Booking
  bookingType: "Request to Book",
  minimumStay: "1",
  maximumStay: "",

  // House Rules
  smoking: "Not allowed",
  pets: "Not allowed",
  parties: "Not allowed",
  children: "Children are welcome",
  extraBed: "",
  idRequirement: "A valid government-issued ID is required",

  // Cancellation
  cancellationType: "Free cancellation",
  cancellationDeadline: "",
  cancellationAfterDeadline: "",
  noShowPolicy: "",
  nonRefundable: false,
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [creatingPost, setCreatingPost] = useState(false);

  const [form, setForm] = useState(DEFAULT_FORM);

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [savingRoom, setSavingRoom] = useState(false);

  const [activeRoomTab, setActiveRoomTab] = useState("basic");

  const [communityForm, setCommunityForm] = useState({
    title: "",
    category: "Travel",
    author: "Backpacker Gateways",
    location: "Nepal",
    image: "",
    content: "",
    featured: false,
  });

  // =========================================================
  // ROOMS
  // =========================================================

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

      alert(error.message || "Unable to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // COMMUNITY
  // =========================================================

  const loadPosts = async () => {
    try {
      setPostsLoading(true);

      const response = await fetch(`${API_URL}/api/community`);

      if (!response.ok) {
        throw new Error("Unable to load community posts");
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
      console.error("COMMUNITY ADMIN ERROR:", error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    loadPosts();
  }, []);

  // =========================================================
  // FORM HELPERS
  // =========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const slugify = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleNameChange = (value) => {
    setForm((previous) => ({
      ...previous,
      name: value,
      seoSlug: previous.seoSlug
        ? previous.seoSlug
        : slugify(value),
    }));
  };

  const resetForm = () => {
    setForm({
      ...DEFAULT_FORM,
      images: [],
    });

    setImageUrlInput("");
    setUploadStatus("");
    setEditingId(null);
    setActiveRoomTab("basic");
  };

  // =========================================================
  // IMAGE URL
  // =========================================================

  const addImageUrl = () => {
    const urls = imageUrlInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!urls.length) return;

    setForm((previous) => {
      const newImages = [...previous.images];

      urls.forEach((url) => {
        if (!newImages.includes(url)) {
          newImages.push(url);
        }
      });

      return {
        ...previous,
        images: newImages,
      };
    });

    setImageUrlInput("");
  };

  const removeImage = (index) => {
    setForm((previous) => ({
      ...previous,
      images: previous.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  };

  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    try {
      setUploadingImages(true);

      setUploadStatus(
        `Uploading ${files.length} image${
          files.length > 1 ? "s" : ""
        }...`
      );

      const uploadedUrls = [];

      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        setUploadStatus(
          `Uploading image ${index + 1} of ${files.length}...`
        );

        const result = await uploadRoomImage(file);

        const uploadedUrl =
          result?.data?.url || result?.url;

        if (!uploadedUrl) {
          throw new Error(
            "Image uploaded but no image URL was returned."
          );
        }

        uploadedUrls.push(uploadedUrl);
      }

      setForm((previous) => ({
        ...previous,
        images: [...previous.images, ...uploadedUrls],
      }));

      setUploadStatus(
        `${uploadedUrls.length} image${
          uploadedUrls.length > 1 ? "s" : ""
        } uploaded successfully.`
      );
    } catch (error) {
      console.error("IMAGE UPLOAD ERROR:", error);

      setUploadStatus("");

      alert(error.message || "Image upload failed.");
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  };

  // =========================================================
  // ROOM SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadingImages) {
      alert("Please wait until image uploads are finished.");
      return;
    }

    if (!form.name.trim()) {
      alert("Room / Hotel Name is required.");
      setActiveRoomTab("basic");
      return;
    }

    if (!form.destination.trim()) {
      alert("Destination is required.");
      setActiveRoomTab("basic");
      return;
    }

    if (!form.images.length) {
      alert("Please add at least one room image.");
      setActiveRoomTab("basic");
      return;
    }

    try {
      setSavingRoom(true);

      const cleanSlug = slugify(
        form.seoSlug || form.name
      );

      const roomData = {
        name: form.name.trim(),

        destination: form.destination.trim(),

        // SEO
        seoSlug: cleanSlug,
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),

        // ROOM
        description: form.description,

        price: Number(form.price) || 0,

        capacity: Number(form.capacity) || 1,

        beds: form.beds.trim(),

        amenities: form.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        images: form.images
          .map((image) => image.trim())
          .filter(Boolean),

        available: form.available,

        // PROPERTY
        propertyType: form.propertyType,
        starCategory: form.starCategory,
        checkIn: form.checkIn,
        checkOut: form.checkOut,

        languages: form.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        // BOOKING
        bookingType: form.bookingType,

        minimumStay:
          Number(form.minimumStay) || 1,

        maximumStay: form.maximumStay
          ? Number(form.maximumStay)
          : null,

        // HOUSE RULES
        houseRules: {
          smoking: form.smoking,
          pets: form.pets,
          parties: form.parties,
          children: form.children,
          extraBed: form.extraBed,
          idRequirement: form.idRequirement,
        },

        // CANCELLATION
        cancellationPolicy: {
          type: form.cancellationType,
          deadline: form.cancellationDeadline,
          afterDeadline: form.cancellationAfterDeadline,
          noShow: form.noShowPolicy,
          nonRefundable: form.nonRefundable,
        },
      };

      if (editingId) {
        await updateRoom(editingId, roomData);

        alert("Room updated successfully.");
      } else {
        await createRoom(roomData);

        alert("Room added successfully.");
      }

      resetForm();

      await loadRooms();
    } catch (error) {
      console.error("ROOM SAVE ERROR:", error);

      alert(error.message || "Unable to save room.");
    } finally {
      setSavingRoom(false);
    }
  };

  // =========================================================
  // EDIT ROOM
  // =========================================================

  const handleEdit = (room) => {
    setEditingId(room._id);

    setForm({
      ...DEFAULT_FORM,

      name: room.name || "",

      destination: room.destination || "",

      seoSlug: room.seoSlug || "",

      seoTitle: room.seoTitle || "",

      seoDescription: room.seoDescription || "",

      description: room.description || "",

      price: room.price ?? "",

      capacity: room.capacity ?? "",

      beds: room.beds || "",

      amenities: Array.isArray(room.amenities)
        ? room.amenities.join(", ")
        : room.amenities || "",

      images: Array.isArray(room.images)
        ? room.images
        : [],

      available: room.available ?? true,

      propertyType: room.propertyType || "Hotel",

      starCategory: room.starCategory || "",

      checkIn: room.checkIn || "14:00",

      checkOut: room.checkOut || "12:00",

      languages: Array.isArray(room.languages)
        ? room.languages.join(", ")
        : room.languages || "",

      bookingType:
        room.bookingType || "Request to Book",

      minimumStay: room.minimumStay ?? "1",

      maximumStay: room.maximumStay ?? "",

      smoking:
        room.houseRules?.smoking ||
        room.smoking ||
        "Not allowed",

      pets:
        room.houseRules?.pets ||
        room.pets ||
        "Not allowed",

      parties:
        room.houseRules?.parties ||
        room.parties ||
        "Not allowed",

      children:
        room.houseRules?.children ||
        room.children ||
        "Children are welcome",

      extraBed:
        room.houseRules?.extraBed ||
        room.extraBed ||
        "",

      idRequirement:
        room.houseRules?.idRequirement ||
        room.idRequirement ||
        "A valid government-issued ID is required",

      cancellationType:
        room.cancellationPolicy?.type ||
        room.cancellationType ||
        "Free cancellation",

      cancellationDeadline:
        room.cancellationPolicy?.deadline ||
        room.cancellationDeadline ||
        "",

      cancellationAfterDeadline:
        room.cancellationPolicy?.afterDeadline ||
        room.cancellationAfterDeadline ||
        "",

      noShowPolicy:
        room.cancellationPolicy?.noShow ||
        room.noShowPolicy ||
        "",

      nonRefundable:
        room.cancellationPolicy?.nonRefundable ??
        room.nonRefundable ??
        false,
    });

    setImageUrlInput("");
    setUploadStatus("");
    setActiveRoomTab("basic");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE ROOM
  // =========================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmDelete) return;

    try {
      await deleteRoom(id);

      alert("Room deleted successfully.");

      await loadRooms();
    } catch (error) {
      console.error(error);

      alert(error.message || "Unable to delete room.");
    }
  };

  // =========================================================
  // COMMUNITY
  // =========================================================

  const handleCommunityChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCommunityForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContentChange = (value) => {
    setCommunityForm((previous) => ({
      ...previous,
      content: value,
    }));
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

  const handleCreatePost = async (e) => {
    e.preventDefault();

    try {
      setCreatingPost(true);

      const response = await fetch(
        `${API_URL}/api/community`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(communityForm),
        }
      );

      const data = await response.json();

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
      console.error("CREATE POST ERROR:", error);

      alert(error.message);
    } finally {
      setCreatingPost(false);
    }
  };

  const updatePostStatus = async (post, status) => {
    try {
      const response = await fetch(
        `${API_URL}/api/community/${post._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update post"
        );
      }

      alert(`Post ${status} successfully`);

      await loadPosts();
    } catch (error) {
      console.error("POST STATUS ERROR:", error);

      alert(error.message);
    }
  };

  const deletePost = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this community post?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/community/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete community post"
        );
      }

      alert("Community post deleted successfully");

      await loadPosts();
    } catch (error) {
      console.error("DELETE POST ERROR:", error);

      alert(error.message);
    }
  };

  const getPostTitle = (post) =>
    post.title ||
    post.name ||
    post.heading ||
    "Community Post";

  const getPostText = (post) =>
    post.content ||
    post.description ||
    post.text ||
    post.body ||
    "";

  const getPostImage = (post) =>
    post.image ||
    post.imageUrl ||
    post.images?.[0] ||
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80";

  const getPostStatus = (post) =>
    post.status || "pending";

  // =========================================================
  // QUILL
  // =========================================================

  const quillModules = {
    toolbar: [
      [
        {
          header: [1, 2, 3, 4, false],
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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* ===================================================
            DASHBOARD HEADER
        =================================================== */}

        <header className="dashboard-header">
          <div>
            <div className="brand-kicker">
              BACKPACKER GATEWAYS
            </div>

            <h1>Admin Dashboard</h1>

            <p>
              Manage rooms, hotels and
              community content from one place.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-refresh"
            onClick={() => {
              loadRooms();
              loadPosts();
            }}
          >
            ↻ Refresh Dashboard
          </button>
        </header>

        {/* ===================================================
            ROOM MANAGEMENT
        =================================================== */}

        <section className="management-section">
          <div className="section-heading-row">
            <div>
              <div className="section-kicker">
                ROOM MANAGEMENT
              </div>

              <h2>
                {editingId
                  ? "Edit Room / Hotel"
                  : "Add New Room"}
              </h2>

              <p>
                Create complete property
                listings with SEO, images,
                policies and booking details.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="outline-btn"
                onClick={resetForm}
              >
                Cancel Editing
              </button>
            )}
          </div>

          <div className="admin-card room-form-card">

            {/* FORM TABS */}

            <div className="form-tabs">
              <button
                type="button"
                className={
                  activeRoomTab === "basic"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveRoomTab("basic")
                }
              >
                1. Basic Details
              </button>

              <button
                type="button"
                className={
                  activeRoomTab === "property"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveRoomTab("property")
                }
              >
                2. Property
              </button>

              <button
                type="button"
                className={
                  activeRoomTab === "rules"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveRoomTab("rules")
                }
              >
                3. House Rules
              </button>

              <button
                type="button"
                className={
                  activeRoomTab === "cancellation"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveRoomTab("cancellation")
                }
              >
                4. Cancellation
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* =================================================
                  BASIC DETAILS
              ================================================= */}

              {activeRoomTab === "basic" && (
                <div className="tab-content">

                  <div className="form-section-intro">
                    <span>PROPERTY BASICS</span>

                    <h3>
                      Room & SEO Information
                    </h3>

                    <p>
                      Add the information guests
                      and Google need to understand
                      this property.
                    </p>
                  </div>

                  <div className="modern-form-grid">

                    <div className="field">
                      <label>
                        Room / Hotel Name
                      </label>

                      <input
                        value={form.name}
                        onChange={(e) =>
                          handleNameChange(
                            e.target.value
                          )
                        }
                        placeholder="Deluxe Mountain View Room"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>
                        Destination
                      </label>

                      <input
                        name="destination"
                        value={form.destination}
                        onChange={handleChange}
                        placeholder="Kathmandu, Nepal"
                        required
                      />
                    </div>

                    {/* SEO */}

                    <div className="seo-panel">
                      <div className="seo-panel-title">
                        <span>
                          SEO SETTINGS
                        </span>

                        <small>
                          Help Google understand
                          and display this room page.
                        </small>
                      </div>

                      <div className="modern-form-grid">

                        <div className="field">
                          <label>
                            SEO URL / Slug
                          </label>

                          <input
                            name="seoSlug"
                            value={form.seoSlug}
                            onChange={(e) =>
                              setForm(
                                (previous) => ({
                                  ...previous,
                                  seoSlug:
                                    slugify(
                                      e.target.value
                                    ),
                                })
                              )
                            }
                            placeholder="deluxe-mountain-view-room-kathmandu"
                          />

                          <small>
                            Lowercase words
                            separated by hyphens.
                          </small>
                        </div>

                        <div className="field">
                          <label>
                            SEO Title
                          </label>

                          <input
                            name="seoTitle"
                            value={form.seoTitle}
                            onChange={handleChange}
                            maxLength={65}
                            placeholder="Deluxe Mountain View Room Kathmandu"
                          />

                          <small>
                            Preferably around
                            50–60 characters.
                          </small>
                        </div>

                        <div className="field full">
                          <label>
                            SEO Description
                          </label>

                          <textarea
                            name="seoDescription"
                            value={form.seoDescription}
                            onChange={handleChange}
                            maxLength={170}
                            rows="4"
                            placeholder="Stay in a comfortable mountain view room in Kathmandu with modern facilities and easy access to Thamel."
                          />

                          <small>
                            Around 150–160
                            characters is a good target.
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* ROOM INFO */}

                    <div className="field">
                      <label>
                        Price Per Night
                        <span>NPR</span>
                      </label>

                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        min="0"
                        placeholder="4000"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>
                        Guest Capacity
                      </label>

                      <input
                        type="number"
                        name="capacity"
                        value={form.capacity}
                        onChange={handleChange}
                        min="1"
                        placeholder="2"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Beds</label>

                      <input
                        name="beds"
                        value={form.beds}
                        onChange={handleChange}
                        placeholder="1 King Bed"
                      />
                    </div>

                    <div className="field">
                      <label>
                        Room Availability
                      </label>

                      <select
                        name="available"
                        value={
                          form.available
                            ? "yes"
                            : "no"
                        }
                        onChange={(e) =>
                          setForm(
                            (previous) => ({
                              ...previous,
                              available:
                                e.target.value ===
                                "yes",
                            })
                          )
                        }
                      >
                        <option value="yes">
                          Available
                        </option>

                        <option value="no">
                          Currently Unavailable
                        </option>
                      </select>
                    </div>

                    {/* IMAGES */}

                    <div className="field full">
                      <label>
                        Room Images
                      </label>

                      <div className="image-upload-modern">
                        <div className="upload-icon">
                          ↑
                        </div>

                        <h4>
                          Upload room images
                        </h4>

                        <p>
                          JPG, JPEG, PNG or WebP
                        </p>

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

                        {uploadStatus && (
                          <div
                            className={
                              uploadingImages
                                ? "upload-message uploading"
                                : "upload-message"
                            }
                          >
                            {uploadStatus}
                          </div>
                        )}
                      </div>

                      <div className="url-image-row">
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) =>
                            setImageUrlInput(
                              e.target.value
                            )
                          }
                          placeholder="Add Existing Image URL"
                        />

                        <button
                          type="button"
                          onClick={addImageUrl}
                        >
                          + Add URL
                        </button>
                      </div>

                      <small>
                        Existing external image
                        URLs can still be used.
                      </small>

                      {form.images.length > 0 && (
                        <div className="image-preview-grid-modern">
                          {form.images.map(
                            (image, index) => (
                              <div
                                className="modern-image-card"
                                key={`${image}-${index}`}
                              >
                                <img
                                  src={image}
                                  alt={`Room ${
                                    index + 1
                                  }`}
                                  onError={(e) => {
                                    e.currentTarget.style.opacity =
                                      "0.35";
                                  }}
                                />

                                {index === 0 && (
                                  <span className="main-badge">
                                    MAIN
                                  </span>
                                )}

                                <button
                                  type="button"
                                  className="image-delete"
                                  onClick={() =>
                                    removeImage(
                                      index
                                    )
                                  }
                                >
                                  ×
                                </button>

                                <div className="image-index">
                                  Image{" "}
                                  {index + 1}
                                </div>
                              </div>
                            )
                          )}
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
                        value={form.description}
                        onChange={handleChange}
                        rows="7"
                        placeholder="Describe the property, room, location, comfort and guest experience..."
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
                        value={form.amenities}
                        onChange={handleChange}
                        placeholder="Free WiFi, Air Conditioning, Mountain View, Restaurant, Hot Shower"
                      />

                      <small>
                        Separate amenities
                        using commas.
                      </small>
                    </div>
                  </div>

                  {/* FIXED BUTTON */}

                  <div className="tab-next">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRoomTab("property")
                      }
                    >
                      Continue to Property Details →
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  PROPERTY
              ================================================= */}

              {activeRoomTab === "property" && (
                <div className="tab-content">

                  <div className="form-section-intro">
                    <span>
                      PROPERTY INFORMATION
                    </span>

                    <h3>
                      Hotel & Booking Details
                    </h3>

                    <p>
                      Add practical information
                      guests need before booking.
                    </p>
                  </div>

                  <div className="modern-form-grid">

                    <div className="field">
                      <label>
                        Property Type
                      </label>

                      <select
                        name="propertyType"
                        value={form.propertyType}
                        onChange={handleChange}
                      >
                        <option>Hotel</option>
                        <option>Hostel</option>
                        <option>Guesthouse</option>
                        <option>Resort</option>
                        <option>Homestay</option>
                        <option>Apartment</option>
                        <option>Lodge</option>
                        <option>Villa</option>
                        <option>Boutique Hotel</option>
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Star / Category
                      </label>

                      <select
                        name="starCategory"
                        value={form.starCategory}
                        onChange={handleChange}
                      >
                        <option value="">
                          Select category
                        </option>
                        <option>1 Star</option>
                        <option>2 Star</option>
                        <option>3 Star</option>
                        <option>4 Star</option>
                        <option>5 Star</option>
                        <option>Budget</option>
                        <option>Premium</option>
                        <option>Luxury</option>
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Check-in Time
                      </label>

                      <input
                        type="time"
                        name="checkIn"
                        value={form.checkIn}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="field">
                      <label>
                        Check-out Time
                      </label>

                      <input
                        type="time"
                        name="checkOut"
                        value={form.checkOut}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="field full">
                      <label>
                        Languages Spoken
                      </label>

                      <input
                        name="languages"
                        value={form.languages}
                        onChange={handleChange}
                        placeholder="English, Nepali, Hindi"
                      />

                      <small>
                        Separate languages
                        using commas.
                      </small>
                    </div>

                    <div className="subsection-card">
                      <div>
                        <span>BOOKING</span>

                        <h4>
                          Booking Preferences
                        </h4>
                      </div>

                      <div className="modern-form-grid">

                        <div className="field">
                          <label>
                            Booking Type
                          </label>

                          <select
                            name="bookingType"
                            value={form.bookingType}
                            onChange={handleChange}
                          >
                            <option>
                              Request to Book
                            </option>

                            <option>
                              Instant Booking
                            </option>
                          </select>
                        </div>

                        <div className="field">
                          <label>
                            Minimum Stay (Nights)
                          </label>

                          <input
                            type="number"
                            name="minimumStay"
                            min="1"
                            value={
                              form.minimumStay
                            }
                            onChange={handleChange}
                          />
                        </div>

                        <div className="field">
                          <label>
                            Maximum Stay (Nights)
                          </label>

                          <input
                            type="number"
                            name="maximumStay"
                            min="1"
                            value={
                              form.maximumStay
                            }
                            onChange={handleChange}
                            placeholder="No limit"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tab-navigation">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRoomTab("basic")
                      }
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveRoomTab("rules")
                      }
                    >
                      House Rules →
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  HOUSE RULES
              ================================================= */}

              {activeRoomTab === "rules" && (
                <div className="tab-content">

                  <div className="form-section-intro">
                    <span>
                      GUEST INFORMATION
                    </span>

                    <h3>House Rules</h3>

                    <p>
                      Tell guests clearly what
                      is allowed and what they
                      should know before arrival.
                    </p>
                  </div>

                  <div className="modern-form-grid">

                    <div className="field">
                      <label>Smoking</label>

                      <select
                        name="smoking"
                        value={form.smoking}
                        onChange={handleChange}
                      >
                        <option>
                          Not allowed
                        </option>

                        <option>
                          Allowed
                        </option>

                        <option>
                          Allowed in designated areas
                        </option>
                      </select>
                    </div>

                    <div className="field">
                      <label>Pets</label>

                      <select
                        name="pets"
                        value={form.pets}
                        onChange={handleChange}
                      >
                        <option>
                          Not allowed
                        </option>

                        <option>
                          Allowed
                        </option>

                        <option>
                          Allowed on request
                        </option>
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Parties / Events
                      </label>

                      <select
                        name="parties"
                        value={form.parties}
                        onChange={handleChange}
                      >
                        <option>
                          Not allowed
                        </option>

                        <option>
                          Allowed
                        </option>

                        <option>
                          Allowed on request
                        </option>
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Children Policy
                      </label>

                      <input
                        name="children"
                        value={form.children}
                        onChange={handleChange}
                        placeholder="Children are welcome"
                      />
                    </div>

                    <div className="field full">
                      <label>
                        Extra Bed Policy
                      </label>

                      <input
                        name="extraBed"
                        value={form.extraBed}
                        onChange={handleChange}
                        placeholder="Extra beds are available on request and may incur an additional charge."
                      />
                    </div>

                    <div className="field full">
                      <label>
                        ID Requirement
                      </label>

                      <input
                        name="idRequirement"
                        value={form.idRequirement}
                        onChange={handleChange}
                        placeholder="A valid government-issued ID is required"
                      />
                    </div>
                  </div>

                  <div className="tab-navigation">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRoomTab("property")
                      }
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveRoomTab(
                          "cancellation"
                        )
                      }
                    >
                      Cancellation Policy →
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  CANCELLATION
              ================================================= */}

              {activeRoomTab === "cancellation" && (
                <div className="tab-content">

                  <div className="form-section-intro">
                    <span>
                      BOOKING POLICY
                    </span>

                    <h3>
                      Cancellation & Prepayment
                    </h3>

                    <p>
                      Make cancellation and
                      refund conditions clear
                      before guests book.
                    </p>
                  </div>

                  <div className="modern-form-grid">

                    <div className="field">
                      <label>
                        Cancellation Type
                      </label>

                      <select
                        name="cancellationType"
                        value={
                          form.cancellationType
                        }
                        onChange={handleChange}
                      >
                        <option>
                          Free cancellation
                        </option>

                        <option>
                          Partial refund
                        </option>

                        <option>
                          Non-refundable
                        </option>

                        <option>
                          Cancellation not available
                        </option>
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Cancellation Deadline
                      </label>

                      <input
                        name="cancellationDeadline"
                        value={
                          form.cancellationDeadline
                        }
                        onChange={handleChange}
                        placeholder="48 hours before check-in"
                      />
                    </div>

                    <div className="field full">
                      <label>
                        Cancellation After Deadline
                      </label>

                      <textarea
                        name="cancellationAfterDeadline"
                        value={
                          form.cancellationAfterDeadline
                        }
                        onChange={handleChange}
                        rows="4"
                        placeholder="Cancellation after this deadline may result in a one-night charge."
                      />
                    </div>

                    <div className="field full">
                      <label>
                        No-show Policy
                      </label>

                      <textarea
                        name="noShowPolicy"
                        value={form.noShowPolicy}
                        onChange={handleChange}
                        rows="4"
                        placeholder="In case of no-show, the first night may be charged."
                      />
                    </div>

                    <label className="policy-checkbox">
                      <input
                        type="checkbox"
                        name="nonRefundable"
                        checked={
                          form.nonRefundable
                        }
                        onChange={handleChange}
                      />

                      <span>
                        This room/rate is
                        non-refundable
                      </span>
                    </label>
                  </div>

                  {/* FINAL SAVE */}

                  <div className="final-save-box">
                    <div>
                      <span>
                        READY TO PUBLISH
                      </span>

                      <h3>
                        Save this property
                      </h3>

                      <p>
                        Check the details above
                        before saving. You can edit
                        this property later.
                      </p>
                    </div>

                    <div className="final-actions">
                      <button
                        type="button"
                        className="secondary-action"
                        onClick={() =>
                          setActiveRoomTab("rules")
                        }
                      >
                        ← Back
                      </button>

                      <button
                        type="submit"
                        className="primary-save"
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
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* ===================================================
            EXISTING ROOMS
        =================================================== */}

        <section className="existing-section">
          <div className="section-heading-row">
            <div>
              <div className="section-kicker">
                INVENTORY
              </div>

              <h2>Existing Rooms</h2>

              <p>
                Manage your published room
                and hotel listings.
              </p>
            </div>

            <div className="inventory-count">
              {rooms.length}{" "}
              {rooms.length === 1
                ? "room"
                : "rooms"}
            </div>
          </div>

          {loading ? (
            <div className="state-card">
              Loading rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div className="state-card">
              No rooms found.
            </div>
          ) : (
            <div className="modern-room-grid">
              {rooms.map((room) => {
                const roomImage =
                  room.images?.[0] ||
                  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80";

                const slug =
                  room.seoSlug || room._id;

                return (
                  <article
                    className="modern-room-card"
                    key={room._id}
                  >
                    <div className="room-card-image">
                      <img
                        src={roomImage}
                        alt={
                          room.name || "Room"
                        }
                      />

                      <span
                        className={
                          room.available === false
                            ? "availability unavailable"
                            : "availability"
                        }
                      >
                        {room.available === false
                          ? "Unavailable"
                          : "Available"}
                      </span>
                    </div>

                    <div className="room-card-body">
                      <div className="room-card-top">
                        <div>
                          <h3>
                            {room.name}
                          </h3>

                          <p>
                            {room.destination}
                          </p>
                        </div>

                        <strong>
                          NPR{" "}
                          {Number(
                            room.price || 0
                          ).toLocaleString(
                            "en-NP"
                          )}
                        </strong>
                      </div>

                      {room.seoSlug && (
                        <div className="room-slug">
                          /rooms/
                          {room.seoSlug}
                        </div>
                      )}

                      <div className="room-card-meta">
                        <span>
                          👤{" "}
                          {room.capacity || 1}{" "}
                          Guests
                        </span>

                        <span>
                          🛏️{" "}
                          {room.beds || "Bed"}
                        </span>
                      </div>

                      <div className="room-card-actions">
                        <a
                          href={`/rooms/${slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="view-room"
                        >
                          View
                        </a>

                        <button
                          type="button"
                          className="edit-room"
                          onClick={() =>
                            handleEdit(room)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-room"
                          onClick={() =>
                            handleDelete(
                              room._id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================================================
            COMMUNITY MANAGEMENT
        =================================================== */}

        <section className="community-section">
          <div className="section-heading-row">
            <div>
              <div className="section-kicker">
                COMMUNITY MANAGEMENT
              </div>

              <h2>Community Posts</h2>

              <p>
                Create, review and manage
                community content.
              </p>
            </div>

            <button
              type="button"
              className="outline-btn"
              onClick={loadPosts}
            >
              ↻ Refresh Posts
            </button>
          </div>

          <div className="admin-card community-create-card">
            <div className="form-section-intro">
              <span>ADMIN POST</span>

              <h3>
                Create New Community Post
              </h3>

              <p>
                Publish a travel story,
                guide, update or community
                announcement.
              </p>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="modern-form-grid">

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
                    <option>Travel</option>
                    <option>Trekking</option>
                    <option>Adventure</option>
                    <option>Destination</option>
                    <option>Tips</option>
                    <option>News</option>
                    <option>Community</option>
                  </select>
                </div>

                <div className="field">
                  <label>Author</label>

                  <input
                    name="author"
                    value={
                      communityForm.author
                    }
                    onChange={
                      handleCommunityChange
                    }
                  />
                </div>

                <div className="field">
                  <label>Location</label>

                  <input
                    name="location"
                    value={
                      communityForm.location
                    }
                    onChange={
                      handleCommunityChange
                    }
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
                </div>

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
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Write your community post here..."
                    />
                  </div>
                </div>

                <label className="policy-checkbox">
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

                  <span>
                    Feature this post
                  </span>
                </label>
              </div>

              <div className="community-actions">
                <button
                  type="submit"
                  className="primary-save"
                  disabled={creatingPost}
                >
                  {creatingPost
                    ? "Creating Post..."
                    : "Create Community Post"}
                </button>

                <button
                  type="button"
                  className="secondary-action community-clear"
                  onClick={
                    resetCommunityForm
                  }
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* POSTS */}

          {postsLoading ? (
            <div className="state-card">
              Loading community posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="state-card">
              No community posts found.
            </div>
          ) : (
            <div className="community-grid-modern">
              {posts.map((post) => {
                const status =
                  getPostStatus(post);

                return (
                  <article
                    className="community-card-modern"
                    key={post._id}
                  >
                    <img
                      src={getPostImage(post)}
                      alt={getPostTitle(post)}
                    />

                    <div className="community-card-body">
                      <div className="post-status-row">
                        <span>
                          COMMUNITY
                        </span>

                        <b
                          className={`post-status ${status}`}
                        >
                          {status}
                        </b>
                      </div>

                      <h3>
                        {getPostTitle(post)}
                      </h3>

                      {post.author && (
                        <small>
                          By {post.author}
                        </small>
                      )}

                      <div
                        className="post-preview"
                        dangerouslySetInnerHTML={{
                          __html:
                            getPostText(
                              post
                            ),
                        }}
                      />

                      <div className="post-actions-modern">
                        <button
                          className="approve"
                          type="button"
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
                          className="reject"
                          type="button"
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
                          className="remove"
                          type="button"
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
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          MODERN ADMIN STYLES
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .admin-page {
          min-height: 100vh;
          background:
            linear-gradient(
              180deg,
              #f7f8f6 0%,
              #eef2ed 100%
            );
          color: #17211b;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
          padding: 48px 20px 90px;
        }

        .admin-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 52px;
        }

        .brand-kicker,
        .section-kicker {
          color: #9a7440;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2.8px;
          text-transform: uppercase;
        }

        .dashboard-header h1 {
          margin: 8px 0 8px;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.05;
          letter-spacing: -1.8px;
        }

        .dashboard-header p,
        .section-heading-row p {
          color: #69736d;
          margin: 0;
          line-height: 1.7;
        }

        .dashboard-refresh,
        .outline-btn {
          border: 1px solid #d8dfd9;
          background: white;
          color: #17211b;
          padding: 12px 18px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .dashboard-refresh:hover,
        .outline-btn:hover {
          border-color: #9a7440;
          transform: translateY(-1px);
        }

        .management-section,
        .existing-section,
        .community-section {
          margin-bottom: 70px;
        }

        .section-heading-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 25px;
          margin-bottom: 22px;
        }

        .section-heading-row h2 {
          margin: 7px 0;
          font-size: 30px;
          letter-spacing: -0.7px;
        }

        .admin-card {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #dfe5df;
          border-radius: 22px;
          box-shadow:
            0 16px 45px
            rgba(23, 33, 27, 0.06);
        }

        .room-form-card {
          overflow: hidden;
        }

        .form-tabs {
          display: flex;
          gap: 0;
          overflow-x: auto;
          border-bottom: 1px solid #e2e7e2;
          background: #fafbf9;
        }

        .form-tabs button {
          flex: 1;
          min-width: 170px;
          border: 0;
          background: transparent;
          padding: 18px 14px;
          color: #68716b;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
        }

        .form-tabs button.active {
          color: #17211b;
          border-bottom-color: #9a7440;
          background: white;
        }

        .tab-content {
          padding: 32px;
        }

        .form-section-intro {
          margin-bottom: 28px;
        }

        .form-section-intro > span {
          color: #9a7440;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .form-section-intro h3 {
          margin: 7px 0;
          font-size: 24px;
          letter-spacing: -0.4px;
        }

        .form-section-intro p {
          color: #69736d;
          margin: 0;
          line-height: 1.6;
        }

        .modern-form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
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
          font-size: 12px;
          font-weight: 850;
          color: #26332b;
        }

        .field label span {
          color: #9a7440;
          margin-left: 5px;
          font-size: 10px;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          border: 1px solid #d7ded8;
          background: #fff;
          border-radius: 10px;
          padding: 13px 14px;
          color: #17211b;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .field textarea {
          resize: vertical;
          min-height: 110px;
          line-height: 1.65;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #9a7440;
          box-shadow:
            0 0 0 3px
            rgba(154, 116, 64, 0.09);
        }

        .field small {
          color: #7a837d;
          font-size: 11px;
          line-height: 1.5;
        }

        .seo-panel {
          grid-column: 1 / -1;
          background:
            linear-gradient(
              135deg,
              #f8f5ee,
              #fbfaf7
            );
          border: 1px solid #e7ddce;
          border-radius: 15px;
          padding: 22px;
        }

        .seo-panel-title {
          margin-bottom: 18px;
        }

        .seo-panel-title span {
          display: block;
          color: #9a7440;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .seo-panel-title small {
          color: #777;
          display: block;
          margin-top: 5px;
        }

        .image-upload-modern {
          position: relative;
          border: 1.5px dashed #cbd4cc;
          border-radius: 15px;
          padding: 32px;
          text-align: center;
          background: #fafcfa;
        }

        .upload-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e9efe9;
          color: #45634e;
          font-size: 25px;
          font-weight: 900;
        }

        .image-upload-modern h4 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .image-upload-modern p {
          color: #778079;
          font-size: 12px;
          margin: 0 0 18px;
        }

        .image-upload-modern input[type="file"] {
          max-width: 100%;
          font-size: 12px;
        }

        .upload-message {
          margin-top: 14px;
          padding: 10px 14px;
          border-radius: 8px;
          background: #e7f2e9;
          color: #326340;
          font-size: 12px;
          font-weight: 800;
        }

        .upload-message.uploading {
          background: #f5eee1;
          color: #8a6636;
        }

        .url-image-row {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }

        .url-image-row input {
          flex: 1;
          border: 1px solid #d7ded8;
          border-radius: 10px;
          padding: 13px;
          outline: none;
        }

        .url-image-row button {
          border: 0;
          border-radius: 10px;
          padding: 0 18px;
          background: #17211b;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .image-preview-grid-modern {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .modern-image-card {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid #dce3dd;
          background: white;
        }

        .modern-image-card img {
          display: block;
          width: 100%;
          height: 145px;
          object-fit: cover;
        }

        .main-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #17211b;
          color: white;
          padding: 5px 7px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .image-delete {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 29px;
          height: 29px;
          border: 0;
          border-radius: 50%;
          background: rgba(164, 60, 49, 0.94);
          color: white;
          font-size: 19px;
          cursor: pointer;
        }

        .image-index {
          padding: 8px 9px;
          font-size: 10px;
          color: #747e77;
          font-weight: 800;
        }

        .subsection-card {
          grid-column: 1 / -1;
          padding: 22px;
          border: 1px solid #e0e6e0;
          background: #fafcf9;
          border-radius: 15px;
        }

        .subsection-card > div:first-child {
          margin-bottom: 18px;
        }

        .subsection-card span {
          color: #9a7440;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .subsection-card h4 {
          margin: 5px 0 0;
          font-size: 18px;
        }

        .tab-navigation,
        .tab-next {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 30px;
          padding-top: 22px;
          border-top: 1px solid #e7ebe7;
        }

        .tab-next {
          justify-content: flex-end;
        }

        .tab-navigation button,
        .tab-next button {
          border: 0;
          border-radius: 10px;
          padding: 12px 18px;
          background: #17211b;
          color: white;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .tab-navigation button:hover,
        .tab-next button:hover {
          transform: translateY(-1px);
        }

        .tab-navigation button:first-child {
          background: #edf0ed;
          color: #17211b;
        }

        .policy-checkbox {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 15px;
          border: 1px solid #dfe5df;
          border-radius: 10px;
          background: #fafcfa;
          font-size: 13px;
          font-weight: 800;
        }

        .policy-checkbox input {
          width: 17px;
          height: 17px;
        }

        .final-save-box {
          margin-top: 32px;
          padding: 24px;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #17211b,
              #26362c
            );
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
        }

        .final-save-box > div:first-child span {
          color: #d9b77d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .final-save-box h3 {
          margin: 7px 0;
        }

        .final-save-box p {
          margin: 0;
          color: #bdc7bf;
          font-size: 13px;
        }

        .final-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .primary-save,
        .secondary-action {
          border: 0;
          border-radius: 9px;
          padding: 13px 20px;
          font-weight: 850;
          cursor: pointer;
        }

        .primary-save {
          background: #d4aa6a;
          color: #17211b;
        }

        .secondary-action {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }

        .community-clear {
          background: #edf0ed;
          color: #17211b;
        }

        .primary-save:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .inventory-count {
          padding: 8px 12px;
          background: white;
          border: 1px solid #dce3dd;
          border-radius: 20px;
          color: #657069;
          font-size: 12px;
          font-weight: 800;
        }

        .modern-room-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .modern-room-card {
          overflow: hidden;
          background: white;
          border: 1px solid #dfe5df;
          border-radius: 18px;
          box-shadow:
            0 10px 28px
            rgba(23, 33, 27, 0.05);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .modern-room-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 16px 35px
            rgba(23, 33, 27, 0.09);
        }

        .room-card-image {
          position: relative;
        }

        .room-card-image img {
          width: 100%;
          height: 220px;
          display: block;
          object-fit: cover;
        }

        .availability {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 9px;
          border-radius: 20px;
          background: #e6f2e8;
          color: #326340;
          font-size: 10px;
          font-weight: 900;
        }

        .availability.unavailable {
          background: #f5e7e5;
          color: #a13f34;
        }

        .room-card-body {
          padding: 18px;
        }

        .room-card-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .room-card-top h3 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .room-card-top p {
          margin: 0;
          color: #8a673a;
          font-size: 12px;
          font-weight: 800;
        }

        .room-card-top strong {
          color: #8a673a;
          white-space: nowrap;
          font-size: 14px;
        }

        .room-slug {
          margin-top: 12px;
          padding: 8px;
          background: #f5f7f4;
          border-radius: 7px;
          color: #777;
          font-size: 10px;
          word-break: break-all;
        }

        .room-card-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin: 14px 0;
          color: #68716b;
          font-size: 11px;
        }

        .room-card-actions {
          display: grid;
          grid-template-columns:
            1fr 1fr 1fr;
          gap: 7px;
          padding-top: 14px;
          border-top: 1px solid #edf0ed;
        }

        .room-card-actions a,
        .room-card-actions button {
          text-align: center;
          border: 0;
          border-radius: 8px;
          padding: 10px 6px;
          font-size: 11px;
          font-weight: 850;
          text-decoration: none;
          cursor: pointer;
        }

        .view-room {
          background: #eef3ee;
          color: #17211b;
        }

        .edit-room {
          background: #f5eee1;
          color: #8a6636;
        }

        .delete-room {
          background: #f6e8e6;
          color: #a13f34;
        }

        .state-card {
          padding: 65px 20px;
          text-align: center;
          background: white;
          border: 1px solid #dfe5df;
          border-radius: 18px;
          color: #737d76;
        }

        .community-section {
          padding-top: 55px;
          border-top: 1px solid #d9e0da;
        }

        .community-create-card {
          padding: 30px;
          margin-bottom: 28px;
        }

        .community-actions {
          display: flex;
          gap: 10px;
          margin-top: 24px;
        }

        .rich-editor {
          border-radius: 10px;
          overflow: hidden;
        }

        .rich-editor .ql-toolbar {
          border: 1px solid #d7ded8;
          background: #f7f9f6;
        }

        .rich-editor .ql-container {
          border: 1px solid #d7ded8;
          border-top: 0;
          min-height: 280px;
        }

        .rich-editor .ql-editor {
          min-height: 280px;
          font-size: 15px;
          line-height: 1.7;
        }

        .community-grid-modern {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .community-card-modern {
          overflow: hidden;
          background: white;
          border: 1px solid #dfe5df;
          border-radius: 18px;
        }

        .community-card-modern > img {
          width: 100%;
          height: 205px;
          object-fit: cover;
          display: block;
        }

        .community-card-body {
          padding: 18px;
        }

        .post-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .post-status-row > span {
          color: #9a7440;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .post-status {
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 9px;
          text-transform: uppercase;
        }

        .post-status.pending {
          background: #f5eee1;
          color: #8a6636;
        }

        .post-status.approved {
          background: #e6f2e8;
          color: #326340;
        }

        .post-status.rejected {
          background: #f6e8e6;
          color: #a13f34;
        }

        .community-card-body h3 {
          margin: 0 0 7px;
          font-size: 19px;
        }

        .community-card-body > small {
          color: #8a673a;
          font-weight: 700;
        }

        .post-preview {
          margin-top: 12px;
          color: #69736d;
          font-size: 12px;
          line-height: 1.6;
          max-height: 90px;
          overflow: hidden;
        }

        .post-actions-modern {
          display: grid;
          grid-template-columns:
            1fr 1fr 1fr;
          gap: 6px;
          margin-top: 18px;
        }

        .post-actions-modern button {
          border: 0;
          border-radius: 8px;
          padding: 9px 5px;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .approve {
          background: #e6f2e8;
          color: #326340;
        }

        .reject {
          background: #f5eee1;
          color: #8a6636;
        }

        .remove {
          background: #f6e8e6;
          color: #a13f34;
        }

        @media (max-width: 1000px) {
          .modern-room-grid,
          .community-grid-modern {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .image-preview-grid-modern {
            grid-template-columns:
              repeat(3, 1fr);
          }
        }

        @media (max-width: 720px) {
          .admin-page {
            padding: 28px 14px 60px;
          }

          .dashboard-header,
          .section-heading-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .dashboard-refresh,
          .outline-btn {
            width: 100%;
          }

          .tab-content {
            padding: 22px 18px;
          }

          .modern-form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .seo-panel,
          .subsection-card {
            grid-column: auto;
          }

          .image-preview-grid-modern {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .modern-room-grid,
          .community-grid-modern {
            grid-template-columns: 1fr;
          }

          .url-image-row {
            flex-direction: column;
          }

          .url-image-row button {
            min-height: 44px;
          }

          .final-save-box {
            flex-direction: column;
            align-items: flex-start;
          }

          .final-actions {
            width: 100%;
          }

          .final-actions button {
            flex: 1;
          }

          .room-card-top {
            flex-direction: column;
          }

          .room-card-top strong {
            align-self: flex-start;
          }

          .community-actions {
            flex-direction: column;
          }

          .community-actions button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .dashboard-header h1 {
            font-size: 34px;
          }

          .form-tabs button {
            min-width: 145px;
          }

          .image-preview-grid-modern {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .modern-image-card img {
            height: 115px;
          }

          .room-card-actions {
            grid-template-columns:
              1fr 1fr;
          }

          .room-card-actions .delete-room {
            grid-column: 1 / -1;
          }

          .post-actions-modern {
            grid-template-columns: 1fr;
          }

          .community-create-card {
            padding: 20px;
          }

          .tab-navigation {
            flex-direction: column;
          }

          .tab-navigation button,
          .tab-next button {
            width: 100%;
          }

          .final-actions {
            flex-direction: column;
          }

          .final-actions button {
            width: 100%;
          }
        }

      `}</style>
    </div>
  );
}