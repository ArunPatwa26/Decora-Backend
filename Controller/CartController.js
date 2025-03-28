const Cart = require("../module/Cart");

// ✅ Create or Update Cart
exports.addToCart = async (req, res) => {
  const { userId, cartItem, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If no cart exists, create a new cart
      cart = new Cart({
        userId,
        products: [{ cartItem, quantity }],
      });
    } else {
      // If cart exists, check if product is already in cart
      const existingProductIndex = cart.products.findIndex(
        (p) => p.cartItem.toString() === cartItem
      );

      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        cart.products.push({ cartItem, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Cart by User ID
exports.getCart = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const cart = await Cart.findOne({ userId }).populate("products.cartItem");
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found", cartCount: 0 });
      }
  
      // Calculate total cart items
      const cartCount = cart.products.reduce((sum, item) => sum + item.quantity, 0);
  
      res.status(200).json({ success: true, cart, cartCount });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message, cartCount: 0 });
    }
  };
  

// ✅ Remove a Product from Cart
exports.removeFromCart = async (req, res) => {
    const { userId, itemId } = req.body; // Fix: Change 'cartItem' to 'itemId'
  
    try {
      let cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
  
      // Fix: Ensure cart.products exist before filtering
      if (!cart.products || cart.products.length === 0) {
        return res.status(400).json({ success: false, message: "No items in cart" });
      }
  
      // Fix: Use correct field to remove item
      cart.products = cart.products.filter((p) => p._id.toString() !== itemId);
  
      await cart.save();
      res.status(200).json({ success: true, message: "Item removed from cart", cart });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// ✅ Clear Cart
exports.clearCart = async (req, res) => {
  const { userId } = req.params;

  try {
    await Cart.findOneAndDelete({ userId });
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
