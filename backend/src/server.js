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

const app = express();

app.use(cors());
app.use(express.json());

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
// HOME ROUTE
// ==========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Himalayan Backpacker House API is running",
  });
});

// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Backend running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "Server startup failed:",
      error.message
    );
  });