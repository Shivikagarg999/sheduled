const Driver = require('../../models/driver');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// REGISTER
exports.registerDriver = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    const existing = await Driver.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone already registered' });

    const driver = await Driver.create({ name, phone, email, password });

    res.status(201).json({
      success: true,
      message: 'Driver registered',
      data: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        token: generateToken(driver._id)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// LOGIN
exports.loginDriver = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const driver = await Driver.findOne({ phone });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const isMatch = await driver.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        token: generateToken(driver._id)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
