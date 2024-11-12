const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



// Create a new study session
exports.addSession = async (req, res) => {
  try {
    const { subject_id, duration, date } = req.body;
    const userId = req.session.userId;

  

    if (!userId || !subject_id) {
      return res.status(400).send("User ID or Subject ID is missing.");
    }

    await prisma.session.create({
      data: {
        subject: {
          connect: { id: subject_id },
        },
        user: {
          connect: { id: userId },
        },
        duration: parseInt(duration),
        date: new Date(date),
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




// Get a single session by ID (for editing)
exports.getSessionById = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Ensure userId is provided to restrict data to the logged-in user
    if (!userId) {
      return res.status(401).send("Unauthorized. Please log in.");
    }

    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { subject: true, user: true }, // Include relationships for verification
    });

    // Verify if the session belongs to the logged-in user
    if (!session || session.userId !== userId) {
      return res.status(403).send("Access denied.");
    }

    res.json(session);
  } catch (error) {
    console.error("Error retrieving session:", error);
    res.status(500).send("Error retrieving session");
  }
};

// Update an existing study session
exports.updateSession = async (req, res) => {
  try {
    const { duration, date, notes } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized. Please log in.");
    }

    // Check if the session belongs to the user before updating
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session || session.userId !== userId) {
      return res.status(403).send("Access denied.");
    }

    await prisma.session.update({
      where: { id: req.params.id },
      data: {
        duration: parseInt(duration),
        date: new Date(date),
        notes: notes || '',
      },
    });
    res.redirect('/sessions');
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).send("Error updating session");
  }
};

// Delete a study session
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).send("Unauthorized. Please log in.");
    }

    // Check if the session belongs to the user before deleting
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session || session.userId !== userId) {
      return res.status(403).send("Access denied.");
    }

    await prisma.session.delete({
      where: { id: req.params.id },
    });
    res.redirect('/sessions');
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).send("Error deleting session");
  }
};
