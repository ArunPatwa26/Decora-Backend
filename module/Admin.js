const mongoose = require("mongoose");


const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String, // Cloudinary URL or local path
      default: "",
    }
  },
  { timestamps: true } // Adds createdAt & updatedAt fields automatically
);

// Hash password before saving
module.exports = mongoose.model('Admin', adminSchema);