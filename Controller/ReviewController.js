const Review = require("../module/Review");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");
const path = require("path");

// CREATE REVIEW
const createReview = async (req, res) => {
    try {
      const { productId, userId, rating, message } = req.body;
  
      // Validate required fields
      if (!productId || !userId || !rating) {
        return res.status(400).json({
          success: false,
          message: "Product ID, User ID and Rating are required"
        });
      }
  
      // Validate rating range
      const parsedRating = parseFloat(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a number between 1 and 5"
        });
      }
  
      // Validate message length
      if (!message || message.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Review message must be at least 10 characters"
        });
      }
  
      // Handle image upload if exists
      let imageUrl = "";
      if (req.files && req.files.length > 0) {
        const imageUrls = await Promise.all(
          req.files.map(async (file) => {
            const result = await cloudinary.uploader.upload(
              path.normalize(file.path),
              {
                folder: "ecommerce/reviews",
                transformation: { width: 800, height: 800, crop: "limit" },
              }
            );
            return result.secure_url;
          })
        );
        imageUrl = imageUrls[0]; // Use first image
      }
  
      const newReview = new Review({
        productId,
        userId,
        message,
        rating: parsedRating,
        image: imageUrl,
      });
  
      await newReview.save();
  
      const populatedReview = await Review.findById(newReview._id).populate(
        "userId",
        "name email avatar"
      );
  
      return res.status(201).json({
        success: true,
        message: "Review created successfully",
        review: populatedReview,
      });
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };

// GET REVIEWS BY PRODUCT ID
const getReviewsByProductId = async (req, res) => {
    const { productId } = req.params;
  
    try {
      console.log("👉 Received Product ID:", productId);
      
  
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID format" });
      }
  
      const reviews = await Review.find({
        productId: new mongoose.Types.ObjectId(productId),
      }).populate("userId", "name email");
  
      console.log("✅ Reviews Found:", reviews);
  
      res.status(200).json({ reviews });
    } catch (err) {
      console.error("❌ Error fetching reviews:", err.message);
      res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
    }
  };

// GET REVIEW BY REVIEW ID
const getReviewById = async (req, res) => {
  const { reviewId } = req.params;
  try {
    const review = await Review.findById(reviewId).populate("userId", "name email");
    if (!review) {
      return res.status(404).json({ message: "❌ Review not found" });
    }
    res.status(200).json({ review });
  } catch (err) {
    res.status(500).json({ message: "❌ Error retrieving review", error: err.message });
  }
};

module.exports = {
  createReview,
  getReviewsByProductId,
  getReviewById,
};
