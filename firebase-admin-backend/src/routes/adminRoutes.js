const express = require('express');
const adminController = require('../controllers/adminController');
const authenticateAdmin = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateAdmin);

router.post('/panels/:panelId/approve', adminController.approvePanel);
// Add other protected routes here
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
module.exports = router;