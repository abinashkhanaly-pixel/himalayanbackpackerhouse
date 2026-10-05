const Booking = require("../models/Booking");
const Room = require("../models/Room");

// Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      room,
      guestName,
      email,
      phone,
      guests,
      checkIn,
      checkOut,
    } = req.body;

    // Check required fields
    if (
      !room ||
      !guestName ||
      !email ||
      !phone ||
      !guests ||
      !checkIn ||
      !checkOut
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Find room
    const selectedRoom = await Room.findById(room);

    if (!selectedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check room availability
    if (!selectedRoom.available) {
      return res.status(400).json({
        success: false,
        message: "This room is currently unavailable",
      });
    }

    // Check guest capacity
    if (Number(guests) > selectedRoom.capacity) {
      return res.status(400).json({
        success: false,
        message: `Maximum capacity is ${selectedRoom.capacity} guests`,
      });
    }

    // Dates
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    // Calculate nights
    const difference =
      endDate.getTime() - startDate.getTime();

    const totalNights = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    if (totalNights < 1) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be after check-in",
      });
    }

    // Calculate total price
    const totalPrice =
      selectedRoom.price * totalNights;

    // Save booking
    // bookingReference is automatically generated
    // by the Booking model, for example: BG-638
    const booking = await Booking.create({
      room: selectedRoom._id,
      guestName,
      email,
      phone,
      guests: Number(guests),
      checkIn: startDate,
      checkOut: endDate,
      pricePerNight: selectedRoom.price,
      totalNights,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",

      // Short customer-facing reference
      bookingReference: booking.bookingReference,

      // Complete booking data
      data: booking,
    });
  } catch (error) {
    console.error("Booking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get All Bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createBooking,
  getBookings,
};