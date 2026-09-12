const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    countryCode: {
      type: String,
      default: "+977",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    service: {
      type: String,
      default: "Hotel Booking",
      trim: true,
    },

    checkIn: {
      type: String,
      default: "",
    },

    checkOut: {
      type: String,
      default: "",
    },

    guests: {
      type: String,
      default: "1",
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "confirmed", "closed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inquiry", inquirySchema);