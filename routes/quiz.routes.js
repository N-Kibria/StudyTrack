const express = require("express");
const { handleFileUpload } = require("../controller/quiz.controller");
const router = express.Router();

// Route for file upload and quiz generation
router.post("/upload", handleFileUpload);

module.exports = router;
