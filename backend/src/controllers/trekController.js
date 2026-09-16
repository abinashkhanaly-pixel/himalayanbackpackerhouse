
const Trek = require("../models/Trek");

// ==========================================
// GET ALL TREKS
// GET /api/treks
// GET /api/treks?published=true
// GET /api/treks?featured=true
// GET /api/treks?search=everest
// ==========================================

const getTreks = async (req, res) => {
  try {
    const { published, featured, search } = req.query;

    const filter = {};

    if (published !== undefined) {
      filter.published = published === "true";
    }

    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    if (search && search.trim()) {
      const searchText = search.trim();

      filter.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { shortName: { $regex: searchText, $options: "i" } },
        { difficulty: { $regex: searchText, $options: "i" } },
        { country: { $regex: searchText, $options: "i" } },
        {
          "seo.primaryKeyword": {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    const treks = await Trek.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: treks.length,
      data: treks,
    });
  } catch (error) {
    console.error("GET TREKS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch treks",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE TREK BY ID
// GET /api/treks/:id
// ==========================================

const getTrek = async (req, res) => {
  try {
    const trek = await Trek.findById(req.params.id);

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    res.status(200).json({
      success: true,
      data: trek,
    });
  } catch (error) {
    console.error("GET TREK ERROR:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid trek ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch trek",
      error: error.message,
    });
  }
};

// ==========================================
// GET TREK BY SLUG
// GET /api/treks/slug/everest-base-camp-trek
// ==========================================

const getTrekBySlug = async (req, res) => {
  try {
    const trek = await Trek.findOne({
      slug: req.params.slug.toLowerCase(),
    });

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    res.status(200).json({
      success: true,
      data: trek,
    });
  } catch (error) {
    console.error("GET TREK BY SLUG ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trek",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE TREK
// POST /api/treks
// ==========================================

const createTrek = async (req, res) => {
  try {
    console.log("=================================");
    console.log("CREATE TREK REQUEST RECEIVED");
    console.log("REQUEST BODY:");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=================================");

    const trekData = {
      ...req.body,
    };

    // Clean slug
    if (trekData.slug) {
      trekData.slug = trekData.slug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
    }

    // Check duplicate slug
    if (trekData.slug) {
      const existingTrek = await Trek.findOne({
        slug: trekData.slug,
      });

      if (existingTrek) {
        return res.status(409).json({
          success: false,
          message: "A trek with this slug already exists",
        });
      }
    }

    // Create trek
    const trek = await Trek.create(trekData);

    console.log("TREK CREATED SUCCESSFULLY:", trek._id);

    res.status(201).json({
      success: true,
      message: "Trek created successfully",
      data: trek,
    });
  } catch (error) {
    console.error("=================================");
    console.error("CREATE TREK ERROR:");
    console.error(error);
    console.error("ERROR NAME:", error.name);
    console.error("ERROR MESSAGE:", error.message);
    console.error("=================================");

    // Duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A trek with this slug already exists",
        error: error.keyValue || null,
      });
    }

    // Mongoose validation
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).map(
        (field) => ({
          field,
          message: error.errors[field].message,
          value: error.errors[field].value,
          kind: error.errors[field].kind,
        })
      );

      console.error("VALIDATION ERRORS:");
      console.error(JSON.stringify(validationErrors, null, 2));

      return res.status(400).json({
        success: false,
        message: "Trek validation failed",
        errors: validationErrors,
      });
    }

    // Other errors
    res.status(500).json({
      success: false,
      message: "Failed to create trek",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE TREK
// PUT /api/treks/:id
// ==========================================

const updateTrek = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    // Clean slug
    if (updateData.slug) {
      updateData.slug = updateData.slug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
    }

    // Check duplicate slug
    if (updateData.slug) {
      const duplicateTrek = await Trek.findOne({
        slug: updateData.slug,
        _id: { $ne: req.params.id },
      });

      if (duplicateTrek) {
        return res.status(409).json({
          success: false,
          message: "Another trek already uses this slug",
        });
      }
    }

    const trek = await Trek.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trek updated successfully",
      data: trek,
    });
  } catch (error) {
    console.error("=================================");
    console.error("UPDATE TREK ERROR:");
    console.error(error);
    console.error("=================================");

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid trek ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A trek with this slug already exists",
      });
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).map(
        (field) => ({
          field,
          message: error.errors[field].message,
          value: error.errors[field].value,
          kind: error.errors[field].kind,
        })
      );

      return res.status(400).json({
        success: false,
        message: "Trek validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update trek",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE TREK
// DELETE /api/treks/:id
// ==========================================

const deleteTrek = async (req, res) => {
  try {
    const trek = await Trek.findByIdAndDelete(req.params.id);

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trek deleted successfully",
      data: trek,
    });
  } catch (error) {
    console.error("DELETE TREK ERROR:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid trek ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete trek",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getTreks,
  getTrek,
  getTrekBySlug,
  createTrek,
  updateTrek,
  deleteTrek,
};

