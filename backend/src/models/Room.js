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
    // Example: Kathmandu, Pokhara, Chitwan
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
    // SEO FIELDS
    // ==========================================

    // SEO URL / Slug
    // Example:
    // deluxe-mountain-view-room-kathmandu
    seoSlug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [150, "SEO slug cannot exceed 150 characters"],
      index: true,
    },

    // SEO Page Title
    // Example:
    // Deluxe Mountain View Room in Kathmandu | Backpacker Gateways
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [160, "SEO title cannot exceed 160 characters"],
    },

    // SEO Meta Description
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [320, "SEO description cannot exceed 320 characters"],
    },

    // ==========================================
    // ROOM DESCRIPTION
    // ==========================================
    description: {
      type: String,
      required: [true, "Room description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // ==========================================
    // PRICE PER NIGHT
    // ==========================================
    price: {
      type: Number,
      required: [true, "Room price is required"],
      min: [0, "Price cannot be negative"],
    },

    // ==========================================
    // GUEST CAPACITY
    // ==========================================
    capacity: {
      type: Number,
      required: [true, "Guest capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [50, "Capacity cannot exceed 50"],
    },

    // ==========================================
    // BED INFORMATION
    // Example: 1 Double Bed
    // ==========================================
    beds: {
      type: String,
      required: [true, "Bed information is required"],
      trim: true,
      maxlength: [200, "Bed information is too long"],
    },

    // ==========================================
    // AMENITIES
    // Example:
    // ["WiFi", "Hot Shower", "TV", "Mountain View"]
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
    // ROOM IMAGES
    // Example:
    // ["https://...", "https://..."]
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
    // ROOM AVAILABILITY
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
// CLEAN ROOM DATA BEFORE RETURNING
// ==========================================

roomSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Room", roomSchema);

