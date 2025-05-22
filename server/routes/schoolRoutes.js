


const express = require('express');
const { createSchool, listSchools } = require('../controllers/schoolController');
const router = express.Router();

router.post('/addSchool', createSchool);
router.get('/schools', listSchools);

module.exports = router;
