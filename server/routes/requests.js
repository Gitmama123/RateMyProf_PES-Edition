const express = require("express");
const router = express.Router();
const ProfessorRequest = require("../models/ProfessorRequest");
const { verifyToken, isAdmin } = require("../middleware/auth");

// POST /api/requests – Submit a new professor request
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, campus, department, courses, additionalComments } = req.body;

    if (!name || !campus || !department || !courses) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const request = new ProfessorRequest({
      name,
      campus,
      department,
      courses,
      priority,
      lastInteractionDate,
      additionalComments,
      submittedBy: req.user.username,
    });

    await request.save();
    res.status(201).json({ success: true, message: "Professor request submitted successfully." });
  } catch (err) {
    console.error("Error submitting request:", err);
    res.status(500).json({ error: "Failed to submit request" });
  }
});

const Professor = require("../models/Professor");

// GET /api/requests – List all requests (Admin Only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const requests = await ProfessorRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// PATCH /api/requests/:id – Update request status (Admin Only)
router.patch("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, updateData } = req.body;
    const { id } = req.params;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await ProfessorRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Apply admin edits if provided
    if (updateData) {
      if (updateData.name) request.name = updateData.name;
      if (updateData.department) request.department = updateData.department;
      if (updateData.campus) request.campus = updateData.campus;
      if (updateData.courses) request.courses = updateData.courses;
    }

    if (status === "Approved") {
      // 1. Create or Update Professor
      const subjects = request.courses ? request.courses.split(",").map(s => s.trim()) : [];
      const campusLabel = request.campus === "RR" ? "RR Campus" : "EC Campus";

      // Use upsert to avoid duplicates if name exists
      await Professor.updateOne(
        { name: request.name },
        {
          $set: {
            department: request.department,
            campus: campusLabel,
            subjects: subjects,
            designation: "Assistant Professor" // Default
          }
        },
        { upsert: true }
      );
    }

    request.status = status;
    await request.save();

    res.json({ success: true, message: `Request ${status.toLowerCase()} successfully.` });
  } catch (err) {
    console.error("Error updating request:", err);
    res.status(500).json({ error: "Failed to update request" });
  }
});

module.exports = router;
