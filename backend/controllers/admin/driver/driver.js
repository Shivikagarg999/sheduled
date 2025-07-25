const Driver = require('../../../models/driver');
const Order = require('../../../models/order');

// 🟢 Create driver
const registerDriver = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Driver.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Driver already exists' });

    const driver = new Driver({ name, phone, password });
    await driver.save();

    res.status(201).json({
      message: 'Driver registered successfully',
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 🟡 Read all drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔵 Update driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const driver = await Driver.findByIdAndUpdate(id, updates, { new: true });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    res.json({ message: 'Driver updated', driver });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔴 Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


const assignDriverToOrder = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;

    // 1. Update the order with driver
    const order = await Order.findByIdAndUpdate(orderId, { driver: driverId }, { new: true });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // 2. Update the driver by adding order to their list
    await Driver.findByIdAndUpdate(driverId, { $addToSet: { orders: order._id } });

    res.status(200).json({ success: true, message: 'Driver assigned', data: order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports = {
  registerDriver,
  getAllDrivers,
  updateDriver,
  deleteDriver,
  assignDriverToOrder
};
