const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getSubjects = async (req, res) => {
  try {
    const userId = req.session.userId; 

   
    if (!userId) {
      return res.status(401).send("Unauthorized. Please log in.");
    }


    const subjects = await prisma.subject.findMany({
      where: {
        userId: userId, 
      },
    });

    res.json(subjects); 
  } catch (error) {
    console.error('Error retrieving subjects:', error);
    res.status(500).send("Error retrieving subjects");
  }
};


exports.addSubject = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.session.userId; 

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subject = await prisma.subject.create({
      data: {
        name: name,
        userId: userId,
      },
    });
    res.redirect('/subjects'); 
   
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).json({ error: 'Error adding subject' });
  }
};


exports.updateSubject = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, subjectId } = req.body;
    console.log('userID:', userId);
    console.log('name:', name);
    console.log('subjectID:', subjectId);
    // Check that userId, new name, and subjectId are provided
    if (!userId || !name || !subjectId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if a subject with the new name already exists for this user
    const existingSubject = await prisma.subject.findFirst({
      where: {
        userId: userId,
        name: name,
        NOT: { id: subjectId }, // Exclude the current subject from the check
      },
    });

    if (existingSubject) {
      return res.status(400).json({ error: "A subject with this name already exists" });
    }

    // Update the subject's name
    const updatedSubject = await prisma.subject.update({
      where: {
        id: subjectId, // Use the subjectId as the unique identifier for updating
      },
      data: {
        name: name,
      },
    });

    res.redirect('/subjects');
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Error updating subject' });
  }
};



exports.deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;

    await prisma.subject.delete({
      where: { id: subjectId },
    });
    res.redirect('/subjects'); 
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Error deleting subject' });
  }
};
