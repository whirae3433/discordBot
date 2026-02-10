const express = require('express');
const router = express.Router();

const requireLogin = require('../../middleware/requireLogin');
const addCharacter = require('./addCharacter');
const getCharacters = require('./getCharacters');
const deleteCharacter = require('./deleteCharacter');
const updateCharacter = require('./updateCharacter');

// update 라우트는 전부 로그인 필요
router.use(requireLogin);

router.post('/characters/me', addCharacter);
router.get('/characters/me', getCharacters);
router.patch('/characters/me/:characterId', updateCharacter);
router.delete('/characters/me/:characterId', deleteCharacter);

module.exports = router;
