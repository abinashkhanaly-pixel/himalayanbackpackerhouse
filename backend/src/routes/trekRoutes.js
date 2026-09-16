const express = require("express");

const {
  getTreks,
  getTrek,
  getTrekBySlug,
  createTrek,
  updateTrek,
  deleteTrek,
} = require("../controllers/trekController");

const router = express.Router();

router.get("/search", getTreks);
router.get("/", getTreks);
router.get("/slug/:slug", getTrekBySlug);
router.get("/:id", getTrek);
router.post("/", createTrek);
router.put("/:id", updateTrek);
router.delete("/:id", deleteTrek);

module.exports = router;