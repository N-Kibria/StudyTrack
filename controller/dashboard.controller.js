const express = require('express');
const path = require('path');
const router = express.Router();

const getdashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../htmls/dashboard.html'));
};

module.exports = { getdashboard };
