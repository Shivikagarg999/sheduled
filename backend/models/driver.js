const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  email: String,
  password: String,

  //Orders
  orders: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  }],
  //Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  //Boolean Values
  isAvailable: {
    type: Boolean,
    default: false
  },
  isVerified:{
    type: Boolean,
    default: false
  },
  //Documents
  passport: String,
  governmentId:String,
  drivingLicense:String,
  Mulkiya:String,

  earnings: {
    type: String,
    default: 0
  },

  avatar: {
  type: String,
  default: ""
},

}, { timestamps: true });


driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

driverSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Driver', driverSchema);