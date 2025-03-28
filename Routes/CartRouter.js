const express = require("express");
const router = express.Router();
const cartController = require("../Controller/CartController");

// 🛒 Add or Update Cart
router.post("/add", cartController.addToCart);

// 🛒 Get Cart by User ID
router.get("/:userId", cartController.getCart);

// 🛒 Remove Item from Cart
router.delete("/remove", cartController.removeFromCart);

// 🛒 Clear Entire Cart
router.delete("/clear/:userId", cartController.clearCart);

module.exports = router;
