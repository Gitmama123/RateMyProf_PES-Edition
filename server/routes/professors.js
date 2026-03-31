const express = require("express");
const router = express.Router();
const Professor = require("../models/Professor");

// GET /professors – List all professors with pagination
// Supports query params: ?search=name&minRating=3&department=CSE&campus=EC&page=1&limit=12
router.get("/", async (req, res) => {
  try {
    const { search, minRating, department, campus, page = 1, limit = 12 } = req.query;
    const filter = {};

    // Pagination setup
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    // Search by name (case-insensitive partial match)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Filter by minimum average rating
    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Filter by department
    if (department) {
      filter.department = { $regex: department, $options: "i" };
    }
    
    // Filter by campus
    if (campus) {
      filter.campus = campus;
    }

    const professors = await Professor.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(l);

    const total = await Professor.countDocuments(filter);

    res.json({
      professors,
      total,
      pages: Math.ceil(total / l),
      currentPage: p
    });
  } catch (err) {
    console.error("Fetch professors error:", err);
    res.status(500).json({ error: "Failed to fetch professors" });
  }
});

// GET /professors/:id – Single professor by ID
router.get("/:id", async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) {
      return res.status(404).json({ error: "Professor not found" });
    }
    res.json(professor);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch professor" });
  }
});

// POST /professors – Create a new professor (admin use)
router.post("/", async (req, res) => {
  try {
    const { name, department, subjects } = req.body;

    if (!name || !department) {
      return res
        .status(400)
        .json({ error: "Name and department are required" });
    }

    const professor = new Professor({
      name: name.trim(),
      department: department.trim(),
      subjects: subjects || [],
    });

    await professor.save();
    res.status(201).json(professor);
  } catch (err) {
    res.status(500).json({ error: "Failed to create professor" });
  }
});

module.exports = router;
