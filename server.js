const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/mongodb');
const productRouter = require('./Routes/ProductRouter');
const cartRouter=require('./Routes/CartRouter')
const userRouter=require('./Routes/UserRouter')
const adminRouter=require('./Routes/AdminRouter')
const orderRouter=require('./Routes/OrderRouter')
const analyticsRouter=require("./Routes/analyticsRoute")
const cloudinary = require('./config/cloudinary');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Check Cloudinary connection
cloudinary.api.ping()
  .then(() => console.log('✅ Connected to Cloudinary'))
  .catch(err => console.error('❌ Cloudinary Error:', err.message));

// Routes
app.use('/api/products', productRouter);
app.use('/api/order', orderRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/cart', cartRouter);
app.use('/api/analytics', analyticsRouter);


// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API');
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
