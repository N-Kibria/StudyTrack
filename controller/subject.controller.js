const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all subjects with total study time
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
      include: {
        sessions: true, // Include sessions to calculate total study time
      },
    });

    const subjectsWithStudyTime = subjects.map(subject => {
      const totalStudyTime = subject.sessions.reduce((sum, session) => sum + session.duration, 0);
      return {
        ...subject,
        totalStudyTime: (totalStudyTime / 60).toFixed(2), // Convert minutes to hours
      };
    });

    res.json(subjectsWithStudyTime);
  } catch (error) {
    console.error('Error retrieving subjects:', error);
    res.status(500).send("Error retrieving subjects");
  }
};

// Delete a subject and associated sessions
exports.deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;

    

  
    await prisma.session.deleteMany({
      where: { subjectId },
    });

    // Delete the subject
    await prisma.subject.delete({
      where: { id: subjectId },
    });

    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error); // Log the error
    res.status(500).json({ error: 'Failed to delete subject' });
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

    if (!userId || !name || !subjectId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingSubject = await prisma.subject.findFirst({
      where: {
        userId: userId,
        name: name,
        NOT: { id: subjectId },
      },
    });

    if (existingSubject) {
      return res.status(400).json({ error: "A subject with this name already exists" });
    }


    const updatedSubject = await prisma.subject.update({
      where: {
        id: subjectId,
      },
      data: {
        name: name,
      },
    });

    res.status(200).json(updatedSubject); 
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Error updating subject' });
  }
};



