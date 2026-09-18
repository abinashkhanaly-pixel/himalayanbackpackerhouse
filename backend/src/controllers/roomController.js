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
    const query = {
      seoSlug: slug,
    };

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

  const name =
    roomData.name?.trim() || "comfortable room";

  const destination =
    roomData.destination?.trim();

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

    // ---------------------------------------------
    // DESTINATION / KEYWORD SEARCH
    // ---------------------------------------------

    if (destination.trim()) {
      const searchRegex = new RegExp(
        destination.trim(),
        "i"
      );

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

    // ---------------------------------------------
    // GUEST CAPACITY
    // ---------------------------------------------

    if (guests) {
      const guestNumber = Number(guests);

      if (
        !Number.isNaN(guestNumber) &&
        guestNumber > 0
      ) {
        roomFilter.capacity = {
          $gte: guestNumber,
        };
      }
    }

    // Only available rooms
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
              .map((booking) =>
                booking.room.toString()
              )
          );

          rooms = rooms.filter(
            (room) =>
              !bookedRoomIds.has(
                room._id.toString()
              )
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
    console.error(
      "Get Room By Slug Error:",
      error
    );

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
    const roomData = {
      ...req.body,
    };

    // ---------------------------------------------
    // SEO SLUG
    // ---------------------------------------------

    let baseSlug = roomData.seoSlug
      ? makeSlug(roomData.seoSlug)
      : "";

    if (!baseSlug) {
      const nameSlug = makeSlug(roomData.name);

      const destinationSlug = makeSlug(
        roomData.destination
      );

      baseSlug = [
        nameSlug,
        destinationSlug,
      ]
        .filter(Boolean)
        .join("-");
    }

    if (!baseSlug) {
      baseSlug = "room";
    }

    roomData.seoSlug =
      await getUniqueSlug(baseSlug);

    // ---------------------------------------------
    // SEO TITLE
    // ---------------------------------------------

    roomData.seoTitle =
      generateSeoTitle(roomData);

    // ---------------------------------------------
    // SEO DESCRIPTION
    // ---------------------------------------------

    roomData.seoDescription =
      generateSeoDescription(roomData);

    // ---------------------------------------------
    // CREATE
    // ---------------------------------------------

    const room = await Room.create(roomData);

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    console.error(
      "Create Room Error:",
      error
    );

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
    // GET EXISTING ROOM
    // ---------------------------------------------

    const existingRoom =
      await Room.findById(req.params.id);

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const roomData = {
      ...req.body,
    };

    // ---------------------------------------------
    // SEO SLUG
    // ---------------------------------------------

    let baseSlug = roomData.seoSlug
      ? makeSlug(roomData.seoSlug)
      : makeSlug(existingRoom.seoSlug);

    if (!baseSlug) {
      const nameSlug = makeSlug(
        roomData.name ||
          existingRoom.name
      );

      const destinationSlug = makeSlug(
        roomData.destination ||
          existingRoom.destination
      );

      baseSlug = [
        nameSlug,
        destinationSlug,
      ]
        .filter(Boolean)
        .join("-");
    }

    if (!baseSlug) {
      baseSlug = `room-${existingRoom._id}`;
    }

    roomData.seoSlug =
      await getUniqueSlug(
        baseSlug,
        existingRoom._id
      );

    // ---------------------------------------------
    // MERGED ROOM DATA
    // ---------------------------------------------

    const mergedRoomData = {
      ...existingRoom.toObject(),
      ...roomData,
    };

    // ---------------------------------------------
    // SEO TITLE
    // ---------------------------------------------

    roomData.seoTitle =
      generateSeoTitle(
        mergedRoomData
      );

    // ---------------------------------------------
    // SEO DESCRIPTION
    // ---------------------------------------------

    roomData.seoDescription =
      generateSeoDescription(
        mergedRoomData
      );

    // ---------------------------------------------
    // UPDATE
    // ---------------------------------------------

    const room =
      await Room.findByIdAndUpdate(
        req.params.id,
        roomData,
        {
          new: true,
          runValidators: true,
        }
      );

    res.json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    console.error(
      "Update Room Error:",
      error
    );

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
    const room =
      await Room.findByIdAndDelete(
        req.params.id
      );

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
    console.error(
      "Delete Room Error:",
      error
    );

    res.status(500).json({
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

    const result =
      await uploadRoomImage(req.file);

    res.status(201).json({
      success: true,
      message:
        "Image uploaded and optimized successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Upload Room Image Error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Image upload failed.",
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