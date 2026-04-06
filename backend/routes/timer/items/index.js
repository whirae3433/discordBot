const express = require('express');
const router = express.Router();

router.use('/', require('./getItems'));
router.use('/replace', require('./replaceItems'));
router.use('/', require('./createItem'));
router.use('/', require('./updateItem'));
router.use('/', require('./startItem'));
router.use('/', require('./stopItem'));
router.use('/', require('./deleteItem'));
router.use('/auto-repeat', require('./autoRepeat'));

module.exports = router;