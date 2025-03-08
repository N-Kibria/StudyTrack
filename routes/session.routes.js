const express = require('express');
const path = require('path');
const router = express.Router();
const sessionController = require('../controller/session.controller');
const { uploadImage, uploadAudioFile } = require("../utils/multer");


router.post("/upload-single-image", uploadImage.single("uploadSingleImage"), (req, res) => {


  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded!" });
  }
  res.json({ filename: req.file.filename, message: "Single image uploaded successfully!" });
});

router.post("/upload-multiple-images", uploadImage.array("uploadMultipleImages", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded!" });
  }
  const filenames = req.files.map((file) => file.filename);
  res.json({ filenames, message: "Multiple images uploaded successfully!" });
});

router.post("/upload-audio", uploadAudioFile.single("uploadAudio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded!" });
  }
  res.json({ filename: req.file.filename, message: "Audio uploaded successfully!" });
});


 
router.delete('/session/:id', sessionController.deleteSession);
router.get('/session/:id', sessionController.getSessionById);


router.get('/session', sessionController.getSessions);


router.get('/sessions', (req, res) => {
    res.sendFile(path.join(__dirname, '../htmls/session.html'));
});

router.get('/session/add', (req, res) =>
    res.sendFile(path.join(__dirname, '../htmls/addSession.html'))
);


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


router.post('/session/add', sessionController.addSession);


module.exports = router;
