
const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const departureSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      trim: true,
    },
    available: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const gearSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    items: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    answer: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    primaryKeyword: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    secondaryKeywords: {
      type: [String],
      default: [],
    },

    lsiKeywords: {
      type: [String],
      default: [],
    },

    searchIntent: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    metaTitle: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: 320,
    },

    canonical: {
      type: String,
      trim: true,
    },

    imageAlt: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: false }
);

const trekSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC INFORMATION
    // =========================

    name: {
      type: String,
      required: [true, "Trek name is required"],
      trim: true,
      minlength: [2, "Trek name must be at least 2 characters"],
      maxlength: [200, "Trek name cannot exceed 200 characters"],
    },

    shortName: {
      type: String,
      trim: true,
      maxlength: [100, "Short name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: [true, "Trek slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [200, "Slug cannot exceed 200 characters"],
      index: true,
    },

    published: {
      type: Boolean,
      default: false,
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // =========================
    // TREK DETAILS
    // =========================

    duration: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    difficulty: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    maxAltitude: {
      type: Number,
      min: 0,
    },

    bestSeason: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    country: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Nepal",
    },

    activity: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    startPoint: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    endPoint: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    accommodation: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    meals: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // =========================
    // PRICING
    // =========================

    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },

    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "USD",
      maxlength: 10,
    },

    // =========================
    // CONTENT
    // =========================

    description: {
      type: String,
      default: "",
    },

    overview: {
      type: String,
      default: "",
    },

    highlights: {
      type: [String],
      default: [],
    },

    // FIXED:
    // Frontend sends shortItinerary as an array.
    shortItinerary: {
      type: [String],
      default: [],
    },

    importantInformation: {
      type: [String],
      default: [],
    },

    // =========================
    // ITINERARY
    // =========================

    itinerary: {
      type: [itinerarySchema],
      default: [],
    },

    // =========================
    // INCLUDES / EXCLUDES
    // =========================

    included: {
      type: [String],
      default: [],
    },

    excluded: {
      type: [String],
      default: [],
    },

    // =========================
    // DEPARTURES
    // =========================

    departures: {
      type: [departureSchema],
      default: [],
    },

    // =========================
    // GEAR / EQUIPMENT
    // =========================

    gearSections: {
      type: [gearSectionSchema],
      default: [],
    },

    // =========================
    // MEDIA
    // =========================

    mainImage: {
      type: String,
      trim: true,
      default: "",
    },

    gallery: {
      type: [String],
      default: [],
    },

    mapImage: {
      type: String,
      trim: true,
      default: "",
    },

    elevationImage: {
      type: String,
      trim: true,
      default: "",
    },

    videos: {
      type: [String],
      default: [],
    },

    // =========================
    // FAQ
    // =========================

    faqs: {
      type: [faqSchema],
      default: [],
    },

    // =========================
    // REVIEWS
    // =========================

    reviews: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // =========================
    // SEO
    // =========================

    seo: {
      type: seoSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// CLEAN JSON RESPONSE
// =========================

trekSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

// =========================
// INDEXES
// =========================

trekSchema.index({
  name: "text",
  shortName: "text",
  "seo.primaryKeyword": "text",
});

trekSchema.index({
  published: 1,
  featured: 1,
});

module.exports = mongoose.model("Trek", trekSchema);

