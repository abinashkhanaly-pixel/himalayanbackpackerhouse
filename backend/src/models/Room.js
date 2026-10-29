
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    // ==========================================
    // ROOM NAME
    // ==========================================
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      minlength: [2, "Room name must be at least 2 characters"],
      maxlength: [100, "Room name cannot exceed 100 characters"],
    },

    // ==========================================
    // DESTINATION
    // ==========================================
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
      minlength: [2, "Destination is required"],
      maxlength: [100, "Destination cannot exceed 100 characters"],
      index: true,
    },

    // ==========================================
    // PROPERTY TYPE & STAR CATEGORY
    // ==========================================
    propertyType: {
      type: String,
      trim: true,
      default: "Hotel",
    },

    starCategory: {
      type: String,
      trim: true,
      enum: ["", "1 Star", "2 Star", "3 Star", "4 Star", "5 Star"],
      default: "",
    },

    // ==========================================
    // HOMEPAGE DISPLAY SECTIONS (EXISTING)
    // ==========================================
    homepageSections: {
      type: [String],
      enum: [
        "Himalayan Retreats Near Kathmandu",
        "Dhulikhel",
        "Nagarkot",
      ],
      default: [],
    },

    // ==========================================
    // CHECK-IN & CHECK-OUT
    // ==========================================
    checkIn: {
      type: String,
      trim: true,
      default: "14:00",
    },

    checkOut: {
      type: String,
      trim: true,
      default: "12:00",
    },

    languages: {
      type: [String],
      default: [],
    },

    // ==========================================
    // SEO FIELDS (EXISTING)
    // ==========================================
    seoSlug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [150, "SEO slug cannot exceed 150 characters"],
      index: true,
    },

    seoTitle: {
      type: String,
      trim: true,
      maxlength: [160, "SEO title cannot exceed 160 characters"],
    },

    seoDescription: {
      type: String,
      trim: true,
      maxlength: [320, "SEO description cannot exceed 320 characters"],
    },

    // ==========================================
    // SEO KEYWORDS (NEW)
    // ==========================================
    seoKeywords: {
      type: [String],
      default: [],
      set: (items) => {
        if (!Array.isArray(items)) {
          if (typeof items === "string") {
            items = items.split(",");
          } else {
            return [];
          }
        }

        return [
          ...new Set(
            items
              .map((item) => String(item).trim())
              .filter((item) => item.length > 0)
          ),
        ];
      },
    },

    // ==========================================
    // ROOM DESCRIPTION (EXISTING)
    // ==========================================
    description: {
      type: String,
      required: [true, "Room description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // ==========================================
    // HOTEL INSIGHTS (NEW)
    // Admin-managed hotel-specific content
    // No content maxlength restriction
    // ==========================================
    hotelInsights: {
      // 1. Why Choose This Hotel?
      whyChoose: {
        type: String,
        trim: true,
        default: "",
      },

      // 2. Real Location Intelligence
      locationIntelligence: {
        type: String,
        trim: true,
        default: "",
      },

      // 3. Who Is This Hotel Best For?
      bestFor: {
        type: String,
        trim: true,
        default: "",
      },

      // 4. Room Selection Intelligence
      roomSelection: {
        type: String,
        trim: true,
        default: "",
      },

      // 5. Experience Beyond the Room
      experiences: {
        type: String,
        trim: true,
        default: "",
      },

      // 6. Booking Confidence Centre
      bookingConfidence: {
        type: String,
        trim: true,
        default: "",
      },

      // 7. The Neighbourhood Guide
      neighbourhoodGuide: {
        type: String,
        trim: true,
        default: "",
      },

      // 8. Honest Pros and Things to Consider
      prosAndConsiderations: {
        type: String,
        trim: true,
        default: "",
      },

      // 9. Smart Hotel Comparison
      smartComparison: {
        type: String,
        trim: true,
        default: "",
      },

      // 10. Ask About This Hotel
      hotelFAQs: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // ==========================================
    // PRICE PER NIGHT (EXISTING)
    // ==========================================
    price: {
      type: Number,
      required: [true, "Room price is required"],
      min: [0, "Price cannot be negative"],
    },

    // ==========================================
    // GUEST CAPACITY (EXISTING)
    // ==========================================
    capacity: {
      type: Number,
      required: [true, "Guest capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [50, "Capacity cannot exceed 50"],
    },

    // ==========================================
    // BED INFORMATION (EXISTING)
    // ==========================================
    beds: {
      type: String,
      required: [true, "Bed information is required"],
      trim: true,
      maxlength: [200, "Bed information is too long"],
    },

    // ==========================================
    // AMENITIES (EXISTING)
    // ==========================================
    amenities: {
      type: [String],
      default: [],
      set: (items) => {
        if (!Array.isArray(items)) return [];

        return [
          ...new Set(
            items
              .map((item) => String(item).trim())
              .filter((item) => item.length > 0)
          ),
        ];
      },
    },

    // ==========================================
    // ROOM IMAGES / GALLERY (EXISTING)
    // ==========================================
    images: {
      type: [String],
      default: [],
      set: (items) => {
        if (!Array.isArray(items)) return [];

        return items
          .map((item) => String(item).trim())
          .filter((item) => item.length > 0);
      },
    },

    // ==========================================
    // DEDICATED ROOM IMAGE (EXISTING)
    // ==========================================
    roomImage: {
      type: String,
      trim: true,
      default: "",
    },

    mainImage: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // ROOM AVAILABILITY (EXISTING)
    // ==========================================
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// CLEAN ROOM DATA BEFORE RETURNING (EXISTING)
// ==========================================
roomSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Room", roomSchema);
