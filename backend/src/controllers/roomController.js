const Room = require("../models/Room");

// =====================================================
// GET ALL / SEARCH ROOMS
// GET /api/rooms
// GET /api/rooms/search
//
// Query:
// ?destination=Mountain
// ?guests=2
// ?checkIn=2026-09-01
// ?checkOut=2026-09-05
// =====================================================

const getRooms = async (req, res) => {
  try {
    const {
      destination = "",
      guests = "",
      checkIn = "",
      checkOut = "",
    } = req.query;

    const roomFilter = {};

    // ---------------------------------------------
    // DESTINATION / KEYWORD SEARCH
    // ---------------------------------------------

    if (destination.trim()) {
      const searchRegex = new RegExp(destination.trim(), "i");

      roomFilter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { amenities: searchRegex },
        { beds: searchRegex },
        { seoTitle: searchRegex },
        { seoDescription: searchRegex },
        { seoSlug: searchRegex },
      ];
    }

    // ---------------------------------------------
    // GUEST CAPACITY
    // ---------------------------------------------

    if (guests) {
      const guestNumber = Number(guests);

      if (!Number.isNaN(guestNumber) && guestNumber > 0) {
        roomFilter.capacity = {
          $gte: guestNumber,
        };
      }
    }

    // Only show available rooms
    roomFilter.available = true;

    // ---------------------------------------------
    // GET ROOMS
    // ---------------------------------------------

    let rooms = await Room.find(roomFilter).sort({
      createdAt: -1,
    });

    // ---------------------------------------------
    // DATE AVAILABILITY
    // ---------------------------------------------

    if (checkIn && checkOut) {
      try {
        const Booking = require("../models/Booking");

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        if (
          !Number.isNaN(startDate.getTime()) &&
          !Number.isNaN(endDate.getTime()) &&
          endDate > startDate
        ) {
          const bookings = await Booking.find({
            status: {
              $in: ["pending", "confirmed"],
            },

            checkIn: {
              $lt: endDate,
            },

            checkOut: {
              $gt: startDate,
            },
          }).select("room");

          const bookedRoomIds = new Set(
            bookings
              .filter((booking) => booking.room)
              .map((booking) => booking.room.toString())
          );

          rooms = rooms.filter(
            (room) => !bookedRoomIds.has(room._id.toString())
          );
        }
      } catch (bookingError) {
        console.warn(
          "Booking availability check skipped:",
          bookingError.message
        );
      }
    }

    // ---------------------------------------------
    // RESPONSE
    // ---------------------------------------------

    res.json({
      success: true,
      count: rooms.length,

      filters: {
        destination,
        guests,
        checkIn,
        checkOut,
      },

      data: rooms,
    });
  } catch (error) {
    console.error("Get Rooms Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// SEARCH ROOMS
// GET /api/rooms/search
// =====================================================

const searchRooms = async (req, res) => {
  return getRooms(req, res);
};

// =====================================================
// GET SINGLE ROOM BY MONGODB ID
// GET /api/rooms/:id
// =====================================================

const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Get Room Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ROOM BY SEO SLUG
// GET /api/rooms/slug/:slug
//
// Example:
// /api/rooms/slug/deluxe-mountain-view-room-kathmandu
// =====================================================

const getRoomBySlug = async (req, res) => {
  try {
    const slug = req.params.slug
      ? req.params.slug.trim().toLowerCase()
      : "";

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Room SEO slug is required",
      });
    }

    const room = await Room.findOne({
      seoSlug: slug,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Get Room By Slug Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// CREATE ROOM
// POST /api/rooms
// =====================================================

const createRoom = async (req, res) => {
  try {
    // ---------------------------------------------
    // CLEAN SEO DATA
    // ---------------------------------------------

    const roomData = {
      ...req.body,

      seoSlug: req.body.seoSlug
        ? req.body.seoSlug
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
        : "",

      seoTitle: req.body.seoTitle
        ? req.body.seoTitle.trim()
        : "",

      seoDescription: req.body.seoDescription
        ? req.body.seoDescription.trim()
        : "",
    };

    // ---------------------------------------------
    // CREATE ROOM
    // ---------------------------------------------

    const room = await Room.create(roomData);

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    console.error("Create Room Error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE ROOM
// PUT /api/rooms/:id
// =====================================================

const updateRoom = async (req, res) => {
  try {
    // ---------------------------------------------
    // CLEAN SEO DATA
    // ---------------------------------------------

    const roomData = {
      ...req.body,

      ...(req.body.seoSlug !== undefined && {
        seoSlug: req.body.seoSlug
          ? req.body.seoSlug
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-")
          : "",
      }),

      ...(req.body.seoTitle !== undefined && {
        seoTitle: req.body.seoTitle
          ? req.body.seoTitle.trim()
          : "",
      }),

      ...(req.body.seoDescription !== undefined && {
        seoDescription: req.body.seoDescription
          ? req.body.seoDescription.trim()
          : "",
      }),
    };

    // ---------------------------------------------
    // UPDATE ROOM
    // ---------------------------------------------

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      roomData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    console.error("Update Room Error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE ROOM
// DELETE /api/rooms/:id
// =====================================================

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete Room Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getRooms,
  searchRooms,
  getRoom,
  getRoomBySlug,
  createRoom,
  updateRoom,
  deleteRoom,
};

