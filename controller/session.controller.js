const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');  // For managing file paths

exports.addSession = async (req, res) => {
  try {
    const { subject_id, duration, date } = req.body;
    const userId = req.session.userId;

    
    const singleImage = req.file ? req.file.filename : null;  
    const multipleImages = req.files ? req.files.map(file => file.filename) : []; 
    const audio = req.audioFile ? req.audioFile.filename : null; 

    if (!subject_id) {
      return res.status(400).send("Subject ID is missing.");
    }
    if (!userId) {
      return res.status(400).send("User ID is missing.");
    }

    const session = await prisma.session.create({
      data: {
        subject: {
          connect: { id: subject_id },
        },
        user: {
          connect: { id: userId },
        },
        duration: parseInt(duration),
        date: new Date(date),
        singleImage,
        multipleImages,
        audio,
      },
    });

    res.redirect('/sessions');
  } catch (error) {
    console.error("Error adding session:", error);
    res.status(500).send("Error adding session");
  }
};


exports.getSessions = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized. Please log in.");
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: userId, // Explicitly convert to ObjectId
      },
      include: { subject: true },
    });

    res.json(sessions);
  } catch (error) {
    console.error("Detailed Error:", error);
    res.status(500).send("Error retrieving sessions");
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Check if the user is authenticated
    if (!userId) {
      return res.status(401).send("Unauthorized. Please log in.");
    }

    res.sendFile(path.join(__dirname, '../htmls/addSession.html'));  // This line uses the path module
  } catch (error) {
    console.error("Error retrieving session:", error);
    res.status(500).send("Error retrieving session");
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized. Please log in.");
    }

    // Delete all notes related to the session
    await prisma.note.deleteMany({
      where: { sessionId: id },
    });

    // Now, delete the session
    await prisma.session.delete({
      where: { id: id },
    });

    res.status(200).send("Session deleted successfully");
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).send("Error deleting session");
  }
};
