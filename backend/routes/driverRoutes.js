const express = require('express');
const router = express.Router();
const { driverLogin, getDriverProfile, editDriverProfile, getMyOrders , signupDriver, toggleAvailability} = require('../controllers/driver/auth');
const verifyDriverToken = require('../middleware/driverAuth');
const upload = require('../middleware/upload');
const driverController = require('../controllers/driver/orders');

router.post('/signup', upload.fields([
  { name: 'passport', maxCount: 1 },
  { name: 'governmentId', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'Mulkiya', maxCount: 1 }
]), signupDriver);
router.post('/login', driverLogin);
router.get('/profile',verifyDriverToken,getDriverProfile );
router.put('/profile', verifyDriverToken, upload.single('avatar'), editDriverProfile);
router.get('/orders', verifyDriverToken, getMyOrders);
router.patch('/toggle-availability', verifyDriverToken, toggleAvailability);
router.get('/orders/available',verifyDriverToken, driverController.getAvailableOrders);
router.post('/orders/accept',verifyDriverToken, driverController.acceptOrder);
router.post('/orders/deliver',verifyDriverToken, driverController.markAsDelivered);
router.get('/orders/current', driverController.getCurrentOrders);
router.get('/wallet', driverController.getWallet);

module.exports = router;