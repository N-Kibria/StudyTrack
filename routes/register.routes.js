const express = require('express');
const path = require('path');
const router = express.Router();
const registerController = require('../controller/register.controller');

// Route for handling the POST request for registration
router.post('/', registerController.register);

// Route to serve the registration page on GET request
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../htmls/register.html'));
});

module.exports = router;
