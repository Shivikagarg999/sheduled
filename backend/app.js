require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ✅ First: Handle CORS manually to be 100% safe (Render-safe)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // add prod domains if needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Respond to preflight
  }
  next();
});

// ✅ Then use cors() — trust but verify
app.use(cors({
  origin: ['http://localhost:3000', 'https://sheduled.vercel.app', 'https://www.sheduled.com'],
  credentials: true,
}));

app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ Connection error:', err));

// ✅ Test route
app.get('/', (req, res) => {
  res.send('App is running.');
});

// ✅ Routes
app.use('/api/orders', orderRoutes);
app.use('/api/pay', paymentRoutes);
app.use('/api/user', userRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});