require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes=require('./routes/paymentRoutes');
const userRoutes= require('./routes/userRoutes')

const app = express();

app.options('*', cors());

app.use(cors({
  origin: ['http://localhost:3000', 'https://sheduled.vercel.app', 'https://www.sheduled.com'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ Connection error:', err));

app.get('/', (req, res) => {
    res.send('App is running.');
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/pay', paymentRoutes );
app.use('/api/user', userRoutes );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});