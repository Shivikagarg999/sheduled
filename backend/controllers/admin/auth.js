const Admin = require('../../models/admin');
const generateToken = require('../../utils/generateToken');

// ✅ Admin Login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
