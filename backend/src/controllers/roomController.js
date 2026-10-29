
const Room = require("../models/Room");
const { uploadRoomImage } = require("../utils/imageUpload");

// =====================================================
// SEO SLUG HELPER
// =====================================================

const makeSlug = (text = "") => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// =====================================================
// CREATE UNIQUE SEO SLUG
// =====================================================

const getUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug || "room";
  let counter = 2;

  while (true) {
    const query = { seoSlug: slug };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingRoom = await Room.findOne(query);

    if (!existingRoom) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// =====================================================
// SEO TITLE
// =====================================================

const generateSeoTitle = (roomData) => {
  if (roomData.seoTitle && roomData.seoTitle.trim()) {
    return roomData.seoTitle.trim();
  }

  const name = roomData.name?.trim() || "Room";
  const destination = roomData.destination?.trim();

  if (destination) {
    return `${name} in ${destination} | Backpacker Gateways`;
  }

  return `${name} | Backpacker Gateways`;
};

// =====================================================
// SEO DESCRIPTION
// =====================================================

const generateSeoDescription = (roomData) => {
  if (
    roomData.seoDescription &&
    roomData.seoDescription.trim()
  ) {
    return roomData.seoDescription.trim();
  }

  const name = roomData.name?.trim() || "comfortable room";
  const destination = roomData.destination?.trim();

  if (destination) {
    return `Book ${name} in ${destination}. Check room details, amenities, availability and pricing with Backpacker Gateways.`;
  }

  return `Book ${name} with Backpacker Gateways. Check room details, amenities, availability and pricing.`;
};

// =====================================================
// GET ALL / SEARCH ROOMS
// GET /api/rooms
// GET /api/rooms/search
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

    // Destination / keyword search
    if (destination.trim()) {
      const searchRegex = new RegExp(destination.trim(), "i");

      roomFilter.$or = [
        { name: searchRegex },
        { destination: searchRegex },
        { description: searchRegex },
        { amenities: searchRegex },
        { beds: searchRegex },
        { seoTitle: searchRegex },
        { seoDescription: searchRegex },
        { seoSlug: searchRegex },
      ];
    }

    // Guest capacity
    if (guests) {
      const guestNumber = Number(guests);

      if (!Number.isNaN(guestNumber) && guestNumber > 0) {
        roomFilter.capacity = { $gte: guestNumber };
      }
    }

    // Only available rooms
    roomFilter.available = true;

    let rooms = await Room.find(roomFilter).sort({
      createdAt: -1,
    });

    // Date availability
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
            status: { $in: ["pending", "confirmed"] },
            checkIn: { $lt: endDate },
            checkOut: { $gt: startDate },
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

    return res.json({
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

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// SEARCH ROOMS
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

    return res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Get Room Error:", error);

    return res.status(500).json({
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

    const room = await Room.findOne({ seoSlug: slug });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Get Room By Slug Error:", error);

    return res.status(500).json({
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
    const roomData = { ...req.body };

    let baseSlug = roomData.seoSlug
      ? makeSlug(roomData.seoSlug)
      : "";

    if (!baseSlug) {
      baseSlug = [
        makeSlug(roomData.name),
        makeSlug(roomData.destination),
      ]
        .filter(Boolean)
        .join("-");
    }

    if (!baseSlug) {
      baseSlug = "room";
    }

    roomData.seoSlug = await getUniqueSlug(baseSlug);

    roomData.seoTitle = generateSeoTitle(roomData);
    roomData.seoDescription = generateSeoDescription(roomData);

    const room = await Room.create(roomData);

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    console.error("Create Room Error:", error);

    return res.status(400).json({
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
    // Find the existing room
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const roomData = { ...req.body };

    console.log(
      "HOTEL INSIGHTS RECEIVED:",
      JSON.stringify(req.body.hotelInsights, null, 2)
    );

    // Do not allow clients to overwrite MongoDB-managed fields
    delete roomData._id;
    delete roomData.__v;
    delete roomData.hotelInsights;

    // Update supplied top-level fields without removing
    // fields that were not included in the request.
    Object.assign(room, roomData);

    // Explicitly set each nested hotelInsights field
    if (
      req.body.hotelInsights &&
      typeof req.body.hotelInsights === "object" &&
      !Array.isArray(req.body.hotelInsights)
    ) {
      const insightFields = [
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

      for (const field of insightFields) {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body.hotelInsights,
            field
          )
        ) {
          room.set(
            `hotelInsights.${field}`,
            req.body.hotelInsights[field] ?? ""
          );
        }
      }
    }

    // Generate a unique SEO slug
    let baseSlug = room.seoSlug
      ? makeSlug(room.seoSlug)
      : "";

    if (!baseSlug) {
      baseSlug = [
        makeSlug(room.name),
        makeSlug(room.destination),
      ]
        .filter(Boolean)
        .join("-");
    }

    if (!baseSlug) {
      baseSlug = `room-${room._id}`;
    }

    room.seoSlug = await getUniqueSlug(baseSlug, room._id);

    // Generate SEO fields using the updated room data
    const mergedRoomData = room.toObject();

    room.seoTitle = generateSeoTitle(mergedRoomData);
    room.seoDescription = generateSeoDescription(mergedRoomData);

    // Save the document
    await room.save();

    console.log(
      "HOTEL INSIGHTS AFTER SAVE:",
      JSON.stringify(room.hotelInsights, null, 2)
    );

    // Read the saved document again from MongoDB
    const verifyRoom = await Room.findById(room._id).lean();

    console.log(
      "HOTEL INSIGHTS AFTER DB READ:",
      JSON.stringify(verifyRoom?.hotelInsights, null, 2)
    );

    return res.json({
      success: true,
      message: "Room updated successfully",
      data: verifyRoom,
    });
  } catch (error) {
    console.error("Update Room Error:", error);

    return res.status(400).json({
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

    return res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete Room Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPLOAD ROOM IMAGE
// POST /api/rooms/upload-image
// =====================================================

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    const result = await uploadRoomImage(req.file);

    return res.status(201).json({
      success: true,
      message: "Image uploaded and optimized successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Upload Room Image Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Image upload failed.",
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
  uploadImage,
};
