const express = require("express");

const {
  getRooms,
  getRoom,
  getRoomBySlug,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadImage,
} = require("../controllers/roomController");

const upload = require("../middleware/upload");

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

router.get("/", getRooms);

// =====================================================
// GET /api/rooms/slug/:slug
// GET SINGLE ROOM BY SEO SLUG
// IMPORTANT: Must come BEFORE /:id
// =====================================================

router.get("/slug/:slug", getRoomBySlug);

// =====================================================
// POST /api/rooms/upload-image
// UPLOAD + OPTIMIZE ROOM IMAGE
// =====================================================
//
// Accepts:
// JPG
// JPEG
// PNG
// WebP
//
// Frontend field name: image
// =====================================================

router.post(
  "/upload-image",
  upload.single("image"),
  uploadImage
);

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