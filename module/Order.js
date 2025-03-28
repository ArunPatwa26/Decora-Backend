const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    products: [
      {
        cartItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ],
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },
    total_price: { type: Number, required: true },
    payment_method: { type: String, enum: ["Cash On Delivery", "Online Payment"], required: true },
    payment_status: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
    transaction_id: { type: String, default: null },
    status: { type: String, default: "Processing" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
