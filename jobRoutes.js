const express = require("express");
const router = express.Router();

const Job = require("../models/Job");
const auth = require("../middleware/auth");

// ✅ Create Job (Client only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can create jobs" });
    }

    const { title, description, budget, category } = req.body;

    if (!title || !description || budget === undefined) {
      return res.status(400).json({
        message: "title, description, budget are required",
      });
    }

    const job = await Job.create({
      title,
      description,
      budget,
      category,
      createdBy: req.user.id,
    });

    return res.status(201).json(job);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Get All Jobs (Public)
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("createdBy", "name email role")
      .populate("applications.freelancer", "name email role")
      .sort({ createdAt: -1 });

    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Get My Jobs (Client Dashboard)
router.get("/my-jobs", auth, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can view their jobs" });
    }

    const jobs = await Job.find({ createdBy: req.user.id })
      .populate("applications.freelancer", "name email role")
      .sort({ createdAt: -1 });

    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Get Jobs applied by logged-in Freelancer
router.get("/me/applied", auth, async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancers can view applied jobs" });
    }

    const jobs = await Job.find({ "applications.freelancer": req.user.id })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Get jobs assigned to logged-in Freelancer
router.get("/assigned/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancers can view assigned jobs" });
    }

    const jobs = await Job.find({ assignedTo: req.user.id })
      .populate("createdBy", "name email role")
      .sort({ updatedAt: -1 });

    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Apply to Job (Freelancer only)
router.post("/:id/apply", auth, async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancers can apply" });
    }

    const { coverLetter } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const alreadyApplied = job.applications.some(
      (app) => app.freelancer.toString() === req.user.id
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    job.applications.push({
      freelancer: req.user.id,
      coverLetter: coverLetter || "",
    });

    await job.save();

    return res.json({ message: "Applied successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Accept freelancer (Client only)
router.post("/:id/accept/:freelancerId", auth, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only client can accept freelancer" });
    }

    const { id, freelancerId } = req.params;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only owner client can accept
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your job" });
    }

    job.assignedTo = freelancerId;
    job.status = "assigned";
    await job.save();

    return res.json({ message: "Freelancer accepted successfully", job });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Mark job as completed (Freelancer only)
router.post("/:id/complete", auth, async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancer can complete job" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only assigned freelancer can complete
    if (!job.assignedTo || job.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "This job is not assigned to you" });
    }

    if (job.status !== "assigned") {
      return res
        .status(400)
        .json({ message: `Job is not in assigned state (current: ${job.status})` });
    }

    job.status = "completed";
    await job.save();

    return res.json({ message: "Job marked as completed ✅", job });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Get Single Job by ID (Public) — keep this last

// ✅ Delete Job (Client only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can delete jobs" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // ✅ Only owner client can delete
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your job" });
    }

    

    await Job.findByIdAndDelete(req.params.id);

    return res.json({ message: "Job deleted successfully ✅" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("applications.freelancer", "name email role");

    if (!job) return res.status(404).json({ message: "Job not found" });

    return res.json(job);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
