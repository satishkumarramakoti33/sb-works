const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 0 },
    category: { type: String, default: "General", trim: true },

    // Client who posted the job
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // NEW: Job status
    status: {
      type: String,
      enum: ["open", "assigned", "completed"],
      default: "open"
    },

    // NEW: Assigned freelancer
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // Freelancers who applied
    applications: [
      {
        freelancer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        coverLetter: { type: String, default: "", trim: true },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
