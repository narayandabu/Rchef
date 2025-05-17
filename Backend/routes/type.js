const express = require('express');
const { setType } = require('../controllers/typeController');

const router = express.Router();

router.post('/type', setType);

module.exports = router;
