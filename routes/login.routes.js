const express = require('express');
const path = require('path');
const router = express.Router();
const loginController = require('../controller/login.controller');

// Route for login
router.post('/', loginController.login);

// Serve the login page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../htmls/login.html'));
});

module.exports = router;
