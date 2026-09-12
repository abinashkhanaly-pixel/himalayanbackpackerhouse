const Inquiry = require("../models/Inquiry");

const createInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      countryCode,
      phone,
      service,
      checkIn,
      checkOut,
      guests,
      message,
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone are required.",
      });
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      countryCode,
      phone,
      service,
      checkIn,
      checkOut,
      guests,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your inquiry has been received successfully.",
      inquiry,
    });
  } catch (error) {
    console.error("Create inquiry error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit inquiry.",
    });
  }
};

module.exports = {
  createInquiry,
};