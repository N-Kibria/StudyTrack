const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch (error) {
    console.error('Error retrieving subjects:', error);
    res.status(500).send("Error retrieving subjects");
  }
};

// Add a new subject
exports.addSubject = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.session.userId; // Fetch userId from the session

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subject = await prisma.subject.create({
      data: {
        name: name,
        userId: userId,
      },
    });
    res.json({ success: true, redirectUrl: '/subjects' });
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).json({ error: 'Error adding subject' });
  }
};

// Update an existing subject
exports.updateSubject = async (req, res) => {
  try {
    const { name } = req.body;
    const subjectId = req.params.id;

    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: { name: name },
    });
    res.json({ success: true, redirectUrl: '/subjects' });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Error updating subject' });
  }
};

// Delete a subject
exports.deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;

    await prisma.subject.delete({
      where: { id: subjectId },
    });
    res.json({ success: true, redirectUrl: '/subjects' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Error deleting subject' });
  }
};
