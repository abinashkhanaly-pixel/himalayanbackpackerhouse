// ==========================================
// SEARCH FLIGHTS
// POST /api/flights/search
// ==========================================

const searchFlights = async (req, res) => {
  try {
    const {
      tripType,
      travellers,
      nationality,
      route,
      departureDate,
      returnDate,
      flights,
    } = req.body;

    console.log("=================================");
    console.log("FLIGHT SEARCH REQUEST RECEIVED");
    console.log(req.body);
    console.log("=================================");

    // ------------------------------------------
    // COMMON VALIDATION
    // ------------------------------------------

    if (!tripType) {
      return res.status(400).json({
        success: false,
        message: "Trip type is required",
      });
    }

    if (!nationality) {
      return res.status(400).json({
        success: false,
        message: "Nationality is required",
      });
    }

    if (!travellers || travellers.adults < 1) {
      return res.status(400).json({
        success: false,
        message: "At least 1 adult traveller is required",
      });
    }

    // ------------------------------------------
    // ONE WAY / ROUND TRIP
    // ------------------------------------------

    if (tripType !== "multiCity") {
      if (!route?.from || !route?.to) {
        return res.status(400).json({
          success: false,
          message: "Departure and destination are required",
        });
      }

      if (!departureDate) {
        return res.status(400).json({
          success: false,
          message: "Departure date is required",
        });
      }

      if (
        tripType === "roundTrip" &&
        !returnDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Return date is required",
        });
      }
    }

    // ------------------------------------------
    // MULTI-CITY
    // ------------------------------------------

    if (tripType === "multiCity") {
      if (!Array.isArray(flights) || flights.length < 2) {
        return res.status(400).json({
          success: false,
          message: "At least 2 flights are required",
        });
      }
    }

    // ------------------------------------------
    // TEMPORARY RESPONSE
    // Provider will be connected next
    // ------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Flight search request received",
      data: {
        tripType,
        nationality,
        travellers,
        route: route || null,
        departureDate: departureDate || null,
        returnDate: returnDate || null,
        flights: flights || null,
      },
    });
  } catch (error) {
    console.error("FLIGHT SEARCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process flight search",
      error: error.message,
    });
  }
};

module.exports = {
  searchFlights,
};