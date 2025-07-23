const express = require('express');
const router = express.Router();
const { driverLogin, getDriverProfile } = require('../controllers/driver/auth');
const verifyDriverToken = require('../middleware/driverAuth')


router.post('/login', driverLogin);
router.get('/profile',verifyDriverToken,getDriverProfile )

module.exports = router;
