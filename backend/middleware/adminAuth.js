const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

exports.protectAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: 'Invalid token' });

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};