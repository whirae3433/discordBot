const express = require('express');
const router = express.Router();

const addCharacter = require('./addCharacter');
const getCharacters = require('./getCharacters');
const deleteCharacter = require('./deleteCharacter');
const updateCharacter = require('./updateCharacter');

router.post('/characters/:discordId', addCharacter);
router.get('/characters/:discordId', getCharacters);
router.patch('/characters/:discordId/:characterId', updateCharacter);
router.delete('/characters/:discordId/:characterId', deleteCharacter);

module.exports = router;
