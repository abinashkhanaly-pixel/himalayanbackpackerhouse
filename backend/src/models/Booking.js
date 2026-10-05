const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    guestName: {
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

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    pricePerNight: {
      type: Number,
      required: true,
    },

    totalNights: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

/*
  Generate a short customer-facing booking reference.

  Example:
  BG-638
  BG-421
  BG-905
*/

bookingSchema.pre("validate", async function () {
  if (!this.isNew || this.bookingReference) {
    return;
  }

  let reference;
  let exists = true;

  while (exists) {
    const number = Math.floor(100 + Math.random() * 900);

    reference = `BG-${number}`;

    exists = await mongoose.models.Booking.exists({
      bookingReference: reference,
    });
  }

  this.bookingReference = reference;
});

module.exports = mongoose.model("Booking", bookingSchema);