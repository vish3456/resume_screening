const express = require('express');
const router = express.Router();
const ScreeningController = require('../Controllers/screeningController');
const { upload } = require('../utils/screeningMulter');

router.post('/screen', upload, ScreeningController.screenResumes);
router.get('/history', ScreeningController.getHistory);
router.get('/session/:id', ScreeningController.getSession);
router.get('/export/csv/:sessionId', ScreeningController.exportCSV);
router.get('/export/excel/:sessionId', ScreeningController.exportExcel);

module.exports = router;
