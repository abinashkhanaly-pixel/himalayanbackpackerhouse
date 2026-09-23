const express = require("express");

const {
  searchFlights,
} = require("../controllers/flightController");

const router = express.Router();

// ==========================================
// SEARCH FLIGHTS
// POST /api/flights/search
// ==========================================

router.post("/search", searchFlights);

module.exports = router;