const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // ✅ use 'Product' if your model is named 'Product.js'
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ assuming your user model is called 'User.js'
    required: true,
  },
  message: {
    type: String,
    required: false,
  },
  rating: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
