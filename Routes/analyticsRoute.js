const express = require('express');
const router = express.Router();
const analyticsController = require('../Controller/analyticsController');

// Remove authenticateAdmin middleware
router.get('/', analyticsController.getAnalytics);

module.exports = router;
