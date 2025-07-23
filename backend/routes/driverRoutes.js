const express = require('express');
const router = express.Router();
const { driverLogin } = require('../controllers/driver/auth');

router.post('/login', driverLogin);

module.exports = router;
