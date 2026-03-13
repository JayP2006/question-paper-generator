const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

const apiController = require('../controllers/apiController');
const auth = require('../middleware/authMiddleware');

if (!fs.existsSync('./uploads/papers'))
  fs.mkdirSync('./uploads/papers', { recursive: true });

const upload = multer({ dest: 'uploads/' });

router.post('/upload-syllabus', upload.single('file'), apiController.uploadSyllabus);

router.post('/upload-previous-papers', auth, upload.array('files', 10), apiController.uploadPreviousPapers);

router.post('/generate-paper', auth, apiController.generatePaper);

router.get('/download-paper/:id', auth, apiController.downloadPaper);

router.get('/questions', auth, apiController.getQuestions);

/* NEW ROUTES */

router.get('/papers', auth, apiController.getGeneratedPapers);

router.delete('/papers/:id', auth, apiController.deletePaper);
router.get('/analytics', auth, apiController.getAnalytics);
router.get('/dashboard/stats', auth, apiController.getDashboardStats);
router.put('/auth/update-profile', auth, apiController.updateProfile);
module.exports = router;