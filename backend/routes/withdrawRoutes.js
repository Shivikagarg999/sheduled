const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdraw/withdraw');
const auth = require('../middleware/driverAuth');

// Driver routes
router.post('/request', auth, withdrawalController.requestWithdrawal);
router.get('/history', auth, withdrawalController.getWithdrawalHistory);
router.get('/info', auth, withdrawalController.getWithdrawalInfo);
router.get('/:id', auth, withdrawalController.getWithdrawalById);

// Admin routes
router.get('/admin/withdrawals', withdrawalController.getAllWithdrawals);
router.get('/admin/withdrawals/:id', withdrawalController.getWithdrawalDetails);
router.patch('/admin/withdrawals/:id/status', withdrawalController.updateWithdrawalStatus);

module.exports = router;