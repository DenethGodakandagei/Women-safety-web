const express = require('express');
const authController = require('../controllers/authController');
const sosController = require('../controllers/sosController');

const router = express.Router();

// All SOS routes require authentication
router.use(authController.protect);

router.post('/trigger', sosController.triggerSOS);

module.exports = router;
