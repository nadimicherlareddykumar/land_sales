const express = require("express");
const { createVisit, getVisits, updateVisitStatus } = require("../controllers/visitController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public can create visit, Agent can view/mark as approved
router.route("/").post(createVisit).get(protect, getVisits);
router.route("/:id/status").patch(protect, updateVisitStatus);

module.exports = router;
