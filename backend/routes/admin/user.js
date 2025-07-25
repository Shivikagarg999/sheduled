const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/user/crud');
const adminAuth = require('../../middleware/adminAuth')

// Admin Routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser); 
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
