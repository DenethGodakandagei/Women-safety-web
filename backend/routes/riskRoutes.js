const express = require('express');
const riskController = require('../controllers/riskController');

const router = express.Router();

// Public route for risk prediction (can be protected if desired)
router.get('/predict', riskController.predictRisk);
router.post('/analyze-route', riskController.analyzeRoute);


module.exports = router;
