const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  getProductsByCategory,
  searchProduct,
  deleteProduct
} = require('../Controller/ProductController');

// POST Route to add a product
router.get('/all', getAllProducts);
router.post("/add-product", upload.array("files", 10), addProduct);
router.delete('/delete/:id', deleteProduct);

// GET Route to fetch all products

// GET Route to fetch a product by ID
router.get('/:id', getProductById);
router.put('/:id', upload.single('files'), updateProduct);
router.get('/category/:category', getProductsByCategory);
router.get('/search/:key',searchProduct)


module.exports = router;
