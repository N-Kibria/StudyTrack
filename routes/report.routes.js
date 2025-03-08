const express = require('express');
const router = express.Router();
const reportController = require('../controller/report.controller');


router.get('/report/weekly', reportController.getWeeklyReport);
router.get('/report/monthly', reportController.getMonthlyReport);
router.get('/report/:period/subject-distribution', reportController.getSubjectTimeDistribution);

module.exports = router;
