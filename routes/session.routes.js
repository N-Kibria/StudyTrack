const express = require('express');
const path = require('path');
const router = express.Router();
const sessionController = require('../controller/session.controller');

// Get all sessions
router.get('/session', sessionController.getSessions);

// Add a new session (Display form)
router.get('/session/add', (req, res) =>
    res.sendFile(path.join(__dirname, '../htmls/addSession.html'))
);

// Endpoint to fetch subjectId by subject name
// Endpoint to fetch subjectId by subject name and user ID
router.get('/subject-id', async (req, res) => {
    const { name } = req.query;
    const userId = req.session.userId; // Assuming userId is stored in the session after login

    if (!userId || !name) {
        return res.status(400).json({ error: "Missing userId or subject name" });
    }

    try {
        const subject = await prisma.subject.findUnique({
            where: {
                userId_name: { // Use the compound field notation
                    userId: userId,
                    name: name,
                },
            },
        });

        if (subject) {
            res.json({ subjectId: subject.id });
        } else {
            res.status(404).json({ error: 'Subject not found' });
        }
    } catch (error) {
        console.error("Error fetching subjectId by name:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



// Process the form to add a new session
router.post('/session/add', sessionController.addSession);

// Edit an existing session (Display form)
router.get('/session/edit/:id', (req, res) =>
    res.sendFile(path.join(__dirname, '../htmls/editSession.html'))
);

// Process the form to update an existing session
router.post('/session/edit/:id', sessionController.updateSession);

// Delete a session
router.post('/session/delete/:id', sessionController.deleteSession);

module.exports = router;
