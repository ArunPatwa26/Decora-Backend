const Product = require('../module/Product');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// @desc   Add a new product
// @route  POST /api/products/add
const addProduct = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    console.log("Received files:", req.files); // Debugging

    const { name, description, category } = req.body;
    const price = req.body["price "] || req.body.price; // Fix incorrect field key

    if (!name || !price || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Name, price, and at least one image are required" });
    }

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(path.normalize(file.path), {
          folder: "products",
        });
        return result.secure_url;
      })
    );

    // Create a new product with multiple images
    const newProduct = new Product({
      name,
      price,
      description,
      category,
      imageUrl: imageUrls[0], // First image as main image
      images: imageUrls, // Array of all images
    });

    // Save to database
    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "✅ Product added successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      message: "❌ Failed to add product",
      error: error.message,
    });
  }
};

// @desc   Get all products
// @route  GET /api/products/all
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
};

// @desc   Get product by ID
// @route  GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve product', error: error.message });
  }
};

// @desc   Update a product
// @route  PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    let updatedFields = { name, price, description, category };

    // If an image is uploaded, update Cloudinary and image URL
    if (req.file) {
      console.log('Uploading new image to Cloudinary from path:', path.normalize(req.file.path));
      const result = await cloudinary.uploader.upload(path.normalize(req.file.path), {
        folder: 'products',
      }).catch((err) => {
        console.error('❌ Cloudinary Upload Error:', err.message);
        throw new Error('Cloudinary Upload Failed');
      });

      updatedFields.imageUrl = result.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: '✅ Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      message: '❌ Failed to update product',
      error: error.message,
    });
  }
};
const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category });

    if (!products.length) {
      return res.status(404).json({ message: 'No products found in this category' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      message: '❌ Failed to retrieve products by category',
      error: error.message,
    });
  }
};
  const searchProduct= async (req, res) => {
    try {
      console.log("Search Key:", req.params.key); // Debugging
      
      // Correct aggregate syntax
      const result = await Product.aggregate([
        {
          $search: {
            index: "default",
            text: {
              query: req.params.key,
              path: {
                wildcard: "*"
              }
            }
          }
        }
      ]);

    console.log("Search Result:", result); // Debugging

    // Check if result is undefined or empty
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get the Product", details: error.message });
  }
};
// @desc   Delete a product
// @route  DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    // Find and delete the product by its ID
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Optionally, you can also delete the images from Cloudinary if required:
    // if (deletedProduct.imageUrl) {
    //   const publicId = deletedProduct.imageUrl.split('/').pop().split('.')[0];
    //   await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
    // }

    res.status(200).json({
      message: '✅ Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      message: '❌ Failed to delete product',
      error: error.message,
    });
  }
};



module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  getProductsByCategory,
  searchProduct,
  deleteProduct
};
