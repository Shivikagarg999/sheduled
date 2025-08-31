const Driver = require("../../models/driver");
const Order = require('../../models/order');
const Wallet = require('../../models/wallet');

// Get available orders for driver
exports.getAvailableOrders = async (req, res) => {
  try {
    const driverId = req.driver?.id;
    if (!driverId) {
      return res.status(401).json({ message: "Invalid token: driver id missing" });
    }

    // Verify driver exists and is available
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Get available orders (not assigned to any driver)
    const availableOrders = await Order.find({
      driver: null,
      status: "pending",
    }).populate("user", "name phone");

    res.json({
      success: true,
      message: "Available orders fetched successfully",
      totalOrders: availableOrders.length,
      orders: availableOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept an order
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const driverId = req.driver.id;
    
    // Find the order and driver
    const order = await Order.findById(orderId);
    const driver = await Driver.findById(driverId);
    
    if (!order || !driver) {
      return res.status(404).json({ message: 'Order or driver not found' });
    }
    
    // Check if driver is available
    if (!driver.isAvailable) {
      return res.status(400).json({ message: 'Driver is not available' });
    }
    
    // Check if order is already assigned
    if (order.driver) {
      return res.status(400).json({ message: 'Order already assigned to another driver' });
    }
    
    // Update order status and assign driver
    order.driver = driverId;
    order.status = 'accepted';
    await order.save();
    
    // Add order to driver's orders array
    driver.orders.push(orderId);
    driver.isAvailable = false; // Mark driver as busy
    await driver.save();
    
    res.json({ message: 'Order accepted successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark order as delivered
exports.markAsDelivered = async (req, res) => {
  try {
    const { orderId } = req.body;
    const driverId = req.driver.id;
    
    // Find the order and driver
    const order = await Order.findById(orderId).populate('user');
    const driver = await Driver.findById(driverId);
    
    if (!order || !driver) {
      return res.status(404).json({ message: 'Order or driver not found' });
    }
    
    // Verify the driver is assigned to this order
    if (order.driver.toString() !== driverId) {
      return res.status(403).json({ message: 'Driver not assigned to this order' });
    }
    
    // Check if order is already delivered
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Order already marked as delivered' });
    }
    
    // Update order status
    order.status = 'delivered';
    order.updatedAt = new Date();
    await order.save();
    
    // Calculate 30% of the order amount
    const driverEarnings = (order.amount * 0.30).toFixed(2);
    
    // Add to driver's total earnings
    driver.earnings = (parseFloat(driver.earnings || 0) + parseFloat(driverEarnings)).toFixed(2);
    
    // Mark driver as available again
    driver.isAvailable = true;
    await driver.save();
    
    res.json({ 
      message: 'Order marked as delivered successfully', 
      earningsAdded: driverEarnings,
      totalEarnings: driver.earnings
    });
  } catch (error) {
    console.error("Error in markAsDelivered:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get driver's current orders
exports.getCurrentOrders = async (req, res) => {
  try {
    const driverId = req.driver.id;
    
    const orders = await Order.find({ 
      driver: driverId, 
      status: { $in: ['accepted', 'picked_up', 'in_transit'] } 
    }).populate('user', 'name phone');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const driverId = req.driver.id;

    let wallet = await Wallet.findOne({ driver: driverId })
      .populate("transactions.order");

    if (!wallet) {
      wallet = new Wallet({ driver: driverId });
      await wallet.save();
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate driver earnings
function calculateDriverEarnings(orderAmount) {
  // Implement your commission structure
  // Example: Driver gets 70% of order amount
  const commissionRate = 0.7;
  return orderAmount * commissionRate;
}

// Helper function to credit earnings to wallet
async function creditToWallet(driverId, amount, orderId) {
  try {
    // Find or create wallet for driver
    let wallet = await Wallet.findOne({ driver: driverId });
    
    if (!wallet) {
      wallet = new Wallet({
        driver: driverId,
        balance: 0
      });
    }
    
    // Add transaction and update balance
    wallet.transactions.push({
      amount,
      type: 'credit',
      description: `Earnings from order delivery`,
      order: orderId
    });
    
    wallet.balance += amount;
    await wallet.save();
    
    return wallet;
  } catch (error) {
    throw error;
  }
}