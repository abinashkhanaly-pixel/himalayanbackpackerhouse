import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import "./AddTrek.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backpacker-gateways-2.onrender.com/api";

const emptyItinerary = {
  day: 1,
  title: "",
  description: "",
};

const emptyFaq = {
  question: "",
  answer: "",
};

const emptyDeparture = {
  date: "",
  available: true,
};

/* --------------------------------------------------
   FIXED EQUIPMENT CATEGORIES
-------------------------------------------------- */

const EQUIPMENT_CATEGORIES = [
  "General",
  "Upper Body",
  "Lower Body",
  "Footwear",
  "First Aid & Essential Kit",
  "Personal & Electronics",
  "Documents & Travel Essentials",
];

/* --------------------------------------------------
   EMPTY FORM
-------------------------------------------------- */

const createEmptyForm = () => ({
  name: "",
  shortName: "",
  slug: "",
  published: false,
  featured: false,

  duration: "",
  price: "",
  discountPrice: "",
  currency: "USD",
  difficulty: "",
  maxAltitude: "",
  bestSeason: "",

  country: "Nepal",
  activity: "Trekking",
  startPoint: "",
  endPoint: "",
  accommodation: "",
  meals: "",

  mainImage: "",
  gallery: [],
  mapImage: "",
  elevationImage: "",
  videos: [],

  /* RICH TEXT CONTENT */

  description: "",
  highlights: "",
  overview: "",
  shortItinerary: "",
  importantInformation: "",

  /* DETAILED ITINERARY */

  itinerary: [{ ...emptyItinerary }],

  /* PRICING CONTENT */

  included: "",
  excluded: "",

  /* DEPARTURES */

  departures: [{ ...emptyDeparture }],

  /* EQUIPMENT */

  gearSections: EQUIPMENT_CATEGORIES.map((category) => ({
    title: category,
    items: [""],
  })),

  /* FAQ */

  faqs: [{ ...emptyFaq }],

  reviews: [],

  /* SEO */

  seo: {
    primaryKeyword: "",
    secondaryKeywords: "",
    lsiKeywords: "",
    searchIntent: "commercial",
    metaTitle: "",
    metaDescription: "",
    canonical: "",
    imageAlt: "",
  },
});

