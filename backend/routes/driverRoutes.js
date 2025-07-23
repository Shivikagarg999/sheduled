const express = require('express');
const router = express.Router();
const { driverLogin, getDriverProfile } = require('../controllers/driver/auth');

router.post('/login', driverLogin);
router.get('/profile',getDriverProfile )

module.exports = router;
