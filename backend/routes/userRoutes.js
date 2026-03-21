const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);

// Emergency Contacts
router.get('/getEmergencyContacts', userController.getEmergencyContacts);
router.post('/addEmergencyContact', userController.addEmergencyContact);
router.delete('/deleteEmergencyContact/:id', userController.deleteEmergencyContact);

module.exports = router;
