const express = require("express");
const router = express.Router();
const orderController = require("../Controller/OrderController");

router.get('/orders', orderController.getAllOrders); 
router.post("/create", orderController.createOrder);
router.get("/user/:user_id", orderController.getUserOrders);
router.get("/:orderId", orderController.getOrderById);
router.put("/:orderId/status", orderController.updateOrderStatus);
router.delete("/:orderId", orderController.deleteOrder);

module.exports = router;
