const express = require("express");
const router = express.Router();
const reviewController = require("../Controller/ReviewController");
const upload = require('../config/multer');

router.post("/create",upload.array("image"), reviewController.createReview);
router.get("/product/:productId", reviewController.getReviewsByProductId);
router.get("/:reviewId", reviewController.getReviewById);

module.exports = router;
