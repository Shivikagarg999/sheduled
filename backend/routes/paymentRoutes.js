// routes/payment.js
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/payment', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aed',
          product_data: {
            name: `Delivery Order: ${order.trackingNumber}`,
          },
          unit_amount: Math.round(order.amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://yourdomain.com/payment-success?orderId=${orderId}`,
      cancel_url: `https://yourdomain.com/payment-cancel`,
    });

    res.json({ redirectUrl: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
});

module.exports = router;