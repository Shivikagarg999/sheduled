
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  email: String,
  password: String,
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
  role: { type: String, default: 'driver' }
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