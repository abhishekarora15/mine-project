const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const { success, error } = require('./utils/responseFormatter');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify the allowed origins
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/food_delivery';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('🔗 A user connected:', socket.id);

  socket.on('join_order_room', (orderId) => {
    socket.join(orderId);
    console.log(`👤 User joined order room: ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected');
  });
});

// Inject Socket.io into req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  success(res, { status: 'OK', timestamp: new Date() });
});

// Root Route
app.get('/api', (req, res) => {
  success(res, { message: 'Welcome to Food Delivery API' });
});

// Seed Data Route (Temporary)
const seedData = require('./utils/seedData');
app.post('/api/seed', async (req, res) => {
  try {
    const result = await seedData();
    success(res, result);
  } catch (err) {
    error(res, err.message, 500);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  error(res, err.message || 'Something went wrong!', err.status || 500);
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
