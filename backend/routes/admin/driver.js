const express = require('express');
const router = express.Router();
const {
  registerDriver,
  getAllDrivers,
  updateDriver,
  deleteDriver,
  assignDriverToOrder
} = require('../../controllers/admin/driver/driver');

// 🚚 DRIVER CRUD
router.post('/create-driver', registerDriver);
router.get('/drivers', getAllDrivers);
router.put('/update-driver/:id', updateDriver);
router.delete('/delete-driver/:id', deleteDriver);
router.get('/', getAllDrivers)

// 📦 ASSIGN DRIVER TO ORDER
router.post('/assign-driver', assignDriverToOrder);

module.exports = router;