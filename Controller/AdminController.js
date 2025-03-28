const Admin = require("../module/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary"); // ✅ Correct Import
const upload = require("../config/multer"); // Multer Config

module.exports = {
  // ✅ CREATE ADMIN (REGISTER)
  createAdmin: async (req, res) => {
    try {
      // Handle image upload with multer
      upload.single("profilePicture")(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: "File upload failed", error: err.message });
        }

        // Check if the email already exists
        const existingAdmin = await Admin.findOne({ email: req.body.email });
        if (existingAdmin) {
          return res.status(400).json({ message: "❌ Email already in use" });
        }

        let cloudinaryImageUrl = "";
        if (req.file) {
          try {
            const cloudinaryUpload = await cloudinary.uploader.upload(req.file.path, {
              folder: "admins/images",
              public_id: req.file.filename, // Optional: Set public ID
            });
            cloudinaryImageUrl = cloudinaryUpload.secure_url; // ✅ Get Cloudinary URL
          } catch (uploadError) {
            return res.status(500).json({ message: "❌ Cloudinary upload failed", error: uploadError.message });
          }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create new admin
        const newAdmin = new Admin({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
          address: req.body.address,
          profilePicture: cloudinaryImageUrl,
        });

        // Save admin to database
        await newAdmin.save();

        res.status(201).json({ message: "✅ Admin Created Successfully", admin: newAdmin });
      });
    } catch (error) {
      res.status(500).json({ message: "❌ Registration failed", error: error.message });
    }
  },

  // ✅ LOGIN ADMIN
  loginAdmin: async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.body.email });

      if (!admin) {
        return res.status(401).json({ message: "❌ Invalid email or password" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(req.body.password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "❌ Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Send admin data without password
      const { password, __v, createdAt, updatedAt, ...adminData } = admin._doc;
      res.status(200).json({ message: "✅ Login successful", admin: adminData, token });
    } catch (error) {
      res.status(500).json({ message: "❌ Login failed", error: error.message });
    }
  },

  // ✅ UPDATE ADMIN DETAILS
  updateAdmin: async (req, res) => {
    try {
      const adminId = req.params.id;
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: "❌ Admin not found" });
      }
      
      // Handle image upload with multer
      upload.single("profilePicture")(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: "File upload failed", error: err.message });
        }
        
        let cloudinaryImageUrl = admin.profilePicture; // Keep old image if not updating
        if (req.file) {
          try {
            const cloudinaryUpload = await cloudinary.uploader.upload(req.file.path, {
              folder: "admins/images",
              public_id: req.file.filename,
            });
            cloudinaryImageUrl = cloudinaryUpload.secure_url;
          } catch (uploadError) {
            return res.status(500).json({ message: "❌ Cloudinary upload failed", error: uploadError.message });
          }
        }
        
        // Hash new password if provided
        let newPassword = admin.password;
        if (req.body.password) {
          newPassword = await bcrypt.hash(req.body.password, 10);
        }

        // Update admin details
        const updatedAdmin = await Admin.findByIdAndUpdate(
          adminId,
          {
            name: req.body.name || admin.name,
            email: req.body.email || admin.email,
            password: newPassword,
            address: req.body.address || admin.address,
            profilePicture: cloudinaryImageUrl,
          },
          { new: true } // Return updated admin
        );

        res.status(200).json({ message: "✅ Admin updated successfully", admin: updatedAdmin });
      });
    } catch (error) {
      res.status(500).json({ message: "❌ Update failed", error: error.message });
    }
  },
};
