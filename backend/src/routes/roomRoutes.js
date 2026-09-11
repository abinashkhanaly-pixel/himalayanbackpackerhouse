const express = require("express");

const {
  getRooms,
  getRoom,
  getRoomBySlug,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

const router = express.Router();

// =====================================================
// GET /api/rooms/search
// SEARCH ROOMS
// =====================================================

router.get("/search", getRooms);

// =====================================================
// GET /api/rooms
// GET ALL / FILTER ROOMS
// =====================================================
//
// Example:
// GET /api/rooms
//
// With filters:
// GET /api/rooms?destination=Kathmandu&guests=2
// =====================================================

router.get("/", getRooms);

// =====================================================
// GET /api/rooms/slug/:slug
// GET SINGLE ROOM BY SEO SLUG
// =====================================================
//
// Example:
// GET /api/rooms/slug/deluxe-mountain-view-room-kathmandu
//
// IMPORTANT:
// This route must come BEFORE /:id
// =====================================================

router.get("/slug/:slug", getRoomBySlug);

// =====================================================
// GET /api/rooms/:id
// GET SINGLE ROOM BY MONGODB ID
// =====================================================

router.get("/:id", getRoom);

// =====================================================
// POST /api/rooms
// CREATE NEW ROOM
// =====================================================

router.post("/", createRoom);

// =====================================================
// PUT /api/rooms/:id
// UPDATE EXISTING ROOM
// =====================================================

router.put("/:id", updateRoom);

// =====================================================
// DELETE /api/rooms/:id
// DELETE EXISTING ROOM
// =====================================================

router.delete("/:id", deleteRoom);

module.exports = router;

