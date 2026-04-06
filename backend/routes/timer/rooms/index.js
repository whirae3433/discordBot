const express = require('express');
const router = express.Router();

router.use('/', require('./createRoom'));
router.use('/', require('./listRooms'));
router.use('/', require('./getRoomMeta'));
router.use('/', require('./joinRoom'));
router.use('/', require('./getRoomDetail'));
router.use('/', require('./deleteRoom'));

module.exports = router;
