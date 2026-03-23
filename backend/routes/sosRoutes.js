const express = require('express');
const authController = require('../controllers/authController');
const sosController = require('../controllers/sosController');

const router = express.Router();

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
// Emergency contacts need to track without being logged in
router.get('/public/:sessionId', sosController.getPublicSOSSession);

// ─── PROTECTED ROUTES ─────────────────────────────────────────────────────────
router.use(authController.protect);

router.post('/trigger', sosController.triggerSOS);

// Protected route for the victim's device to push coordinates
router.patch('/update-location/:sessionId', sosController.updateSOSLocation);

module.exports = router;
