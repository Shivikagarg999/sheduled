const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  
  pickupBuilding: { type: String, required: true },
  pickupApartment: { type: String, required: true },
  pickupEmirate: { type: String, required: true },
  pickupArea: { type: String, required: true },
  
  dropBuilding: { type: String, required: true },
  dropApartment: { type: String, required: true },
  dropEmirate: { type: String, required: true },
  dropArea: { type: String, required: true },
  
  pickupContact: { type: String, required: true },
  dropContact: { type: String, required: true },
  
  deliveryType: { 
    type: String, 
    enum: ['delivery', 'standard', 'express', 'next-day', 'return'], 
    required: true 
  },
  returnType: { 
    type: String, 
    enum: ['no-return', 'with-return'], 
    default: 'no-return' 
  },
  
  paymentMethod: { 
    type: String, 
    enum: ['card', 'cash'],
    required: true 
  },
  amount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  transactionId: { type: String },
  
  status: { 
    type: String, 
    default: 'pending' 
  },
  trackingNumber: { type: String, unique: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  notes: String,
  driver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver' 
  }
});

// Generate a tracking number if not present
orderSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;