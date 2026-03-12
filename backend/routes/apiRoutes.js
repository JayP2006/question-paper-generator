const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Ensure upload directories exist
if (!fs.existsSync('./uploads/papers')) fs.mkdirSync('./uploads/papers', { recursive: true });

const upload = multer({ dest: 'uploads/' });

router.post('/upload-syllabus', upload.single('file'), apiController.uploadSyllabus);

// CHANGED: Now accepts an array of files (up to 10 at once)
router.post('/upload-previous-papers', upload.array('files', 10), apiController.uploadPreviousPapers);

router.post('/generate-paper', apiController.generatePaper);
router.get('/download-paper/:id', apiController.downloadPaper);
router.get('/questions', apiController.getQuestions);

module.exports = router;