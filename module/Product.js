const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  images: {
    type: [String], // Array of image URLs
    default: [], // Default is an empty array
  },
});

module.exports = mongoose.model('Products', productSchema);
