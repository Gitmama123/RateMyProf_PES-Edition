const express = require("express");
const router = express.Router();
const { scrapeProfessors } = require("../services/scraper");
const { verifyToken, isAdmin } = require("../middleware/auth");

// POST /api/scrape
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { url, department, campus } = req.body;
    if (!url || !department) {
      return res.status(400).json({ success: false, error: "Missing url or department" });
    }
    
    // Default campus if missing so older requests still work
    const result = await scrapeProfessors(url, department, campus || "EC Campus");
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
