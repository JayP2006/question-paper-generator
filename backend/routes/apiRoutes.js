const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const apiController = require('../controllers/apiController');

if (!fs.existsSync('./uploads/papers')) fs.mkdirSync('./uploads/papers', { recursive: true });

const upload = multer({ dest: 'uploads/' });

router.post('/upload-syllabus', upload.single('file'), apiController.uploadSyllabus);

router.post('/upload-previous-papers', upload.array('files', 10), apiController.uploadPreviousPapers);

router.post('/generate-paper', apiController.generatePaper);
router.get('/download-paper/:id', apiController.downloadPaper);
router.get('/questions', apiController.getQuestions);

module.exports = router;