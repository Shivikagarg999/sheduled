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

// ✅ Assign driver to order
const assignDriverToOrder = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;

    const order = await Order.findById(orderId);
    const driver = await Driver.findById(driverId);

    if (!order || !driver) {
      return res.status(404).json({ message: 'Order or Driver not found' });
    }

    order.driver = driver._id;
    await order.save();

    driver.assignedOrders.push(order._id);
    await driver.save();

    res.json({ message: 'Driver assigned to order successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerDriver,
  getAllDrivers,
  updateDriver,
  deleteDriver,
  assignDriverToOrder
};