function EditTrek() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("basic");

  const [form, setForm] = useState(createEmptyForm);

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ==================================================
     NORMALIZE API DATA
  ================================================== */

  const normalizeTrek = (trek) => {
    const base = createEmptyForm();

    /* ----------------------------------------------
       NORMALIZE EQUIPMENT
    ---------------------------------------------- */

    const normalizedGearSections =
      EQUIPMENT_CATEGORIES.map((category) => {
        const existing =
          Array.isArray(trek.gearSections)
            ? trek.gearSections.find((section) => {
                const title =
                  section?.title?.toLowerCase().trim();

                const categoryName =
                  category.toLowerCase().trim();

                /* Handle old category name */
                if (
                  categoryName ===
                  "first aid & essential kit"
                ) {
                  return (
                    title ===
                      "first aid & essential kit" ||
                    title === "first aid & essentials"
                  );
                }

                return title === categoryName;
              })
            : null;

        let content = "";

        if (Array.isArray(existing?.items)) {
          content = existing.items.join("<br>");
        } else if (existing?.items) {
          content = existing.items;
        }

        return {
          title: category,
          items: [content],
        };
      });

    /* ----------------------------------------------
       RETURN NORMALIZED FORM
    ---------------------------------------------- */

    return {
      ...base,

      ...trek,

      /* BASIC */

      name: trek.name || "",
      shortName: trek.shortName || "",
      slug: trek.slug || "",

      published: Boolean(trek.published),
      featured: Boolean(trek.featured),

      duration: trek.duration ?? "",
      price: trek.price ?? "",
      discountPrice: trek.discountPrice ?? "",
      currency: trek.currency || "USD",
      difficulty: trek.difficulty || "",
      maxAltitude: trek.maxAltitude ?? "",
      bestSeason: trek.bestSeason || "",

      country: trek.country || "Nepal",
      activity: trek.activity || "Trekking",
      startPoint: trek.startPoint || "",
      endPoint: trek.endPoint || "",
      accommodation: trek.accommodation || "",
      meals: trek.meals || "",

      /* MEDIA */

      mainImage: trek.mainImage || "",

      gallery: Array.isArray(trek.gallery)
        ? trek.gallery
        : [],

      mapImage: trek.mapImage || "",

      elevationImage:
        trek.elevationImage || "",

      videos: Array.isArray(trek.videos)
        ? trek.videos
        : [],

      /* ----------------------------------------------
         RICH TEXT CONTENT
      ---------------------------------------------- */

      description: trek.description || "",

      highlights: Array.isArray(trek.highlights)
        ? trek.highlights.join("<br>")
        : trek.highlights || "",

      overview: trek.overview || "",

      shortItinerary: Array.isArray(
        trek.shortItinerary
      )
        ? trek.shortItinerary.join("<br>")
        : trek.shortItinerary || "",

      importantInformation: Array.isArray(
        trek.importantInformation
      )
        ? trek.importantInformation.join("<br>")
        : trek.importantInformation || "",

      /* ----------------------------------------------
         DETAILED ITINERARY
      ---------------------------------------------- */

      itinerary:
        Array.isArray(trek.itinerary) &&
        trek.itinerary.length
          ? trek.itinerary.map((item, index) => ({
              day: index + 1,
              title: item?.title || "",
              description:
                item?.description || "",
            }))
          : [{ ...emptyItinerary }],

      /* ----------------------------------------------
         PRICING RICH TEXT
      ---------------------------------------------- */

      included: Array.isArray(trek.included)
        ? trek.included.join("<br>")
        : trek.included || "",

      excluded: Array.isArray(trek.excluded)
        ? trek.excluded.join("<br>")
        : trek.excluded || "",

      /* ----------------------------------------------
         DEPARTURES
      ---------------------------------------------- */

      departures:
        Array.isArray(trek.departures) &&
        trek.departures.length
          ? trek.departures.map((item) => ({
              date: item?.date || "",
              available:
                item?.available !== false,
            }))
          : [{ ...emptyDeparture }],

      /* ----------------------------------------------
         EQUIPMENT
      ---------------------------------------------- */

      gearSections:
        normalizedGearSections,

      /* ----------------------------------------------
         FAQ
      ---------------------------------------------- */

      faqs:
        Array.isArray(trek.faqs) &&
        trek.faqs.length
          ? trek.faqs.map((faq) => ({
              question:
                faq?.question || "",
              answer:
                faq?.answer || "",
            }))
          : [{ ...emptyFaq }],

      /* ----------------------------------------------
         REVIEWS
      ---------------------------------------------- */

      reviews: Array.isArray(trek.reviews)
        ? trek.reviews
        : [],

      /* ----------------------------------------------
         SEO
      ---------------------------------------------- */

      seo: {
        ...base.seo,
        ...(trek.seo || {}),

        primaryKeyword:
          trek.seo?.primaryKeyword || "",

        secondaryKeywords:
          Array.isArray(
            trek.seo?.secondaryKeywords
          )
            ? trek.seo.secondaryKeywords.join(
                ", "
              )
            : trek.seo?.secondaryKeywords || "",

        lsiKeywords:
          Array.isArray(
            trek.seo?.lsiKeywords
          )
            ? trek.seo.lsiKeywords.join(", ")
            : trek.seo?.lsiKeywords || "",

        searchIntent:
          trek.seo?.searchIntent ||
          "commercial",

        metaTitle:
          trek.seo?.metaTitle || "",

        metaDescription:
          trek.seo?.metaDescription || "",

        canonical:
          trek.seo?.canonical || "",

        imageAlt:
          trek.seo?.imageAlt || "",
      },
    };
  };

  /* ==================================================
     LOAD TREK
  ================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadTrek = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/treks/${id}`
        );

        let result;

        try {
          result = await response.json();
        } catch {
          throw new Error(
            "Server returned an invalid response."
          );
        }

        console.log(
          "Edit trek API response:",
          result
        );

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              `Failed to load trek. Server returned ${response.status}.`
          );
        }

        const trek =
          result.data?.data ||
          result.data;

        if (!trek) {
          throw new Error(
            "Trek data was not found."
          );
        }

        if (!cancelled) {
          setForm(
            normalizeTrek(trek)
          );

          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Load trek error:",
          error
        );

        if (!cancelled) {
          setLoading(false);

          if (
            error.name === "TypeError"
          ) {
            setError(
              "Cannot connect to the backend server. Please try again."
            );
          } else {
            setError(
              error.message ||
                "Something went wrong while loading the trek."
            );
          }
        }
      }
    };

    if (id) {
      loadTrek();
    } else {
      setLoading(false);
      setError("Trek ID is missing.");
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ==================================================
     BASIC HANDLERS
  ================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (error) {
      setError("");
    }
  };

  /* ==================================================
     SEO HANDLER
  ================================================== */

  const handleSeoChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,

      seo: {
        ...current.seo,
        [name]: value,
      },
    }));

    if (error) {
      setError("");
    }
  };

  /* ==================================================
     RICH TEXT HANDLER
  ================================================== */

  const updateRichText = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* ==================================================
     SLUG
  ================================================== */

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );
  };

  const handleNameChange = (e) => {
    const value = e.target.value;

    setForm((current) => ({
      ...current,

      name: value,

      slug: generateSlug(value),
    }));

    if (error) {
      setError("");
    }
  };

  /* ==================================================
     ITINERARY
  ================================================== */

  const updateItinerary = (
    index,
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,

      itinerary:
        current.itinerary.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  };

  const addItineraryDay = () => {
    setForm((current) => ({
      ...current,

      itinerary: [
        ...current.itinerary,

        {
          day:
            current.itinerary.length +
            1,

          title: "",

          description: "",
        },
      ],
    }));
  };

  const removeItineraryDay = (
    index
  ) => {
    setForm((current) => ({
      ...current,

      itinerary:
        current.itinerary
          .filter(
            (_, i) => i !== index
          )
          .map((item, i) => ({
            ...item,
            day: i + 1,
          })),
    }));
  };

  /* ==================================================
     FAQ
  ================================================== */

  const updateFaq = (
    index,
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,

      faqs:
        current.faqs.map(
          (faq, i) =>
            i === index
              ? {
                  ...faq,
                  [field]: value,
                }
              : faq
        ),
    }));
  };

  const addFaq = () => {
    setForm((current) => ({
      ...current,

      faqs: [
        ...current.faqs,
        { ...emptyFaq },
      ],
    }));
  };

  const removeFaq = (index) => {
    setForm((current) => ({
      ...current,

      faqs:
        current.faqs.filter(
          (_, i) => i !== index
        ),
    }));
  };

  /* ==================================================
     DEPARTURES
  ================================================== */

  const updateDeparture = (
    index,
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,

      departures:
        current.departures.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  };

  const addDeparture = () => {
    setForm((current) => ({
      ...current,

      departures: [
        ...current.departures,
        { ...emptyDeparture },
      ],
    }));
  };

  const removeDeparture = (
    index
  ) => {
    setForm((current) => ({
      ...current,

      departures:
        current.departures.filter(
          (_, i) => i !== index
        ),
    }));
  };

  /* ==================================================
     EQUIPMENT
  ================================================== */

  const updateGearContent = (
    sectionIndex,
    value
  ) => {
    setForm((current) => ({
      ...current,

      gearSections:
        current.gearSections.map(
          (section, index) =>
            index === sectionIndex
              ? {
                  ...section,
                  items: [value],
                }
              : section
        ),
    }));

    if (error) {
      setError("");
    }
  };

  /* ==================================================
     GALLERY
  ================================================== */

  const addGalleryImage = () => {
    setForm((current) => ({
      ...current,

      gallery: [
        ...current.gallery,
        "",
      ],
    }));
  };

  const updateGalleryImage = (
    index,
    value
  ) => {
    setForm((current) => ({
      ...current,

      gallery:
        current.gallery.map(
          (image, i) =>
            i === index
              ? value
              : image
        ),
    }));
  };

  const removeGalleryImage = (
    index
  ) => {
    setForm((current) => ({
      ...current,

      gallery:
        current.gallery.filter(
          (_, i) => i !== index
        ),
    }));
  };

  /* ==================================================
     VIDEOS
  ================================================== */

  const addVideo = () => {
    setForm((current) => ({
      ...current,

      videos: [
        ...current.videos,
        "",
      ],
    }));
  };

  const updateVideo = (
    index,
    value
  ) => {
    setForm((current) => ({
      ...current,

      videos:
        current.videos.map(
          (video, i) =>
            i === index
              ? value
              : video
        ),
    }));
  };

  const removeVideo = (
    index
  ) => {
    setForm((current) => ({
      ...current,

      videos:
        current.videos.filter(
          (_, i) => i !== index
        ),
    }));
  };

  /* ==================================================
     UPDATE MONGODB
  ================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const cleanData = {
        ...form,

        /* ------------------------------------------
           BASIC
        ------------------------------------------ */

        name: form.name.trim(),

        shortName:
          form.shortName.trim(),

        slug: generateSlug(
          form.slug
        ),

        duration:
          String(
            form.duration
          ).trim(),

        difficulty:
          form.difficulty.trim(),

        bestSeason:
          form.bestSeason.trim(),

        country:
          form.country.trim(),

        activity:
          form.activity.trim(),

        startPoint:
          form.startPoint.trim(),

        endPoint:
          form.endPoint.trim(),

        accommodation:
          form.accommodation.trim(),

        meals:
          form.meals.trim(),

        /* ------------------------------------------
           MEDIA
        ------------------------------------------ */

        mainImage:
          form.mainImage.trim(),

        mapImage:
          form.mapImage.trim(),

        elevationImage:
          form.elevationImage.trim(),

        /* ------------------------------------------
           PRICING
        ------------------------------------------ */

        price:
          Number(form.price) || 0,

        discountPrice:
          Number(
            form.discountPrice
          ) || 0,

        maxAltitude:
          Number(
            String(
              form.maxAltitude
            )
              .replace(
                /,/g,
                ""
              )
              .replace(
                /[^\d.]/g,
                ""
              )
          ) || 0,

        /* ------------------------------------------
           RICH TEXT CONTENT

           Keep arrays for backend compatibility.
        ------------------------------------------ */

        highlights:
          form.highlights?.trim()
            ? [
                form.highlights.trim(),
              ]
            : [],

        shortItinerary:
          form.shortItinerary?.trim()
            ? [
                form.shortItinerary.trim(),
              ]
            : [],

        importantInformation:
          form.importantInformation?.trim()
            ? [
                form.importantInformation.trim(),
              ]
            : [],

        /* ------------------------------------------
           INCLUDED / EXCLUDED
        ------------------------------------------ */

        included:
          form.included?.trim()
            ? [
                form.included.trim(),
              ]
            : [],

        excluded:
          form.excluded?.trim()
            ? [
                form.excluded.trim(),
              ]
            : [],

        /* ------------------------------------------
           GALLERY
        ------------------------------------------ */

        gallery:
          form.gallery
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),

        /* ------------------------------------------
           VIDEOS
        ------------------------------------------ */

        videos:
          form.videos
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),

        /* ------------------------------------------
           DETAILED ITINERARY
        ------------------------------------------ */

        itinerary:
          form.itinerary
            .map(
              (item, index) => ({
                day: index + 1,

                title:
                  item.title.trim(),

                description:
                  item.description ||
                  "",
              })
            )
            .filter(
              (item) =>
                item.title ||
                item.description
            ),

        /* ------------------------------------------
           EQUIPMENT

           Rich text is stored inside items[0]
           so existing backend structure remains.
        ------------------------------------------ */

        gearSections:
          form.gearSections
            .map((section) => ({
              title:
                section.title.trim(),

              items:
                section.items
                  .map((item) =>
                    item.trim()
                  )
                  .filter(Boolean),
            }))
            .filter(
              (section) =>
                section.title ||
                section.items.length >
                  0
            ),

        /* ------------------------------------------
           FAQ
        ------------------------------------------ */

        faqs:
          form.faqs
            .map((faq) => ({
              question:
                faq.question.trim(),

              answer:
                faq.answer || "",
            }))
            .filter(
              (faq) =>
                faq.question ||
                faq.answer
            ),

        /* ------------------------------------------
           DEPARTURES
        ------------------------------------------ */

        departures:
          form.departures
            .filter(
              (departure) =>
                departure.date
            )
            .map(
              (departure) => ({
                date:
                  departure.date,

                available:
                  Boolean(
                    departure.available
                  ),
              })
            ),

        /* ------------------------------------------
           SEO
        ------------------------------------------ */

        seo: {
          ...form.seo,

          primaryKeyword:
            form.seo.primaryKeyword.trim(),

          secondaryKeywords:
            form.seo.secondaryKeywords
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),

          lsiKeywords:
            form.seo.lsiKeywords
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),

          metaTitle:
            form.seo.metaTitle.trim(),

          metaDescription:
            form.seo.metaDescription.trim(),

          canonical:
            form.seo.canonical.trim(),

          imageAlt:
            form.seo.imageAlt.trim(),
        },
      };

      /* --------------------------------------------
         REQUIRED VALIDATION
      -------------------------------------------- */

      if (!cleanData.name) {
        throw new Error(
          "Trek name is required."
        );
      }

      if (!cleanData.slug) {
        throw new Error(
          "Trek slug is required."
        );
      }

      console.log(
        "Updating trek:",
        cleanData
      );

      console.log(
        "API URL:",
        `${API_BASE_URL}/treks/${id}`
      );

      /* --------------------------------------------
         PUT REQUEST
      -------------------------------------------- */

      const response = await fetch(
        `${API_BASE_URL}/treks/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            cleanData
          ),
        }
      );

      let result;

      try {
        result =
          await response.json();
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      console.log(
        "Update API response:",
        result
      );

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            `Failed to update trek. Server returned ${response.status}.`
        );
      }

      console.log(
        "TREK UPDATED IN MONGODB:",
        result
      );

      setSaved(true);
      setSaving(false);

      setTimeout(() => {
        navigate(
          "/admin/trekking"
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Update trek error:",
        error
      );

      setSaving(false);
      setSaved(false);

      if (
        error.name ===
        "TypeError"
      ) {
        setError(
          "Cannot connect to the backend server. Please try again."
        );
      } else {
        setError(
          error.message ||
            "Something went wrong while updating the trek."
        );
      }
    }
  };

  /* ==================================================
     TABS
  ================================================== */

  const tabs = [
    ["basic", "Basic Information"],
    ["content", "Content"],
    ["itinerary", "Itinerary"],
    ["pricing", "Pricing"],
    ["equipment", "Equipment"],
    ["media", "Media"],
    ["seo", "SEO"],
    ["faq", "FAQ"],
    ["publishing", "Publishing"],
  ];

  /* ==================================================
     LOADING
  ================================================== */

  if (loading) {
    return (
      <div className="add-trek-page">
        <div className="add-trek-header">
          <div>
            <Link
              to="/admin/trekking"
              className="back-admin-link"
            >
              ← Back to Trekking Management
            </Link>

            <p className="admin-eyebrow">
              BACKPACKER GATEWAYS
            </p>

            <h1>
              Edit Trek
            </h1>

            <p>
              Loading trekking package...
            </p>
          </div>
        </div>

        <div className="form-section">
          <p>
            Please wait while the trek
            data is loaded from MongoDB.
          </p>
        </div>
      </div>
    );
  }

  /* ==================================================
     MAIN UI
  ================================================== */

  return (
    <div className="add-trek-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="add-trek-header">

        <div>
          <Link
            to="/admin/trekking"
            className="back-admin-link"
          >
            ← Back to Trekking Management
          </Link>

          <p className="admin-eyebrow">
            BACKPACKER GATEWAYS
          </p>

          <h1>
            Edit Trek
          </h1>

          <p>
            Update the complete trekking
            package including content,
            itinerary, pricing, media
            and SEO.
          </p>
        </div>

      </div>

      {/* =================================================
          TABS
      ================================================= */}

      <div className="add-trek-tabs">

        {tabs.map(
          ([tabId, label]) => (
            <button
              key={tabId}
              type="button"
              className={
                activeTab === tabId
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(tabId)
              }
            >
              {label}
            </button>
          )
        )}

      </div>

      <form
        className="add-trek-form"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        {activeTab === "basic" && (
          <section className="form-section">

            <h2>
              Basic Trek Information
            </h2>

            <div className="form-grid">

              <label className="full-width">
                Trek Name *

                <input
                  name="name"
                  value={form.name}
                  onChange={
                    handleNameChange
                  }
                  placeholder="Everest Base Camp Trek"
                  required
                />
              </label>

              <label>
                Short Name

                <input
                  name="shortName"
                  value={
                    form.shortName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Everest Base Camp"
                />
              </label>

              <label>
                Slug *

                <input
                  name="slug"
                  value={form.slug}
                  onChange={
                    handleChange
                  }
                  placeholder="everest-base-camp-trek"
                  required
                />
              </label>

              <label>
                Duration

                <input
                  name="duration"
                  value={
                    form.duration
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="14 Days"
                />
              </label>

              <label>
                Difficulty

                <select
                  name="difficulty"
                  value={
                    form.difficulty
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Select Difficulty
                  </option>

                  <option>
                    Easy
                  </option>

                  <option>
                    Easy to Moderate
                  </option>

                  <option>
                    Moderate
                  </option>

                  <option>
                    Moderate to Challenging
                  </option>

                  <option>
                    Challenging
                  </option>
                </select>
              </label>

              <label>
                Maximum Altitude

                <input
                  type="number"
                  min="0"
                  name="maxAltitude"
                  value={
                    form.maxAltitude
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="5364"
                />

                <small>
                  Enter altitude in metres.
                  Example: 5364
                </small>
              </label>

              <label>
                Best Season

                <input
                  name="bestSeason"
                  value={
                    form.bestSeason
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="March–May, September–November"
                />
              </label>

              <label>
                Country

                <input
                  name="country"
                  value={
                    form.country
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label>
                Activity

                <input
                  name="activity"
                  value={
                    form.activity
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label>
                Start Point

                <input
                  name="startPoint"
                  value={
                    form.startPoint
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Kathmandu"
                />
              </label>

              <label>
                End Point

                <input
                  name="endPoint"
                  value={
                    form.endPoint
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Kathmandu"
                />
              </label>

              <label>
                Accommodation

                <input
                  name="accommodation"
                  value={
                    form.accommodation
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Tea House / Lodge"
                />
              </label>

              <label>
                Meals

                <input
                  name="meals"
                  value={
                    form.meals
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Breakfast, Lunch & Dinner"
                />
              </label>

            </div>

          </section>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        {activeTab === "content" && (
          <section className="form-section">

            <h2>
              Trek Content
            </h2>

            {/* SHORT DESCRIPTION */}

            <label className="full-width">
              Short Description

              <RichTextEditor
                value={
                  form.description
                }
                onChange={(value) =>
                  updateRichText(
                    "description",
                    value
                  )
                }
                placeholder="Write a short description of this trek..."
                minHeight={180}
              />
            </label>

            {/* TREK OVERVIEW */}

            <label className="full-width">
              Trek Overview

              <RichTextEditor
                value={
                  form.overview
                }
                onChange={(value) =>
                  updateRichText(
                    "overview",
                    value
                  )
                }
                placeholder="Write a detailed trek overview..."
                minHeight={350}
              />
            </label>

            {/* HIGHLIGHTS */}

            <label className="full-width">
              Trek Highlights

              <RichTextEditor
                value={
                  form.highlights
                }
                onChange={(value) =>
                  updateRichText(
                    "highlights",
                    value
                  )
                }
                placeholder="Write all major highlights of this trek. Use bullet lists, headings and formatting where needed..."
                minHeight={280}
              />
            </label>

            {/* SHORT ITINERARY */}

            <label className="full-width">
              Short Itinerary

              <RichTextEditor
                value={
                  form.shortItinerary
                }
                onChange={(value) =>
                  updateRichText(
                    "shortItinerary",
                    value
                  )
                }
                placeholder="Write the complete short itinerary from Day 1 to Day 14..."
                minHeight={500}
              />
            </label>

            {/* IMPORTANT INFORMATION */}

            <label className="full-width">
              Important Information

              <RichTextEditor
                value={
                  form.importantInformation
                }
                onChange={(value) =>
                  updateRichText(
                    "importantInformation",
                    value
                  )
                }
                placeholder="Write important traveller information including difficulty, maximum altitude, best season, accommodation, weather, Lukla flights, permits, safety, insurance, preparation and other useful information..."
                minHeight={500}
              />
            </label>

          </section>
        )}

        {/* =================================================
            DETAILED ITINERARY
        ================================================= */}

        {activeTab === "itinerary" && (
          <section className="form-section">

            <h2>
              Detailed Itinerary
            </h2>

            <p className="section-help">
              Add every trekking day with
              a title and detailed description.
            </p>

            {form.itinerary.map(
              (day, index) => (
                <div
                  className="itinerary-editor"
                  key={index}
                >

                  <div className="itinerary-heading">

                    <strong>
                      Day {day.day}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeItineraryDay(
                          index
                        )
                      }
                    >
                      Remove Day
                    </button>

                  </div>

                  <label>
                    Day Title

                    <input
                      value={
                        day.title
                      }
                      onChange={(e) =>
                        updateItinerary(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Fly to Lukla and Trek to Phakding"
                    />
                  </label>

                  <label>
                    Day Description

                    <RichTextEditor
                      value={
                        day.description
                      }
                      onChange={(value) =>
                        updateItinerary(
                          index,
                          "description",
                          value
                        )
                      }
                      placeholder="Write the detailed itinerary for this day..."
                      minHeight={300}
                    />
                  </label>

                </div>
              )
            )}

            <button
              type="button"
              className="primary-btn"
              onClick={
                addItineraryDay
              }
            >
              + Add Another Day
            </button>

          </section>
        )}

        {/* =================================================
            PRICING
        ================================================= */}

        {activeTab === "pricing" && (
          <section className="form-section">

            <h2>
              Pricing & Booking
            </h2>

            <div className="form-grid">

              <label>
                Price

                <input
                  type="number"
                  min="0"
                  name="price"
                  value={form.price}
                  onChange={
                    handleChange
                  }
                  placeholder="1399"
                />
              </label>

              <label>
                Discount Price

                <input
                  type="number"
                  min="0"
                  name="discountPrice"
                  value={
                    form.discountPrice
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="1199"
                />
              </label>

              <label>
                Currency

                <select
                  name="currency"
                  value={
                    form.currency
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    USD
                  </option>

                  <option>
                    NPR
                  </option>

                  <option>
                    EUR
                  </option>

                  <option>
                    GBP
                  </option>
                </select>
              </label>

            </div>

            {/* PRICE INCLUDES */}

            <div className="array-editor">

              <h3>
                Price Includes
              </h3>

              <RichTextEditor
                value={
                  form.included
                }
                onChange={(value) =>
                  updateRichText(
                    "included",
                    value
                  )
                }
                placeholder="Write everything included in the trek package..."
                minHeight={300}
              />

            </div>

            {/* PRICE EXCLUDES */}

            <div className="array-editor">

              <h3>
                Price Excludes
              </h3>

              <RichTextEditor
                value={
                  form.excluded
                }
                onChange={(value) =>
                  updateRichText(
                    "excluded",
                    value
                  )
                }
                placeholder="Write everything not included in the trek package..."
                minHeight={300}
              />

            </div>

            {/* DEPARTURES */}

            <div className="departure-editor">

              <h3>
                Departure Dates
              </h3>

              {form.departures.map(
                (
                  departure,
                  index
                ) => (
                  <div
                    className="departure-row"
                    key={index}
                  >

                    <input
                      type="date"
                      value={
                        departure.date
                      }
                      onChange={(e) =>
                        updateDeparture(
                          index,
                          "date",
                          e.target.value
                        )
                      }
                    />

                    <label className="checkbox-label">

                      <input
                        type="checkbox"
                        checked={
                          departure.available
                        }
                        onChange={(e) =>
                          updateDeparture(
                            index,
                            "available",
                            e.target.checked
                          )
                        }
                      />

                      Available

                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        removeDeparture(
                          index
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>
                )
              )}

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  addDeparture
                }
              >
                + Add Departure Date
              </button>

            </div>

          </section>
        )}

        {/* =================================================
            EQUIPMENT
        ================================================= */}

        {activeTab === "equipment" && (
          <section className="form-section">

            <h2>
              Gear & Equipment
            </h2>

            <p className="section-help">
              Organize recommended trekking
              equipment by category. Use the
              rich text editor to add bullet
              lists, headings, links, images
              and formatted equipment information.
            </p>

            {form.gearSections.map(
              (
                section,
                sectionIndex
              ) => (
                <div
                  className="gear-section-editor"
                  key={sectionIndex}
                >

                  <div className="gear-section-header">

                    <h3>
                      {section.title}
                    </h3>

                  </div>

                  <RichTextEditor
                    value={
                      section.items?.[0] ||
                      ""
                    }
                    onChange={(value) =>
                      updateGearContent(
                        sectionIndex,
                        value
                      )
                    }
                    placeholder={`Write ${section.title} equipment and recommendations...`}
                    minHeight={280}
                  />

                </div>
              )
            )}

          </section>
        )}

        {/* =================================================
            MEDIA
        ================================================= */}

        {activeTab === "media" && (
          <section className="form-section">

            <h2>
              Images, Gallery & Videos
            </h2>

            <label className="full-width">
              Main Image URL

              <input
                name="mainImage"
                value={
                  form.mainImage
                }
                onChange={
                  handleChange
                }
                placeholder="https://..."
              />
            </label>

            <div className="array-editor">

              <h3>
                Gallery Images
              </h3>

              {form.gallery.map(
                (
                  image,
                  index
                ) => (
                  <div
                    className="array-row"
                    key={index}
                  >

                    <input
                      value={image}
                      onChange={(e) =>
                        updateGalleryImage(
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Gallery image URL"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeGalleryImage(
                          index
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>
                )
              )}

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  addGalleryImage
                }
              >
                + Add Gallery Image
              </button>

            </div>

            <div className="form-grid">

              <label>
                Map Image URL

                <input
                  name="mapImage"
                  value={
                    form.mapImage
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                />
              </label>

              <label>
                Elevation Image URL

                <input
                  name="elevationImage"
                  value={
                    form.elevationImage
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                />
              </label>

            </div>

            <div className="array-editor">

              <h3>
                Videos
              </h3>

              {form.videos.map(
                (
                  video,
                  index
                ) => (
                  <div
                    className="array-row"
                    key={index}
                  >

                    <input
                      value={video}
                      onChange={(e) =>
                        updateVideo(
                          index,
                          e.target.value
                        )
                      }
                      placeholder="YouTube video URL"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeVideo(
                          index
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>
                )
              )}

              <button
                type="button"
                className="secondary-btn"
                onClick={addVideo}
              >
                + Add Video
              </button>

            </div>

          </section>
        )}

        {/* =================================================
            SEO
        ================================================= */}

        {activeTab === "seo" && (
          <section className="form-section">

            <h2>
              SEO Settings
            </h2>

            <label>
              Primary Keyword

              <input
                name="primaryKeyword"
                value={
                  form.seo
                    .primaryKeyword
                }
                onChange={
                  handleSeoChange
                }
                placeholder="Everest Base Camp Trek"
              />
            </label>

            <label>
              Secondary Keywords

              <input
                name="secondaryKeywords"
                value={
                  form.seo
                    .secondaryKeywords
                }
                onChange={
                  handleSeoChange
                }
                placeholder="EBC Trek, Everest Trek Nepal, Everest Base Camp Nepal"
              />

              <small>
                Separate keywords with
                commas.
              </small>
            </label>

            <label>
              LSI / Related Keywords

              <input
                name="lsiKeywords"
                value={
                  form.seo
                    .lsiKeywords
                }
                onChange={
                  handleSeoChange
                }
                placeholder="Khumbu trek, Sherpa villages, Kala Patthar"
              />

              <small>
                Separate keywords with
                commas.
              </small>
            </label>

            <label>
              Search Intent

              <select
                name="searchIntent"
                value={
                  form.seo
                    .searchIntent
                }
                onChange={
                  handleSeoChange
                }
              >
                <option value="informational">
                  Informational
                </option>

                <option value="commercial">
                  Commercial
                </option>

                <option value="transactional">
                  Transactional
                </option>
              </select>
            </label>

            <label>
              Meta Title

              <input
                name="metaTitle"
                value={
                  form.seo
                    .metaTitle
                }
                onChange={
                  handleSeoChange
                }
                placeholder="Everest Base Camp Trek | Nepal"
              />
            </label>

            <label>
              Meta Description

              <textarea
                name="metaDescription"
                value={
                  form.seo
                    .metaDescription
                }
                onChange={
                  handleSeoChange
                }
                rows="4"
                placeholder="Write the search engine description..."
              />

              <small>
                Keep the meta description
                concise and focused on
                the main search intent.
              </small>
            </label>

            <label>
              Canonical URL

              <input
                name="canonical"
                value={
                  form.seo
                    .canonical
                }
                onChange={
                  handleSeoChange
                }
                placeholder="/trekking/everest-base-camp-trek"
              />
            </label>

            <label>
              Main Image Alt Text

              <input
                name="imageAlt"
                value={
                  form.seo
                    .imageAlt
                }
                onChange={
                  handleSeoChange
                }
                placeholder="Everest Base Camp Trek in Nepal"
              />
            </label>

          </section>
        )}

        {/* =================================================
            FAQ
        ================================================= */}

        {activeTab === "faq" && (
          <section className="form-section">

            <h2>
              Frequently Asked Questions
            </h2>

            {form.faqs.map(
              (
                faq,
                index
              ) => (
                <div
                  className="faq-editor"
                  key={index}
                >

                  <div className="faq-header">

                    <strong>
                      FAQ {index + 1}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeFaq(
                          index
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                  <label>
                    Question

                    <input
                      value={
                        faq.question
                      }
                      onChange={(e) =>
                        updateFaq(
                          index,
                          "question",
                          e.target.value
                        )
                      }
                      placeholder="How difficult is this trek?"
                    />
                  </label>

                  <label>
                    Answer

                    <RichTextEditor
                      value={
                        faq.answer
                      }
                      onChange={(value) =>
                        updateFaq(
                          index,
                          "answer",
                          value
                        )
                      }
                      placeholder="Write the detailed answer..."
                      minHeight={220}
                    />
                  </label>

                </div>
              )
            )}

            <button
              type="button"
              className="primary-btn"
              onClick={addFaq}
            >
              + Add FAQ
            </button>

          </section>
        )}

        {/* =================================================
            PUBLISHING
        ================================================= */}

        {activeTab === "publishing" && (
          <section className="form-section">

            <h2>
              Publishing Settings
            </h2>

            <div className="publish-box">

              <label className="publish-option">

                <input
                  type="checkbox"
                  name="published"
                  checked={
                    form.published
                  }
                  onChange={
                    handleChange
                  }
                />

                <div>

                  <strong>
                    Publish this trek
                  </strong>

                  <p>
                    Published treks can
                    appear on the public
                    trekking page.
                  </p>

                </div>

              </label>

              <label className="publish-option">

                <input
                  type="checkbox"
                  name="featured"
                  checked={
                    form.featured
                  }
                  onChange={
                    handleChange
                  }
                />

                <div>

                  <strong>
                    Featured Trek
                  </strong>

                  <p>
                    Mark this trek as a
                    featured package.
                  </p>

                </div>

              </label>

            </div>

          </section>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              marginBottom: "15px",
              padding: "12px 15px",
              borderRadius: "8px",
              background: "#fff1f1",
              color: "#b42318",
              border:
                "1px solid #f3b5b5",
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {saved && (
          <div
            style={{
              marginBottom: "15px",
              padding: "12px 15px",
              borderRadius: "8px",
              background: "#ecfdf3",
              color: "#027a48",
              border:
                "1px solid #abefc6",
            }}
          >
            Trek updated successfully
            in MongoDB. Redirecting...
          </div>
        )}

        {/* =================================================
            SAVE ACTIONS
        ================================================= */}

        <div className="form-actions">

          <Link
            to="/admin/trekking"
            className="cancel-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="save-trek-btn"
            disabled={saving}
          >
            {saving
              ? "Updating Trek..."
              : saved
              ? "Trek Updated ✓"
              : "Update Trek"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default EditTrek;