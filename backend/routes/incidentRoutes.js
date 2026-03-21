const express = require('express');
const incidentController = require('../controllers/incidentController');
const authController = require('../controllers/authController');

const router = express.Router();

// All incident routes require authentication
router.use(authController.protect);

// Public (authenticated) read
router.get('/', incidentController.getAllIncidents);
router.get('/my', incidentController.getMyIncidents);
router.get('/:id', incidentController.getIncident);

// Create
router.post('/', incidentController.createIncident);

// Upvote (confirm danger)
router.post('/:id/upvote', incidentController.upvoteIncident);

// Update & Delete (owner/admin)
router.patch('/:id', incidentController.updateIncident);
router.delete('/:id', incidentController.deleteIncident);

module.exports = router;
