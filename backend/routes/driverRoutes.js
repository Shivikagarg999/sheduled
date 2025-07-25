const express = require('express');
const router = express.Router();
const { driverLogin, getDriverProfile, getMyOrders } = require('../controllers/driver/auth');
const verifyDriverToken = require('../middleware/driverAuth')


router.post('/login', driverLogin);
router.get('/profile',verifyDriverToken,getDriverProfile )
router.get('/orders', verifyDriverToken, getMyOrders);

module.exports = router;
