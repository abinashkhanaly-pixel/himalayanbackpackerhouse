
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gearRoutes = require("./routes/gearRoutes");
const communityRoutes = require("./routes/communityRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const trekRoutes = require("./routes/trekRoutes");

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// Log every API request
app.use((req, res, next) => {
  console.log(
    `[API REQUEST] ${req.method} ${req.originalUrl}`
  );
  next();
});

// ==========================================
// ROOM API
// ==========================================

app.use("/api/rooms", roomRoutes);

// ==========================================
// BOOKING API
// ==========================================

app.use("/api/bookings", bookingRoutes);

// ==========================================
// ADMIN API
// ==========================================

app.use("/api/admin", adminRoutes);

// ==========================================
// GEAR API
// ==========================================

app.use("/api/gears", gearRoutes);

// ==========================================
// COMMUNITY API
// ==========================================

app.use("/api/community", communityRoutes);

// ==========================================
// INQUIRY API
// ==========================================

app.use("/api/inquiries", inquiryRoutes);

// ==========================================
// TREKKING API
// ==========================================

app.use("/api/treks", trekRoutes);

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Himalayan Backpacker House API is running",
  });
});

// ==========================================
// 404 API ROUTE
// ==========================================

app.use((req, res) => {
  console.log(
    `[404] Route not found: ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
});

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("=================================");
      console.log(
        `Backend running on http://localhost:${PORT}`
      );
      console.log("MongoDB connected");
      console.log("Trekking API: /api/treks");
      console.log("=================================");
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
  });

