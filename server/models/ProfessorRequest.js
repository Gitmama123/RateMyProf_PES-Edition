const mongoose = require("mongoose");

const professorRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Professor name is required"],
      trim: true,
    },
    campus: {
      type: String,
      required: [true, "Campus is required"],
      enum: ["RR", "EC"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    courses: {
      type: String,
      required: [true, "Subjects/courses handled are required"],
      trim: true,
    },
    additionalComments: {
      type: String,
      trim: true,
    },
    submittedBy: {
      type: String, // Username/SRN
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProfessorRequest", professorRequestSchema);
