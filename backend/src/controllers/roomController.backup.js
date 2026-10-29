
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
        { seoKeywords: searchRegex },
        { "hotelInsights.whyChoose": searchRegex },
        { "hotelInsights.locationIntelligence": searchRegex },
        { "hotelInsights.bestFor": searchRegex },
        { "hotelInsights.roomSelection": searchRegex },
        { "hotelInsights.experiences": searchRegex },
        { "hotelInsights.bookingConfidence": searchRegex },
        { "hotelInsights.neighbourhoodGuide": searchRegex },
        { "hotelInsights.prosAndConsiderations": searchRegex },
        { "hotelInsights.smartComparison": searchRegex },
        { "hotelInsights.hotelFAQs": searchRegex },
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
// HELPER: CLEAN SEO KEYWORDS
// =====================================================

const cleanSeoKeywords = (items) => {
  if (typeof items === "string") {
    items = items.split(",");
  }

  if (!Array.isArray(items)) {
    return [];
  }

  return [
    ...new Set(
      items
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0)
    ),
  ];
};

// =====================================================
// HELPER: CLEAN HOTEL INSIGHTS
// =====================================================

const hotelInsightFields = [
  "whyChoose",
  "locationIntelligence",
  "bestFor",
  "roomSelection",
  "experiences",
  "bookingConfidence",
  "neighbourhoodGuide",
  "prosAndConsiderations",
  "smartComparison",
  "hotelFAQs",
];

const cleanHotelInsights = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const cleaned = {};

  hotelInsightFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(value, field)) {
      const fieldValue = value[field];

      cleaned[field] =
        fieldValue === null || fieldValue === undefined
          ? ""
          : String(fieldValue).trim();
    }
  });

  return cleaned;
};

// =====================================================
// HELPER: PREPARE CREATE/UPDATE DATA
// =====================================================

const prepareRoomData = (body, isUpdate = false) => {
  const roomData = { ...body };

  if (body.seoSlug !== undefined) {
    roomData.seoSlug = body.seoSlug
      ? String(body.seoSlug)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
      : "";
  } else if (!isUpdate) {
    roomData.seoSlug = "";
  }

  if (body.seoTitle !== undefined) {
    roomData.seoTitle = body.seoTitle
      ? String(body.seoTitle).trim()
      : "";
  }

  if (body.seoDescription !== undefined) {
    roomData.seoDescription = body.seoDescription
      ? String(body.seoDescription).trim()
      : "";
  }

  if (body.seoKeywords !== undefined) {
    roomData.seoKeywords = cleanSeoKeywords(body.seoKeywords);
  }

  if (body.hotelInsights !== undefined) {
    roomData.hotelInsights = cleanHotelInsights(body.hotelInsights);
  }

  return roomData;
};

// =====================================================
// CREATE ROOM
// POST /api/rooms
// =====================================================

const createRoom = async (req, res) => {
  try {
    const roomData = prepareRoomData(req.body);

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
    const roomData = prepareRoomData(req.body, true);

    // If only some Hotel Insights fields are sent,
    // update those fields without replacing the others.
    if (roomData.hotelInsights) {
      const existingRoom = await Room.findById(req.params.id);

      if (!existingRoom) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      const existingInsights =
        existingRoom.hotelInsights?.toObject?.() ||
        existingRoom.hotelInsights ||
        {};

      roomData.hotelInsights = {
        ...existingInsights,
        ...roomData.hotelInsights,
      };
    }

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
