const express = require('express');
const path = require('path');
const router = express.Router();
const subjectController = require('../controller/subject.controller');

// Display subjects list
router.get('/subjects', subjectController.getSubjects);

// Add subject
router.get('/subjects/add', (req, res) => {
  res.sendFile(path.join(__dirname, '../htmls/addSubject.html'));
});
router.post('/subjects/add', subjectController.addSubject);

// Edit subject
router.get('/subjects/edit/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../htmls/editSubject.html'));
});
router.post('/subjects/edit/:id', subjectController.updateSubject);

// Delete subject
router.post('/subjects/delete/:id', subjectController.deleteSubject);

module.exports = router;
