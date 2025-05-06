const mongoose = require("mongoose");
const Order = require("../module/Order");
const Product =require("../module/Product")
const User=require("../module/User")
const nodemailer = require("nodemailer");   

// Create a new order
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "arunpatwa2605@gmail.com", // Your email
        pass: "opuj rctr qfxl lyfc" // Your email app password
    }
});

// Function to send email with a detailed message
const sendOrderUpdateEmail = (email, orderId, status) => {
    const mailOptions = {
        from: "arunpatwa2605@gmail.com", 
        to: email,
        subject: `Order Update: Your Order #${orderId} is now ${status}`,
        text: `Dear Customer,

We hope you're doing well! 

We wanted to inform you that your order (Order ID: ${orderId}) has been updated to the status: **${status}**.

Order Details:
- Order ID: ${orderId}
- Current Status: ${status}
- Estimated Delivery: Within 3-5 business days (if applicable)

If you have any questions regarding your order, please feel free to contact our support team.

Thank you for shopping with us!  
Best regards,  
**Decora Support Team**  
Customer Care: support@decora.com  
Website: www.decora.com
        `,
        html: `
            <p>Dear Customer,</p>
            <p>We hope you're doing well!</p>
            <p>We wanted to inform you that your order <strong>(Order ID: ${orderId})</strong> has been updated to the status: <strong>${status}</strong>.</p>
            <h3>Order Details:</h3>
            <ul>
                <li><strong>Order ID:</strong> ${orderId}</li>
                <li><strong>Current Status:</strong> ${status}</li>
                <li><strong>Estimated Delivery:</strong> Within 3-5 business days (if applicable)</li>
            </ul>
            <p>If you have any questions regarding your order, please feel free to contact our support team.</p>
            <p>Thank you for shopping with us!</p>
            <p>Best regards,<br><strong>Decora Support Team</strong><br>
            Customer Care: <a href="mailto:support@decora.com">support@decora.com</a><br>
            Website: <a href="https://www.decora.com">www.decora.com</a></p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

exports.createOrder = async (req, res) => {
    try {
        console.log("Incoming Order Data:", JSON.stringify(req.body, null, 2));

        const { user_id, cart, address, total_price, payment_method, transaction_id } = req.body;

        // Validate required fields
        if (!user_id || !cart || !address || !total_price || !payment_method) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Ensure cart structure is valid
        if (!Array.isArray(cart) || cart.length === 0 || !cart.every(item => item.cartItem && item.quantity)) {
            return res.status(400).json({ message: "Invalid cart data. Each item must have cartItem (product ID) and quantity." });
        }

        // Validate payment method
        const validPaymentMethods = ["Online Payment", "Cash On Delivery"];
        if (!validPaymentMethods.includes(payment_method)) {
            return res.status(400).json({ message: "Invalid payment method." });
        }

        let payment_status = payment_method === "Online Payment" ? "Paid" : "Pending";

        const newOrder = new Order({
            user_id: String(user_id),
            products: cart.map(item => ({
                cartItem: String(item.cartItem),
                quantity: Number(item.quantity)
            })),
            address: {
                street: address.street || "",
                city: address.city || "",
                state: address.state || "",
                pincode: String(address.pincode) || ""
            },
            total_price: Number(total_price),
            payment_method,
            payment_status,
            transaction_id: payment_method === "Online Payment" ? (transaction_id || "TXN_MISSING") : null,
            status: "Processing",
        });

        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!", order: newOrder });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
};


// Get all orders for a user
exports.getUserOrders = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ message: "Invalid User ID." });
        }

        const orders = await Order.find({ user_id })
            .sort({ createdAt: -1 })
            .populate("products._id", "name price"); // Populating the product details

        res.status(200).json({ orders });

    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid Order ID." });
        }

        const order = await Order.findById(orderId).populate("products.cartItem", "name price");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);

    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid Order ID." });
        }

        const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        const order = await Order.findById(orderId).populate("user_id", "email");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;
        await order.save();

        // Send Email Notification
        sendOrderUpdateEmail(order.user_id.email, orderId, status);

        res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Error updating order status", error: error.message });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { transaction_id } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid Order ID." });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { payment_status: "Paid", transaction_id },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Payment status updated", order: updatedOrder });

    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).json({ message: "Error updating payment status", error: error.message });
    }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid Order ID." });
        }

        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });

    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Error deleting order", error: error.message });
    }
}
    // Get all orders (Admin access)
    exports.getAllOrders = async (req, res) => {
        try {
            const { 
                page = 1, 
                limit = 10,
                status,
                startDate,
                endDate,
                search,
                searchType = 'user' // Changed to lowercase for consistency
            } = req.query;
    
            // Build the query object
            const query = {};
    
            // Status filter
            if (status && status !== 'all') {
                query.status = status;
            }
    
            // Date range filter
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }
    
            // Search functionality
            if (search) {
                if (searchType === 'user') { // Changed to lowercase
                    const users = await User.find({
                        $or: [
                            { name: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } }
                        ]
                    }).select('_id');
                    
                    if (users.length > 0) {
                        query.user_id = { $in: users.map(u => u._id) };
                    } else {
                        // Return empty if no users match search
                        return res.status(200).json({
                            success: true,
                            orders: [],
                            totalOrders: 0,
                            page: Number(page),
                            totalPages: 0,
                        });
                    }
                } else if (searchType === 'product') { // Changed to lowercase
                    const products = await Product.find({
                        name: { $regex: search, $options: 'i' }
                    }).select('_id');
                    
                    if (products.length > 0) {
                        query['products.cartItem'] = { $in: products.map(p => p._id) };
                    } else {
                        // Return empty if no products match search
                        return res.status(200).json({
                            success: true,
                            orders: [],
                            totalOrders: 0,
                            page: Number(page),
                            totalPages: 0,
                        });
                    }
                } else if (searchType === 'order') {
                    query._id = search;
                }
            }
    
            // Get orders with pagination and filters
            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .populate({
                    path: 'user_id',
                    select: 'name email'
                })
                .populate({
                    path: 'products.cartItem',
                    select: 'name price imageUrl'
                });
    
            const totalOrders = await Order.countDocuments(query);
    
            res.status(200).json({
                success: true,
                orders,
                totalOrders,
                page: Number(page),
                totalPages: Math.ceil(totalOrders / limit),
            });
        } catch (error) {
            console.error("Error fetching all orders:", error);
            res.status(500).json({ 
                success: false,
                message: "Error fetching all orders", 
                error: error.message 
            });
        }
    };