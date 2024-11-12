const express = require('express');
const path = require('path');
const router = express.Router();
const sessionController = require('../controller/session.controller');

// Route to fetch session data as JSON (API route)
router.get('/session', sessionController.getSessions);

// Route to serve the session HTML page
router.get('/sessions', (req, res) => {
    res.sendFile(path.join(__dirname, '../htmls/session.html'));
});

// Route to serve the page for adding a new session
router.get('/session/add', (req, res) =>
    res.sendFile(path.join(__dirname, '../htmls/addSession.html'))
);

// Route to get a subject ID by name for the logged-in user (API route)
router.get('/subject-id', async (req, res) => {
    const { name } = req.query;
    const userId = req.session.userId;

    if (!userId || !name) {
        return res.status(400).json({ error: "Missing userId or subject name" });
    }

    try {
        const subject = await prisma.subject.findUnique({
            where: {
                userId_name: {
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

// Route to add a new session (API route)
router.post('/session/add', sessionController.addSession);

// Route to serve the page for editing a session
router.get('/session/edit/:id', (req, res) =>
    res.sendFile(path.join(__dirname, '../htmls/editSession.html'))
);

// Route to update a session (API route)
router.post('/session/edit/:id', sessionController.updateSession);

// Route to delete a session (API route)
router.post('/session/delete/:id', sessionController.deleteSession);

module.exports = router;
