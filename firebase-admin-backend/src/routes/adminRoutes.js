const express = require('express');
const router = express.Router();
const authenticateAdmin = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
// Protect all admin routes
router.use(authenticateAdmin);

router.post('/panels/:panelId/approve', adminController.approvePanel);
// ...other secured routes

module.exports = router;