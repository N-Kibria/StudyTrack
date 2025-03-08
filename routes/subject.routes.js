const express = require('express');
const path = require('path');
const subjectController = require('../controller/subject.controller');
const router = express.Router();

// Display subjects list
router.get('/subject', subjectController.getSubjects);
router.get('/subjects', (req, res) => {
  res.sendFile(path.join(__dirname, '../htmls/subjects.html'));
});
router.get('/subjects/add', (req, res) => {
  res.sendFile(path.join(__dirname, '../htmls/addSubject.html'));
});
// Add subject

router.get('/subject/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (subject) {
      res.json(subject);
    } else {
      res.status(404).json({ error: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subject details' });
  }
});

router.post('/subjects/add', subjectController.addSubject);

// Edit subject
router.get('/subjects/edit/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../htmls/editSubject.html'));
});
router.put('/subject/update', async (req, res) => {
  const { subjectId, name } = req.body;

  if (!subjectId || !name) {
    return res.status(400).json({ error: 'Subject ID and name are required' });
  }

  try {
    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: { name },
    });
    res.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Error updating subject' });
  }
});


// Delete subject
router.delete('/subjects/:id', subjectController.deleteSubject)

module.exports = router;


