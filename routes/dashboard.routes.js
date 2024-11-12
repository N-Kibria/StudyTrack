const express = require('express');
const path = require('path');
const router = express.Router();
const dashboardcontroller = require('../controller/dashboard.controller'); 





router.get('/dashboard', dashboardcontroller.getdashboard);

module.exports = router;