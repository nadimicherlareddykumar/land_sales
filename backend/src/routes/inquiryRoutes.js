const express = require("express");
const {
  getInquiries,
  createInquiry,
  updateInquiryStatus
} = require("../controllers/inquiryController");

const router = express.Router();

router.route("/").get(getInquiries).post(createInquiry);
router.patch("/:id/status", updateInquiryStatus);

module.exports = router;
