const express = require('express');
const router = express.Router();

router.use('/rooms', require('./rooms'));
router.use('/items', require('./items'));

module.exports = router;