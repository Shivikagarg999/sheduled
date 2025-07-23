const Driver = require("../../models/driver");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.driverLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: driver._id, role: "driver" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver.id).select("-password");
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.status(200).json(driver);
  } catch (err) {
    console.error("Error fetching driver profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};