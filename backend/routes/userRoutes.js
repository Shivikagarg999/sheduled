const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      googleId,
      gender,
      address
    } = req.body;

    const isGoogleRegister = !!email; // Google registration uses email
    const isDirectRegister = !!phone; // Direct registration uses phone

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Google Registration: email required
    if (isGoogleRegister && !googleId) {
      return res.status(400).json({ message: "Google ID is required for Google registration" });
    }

    // Direct Registration: phone required
    if (!isGoogleRegister && !isDirectRegister) {
      return res.status(400).json({ message: "Phone number is required for direct registration" });
    }

    // Check for existing users by email or phone
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    });

    if (existingUser) {
      if (isGoogleRegister && !existingUser.googleId) {
        return res.status(400).json({ message: "Already registered via phone. Please login with phone." });
      }

      if (isDirectRegister && existingUser.googleId) {
        return res.status(400).json({ message: "Already registered via Google. Please login with Google." });
      }

      return res.status(400).json({ message: "User already exists." });
    }

    const userData = {
      name,
      email: email || null,
      phone: phone || null,
      googleId: googleId || null,
      address
    };

    const user = await User.create(userData);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authMethod: isGoogleRegister ? 'google' : 'direct'
      }
    });

  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports=router