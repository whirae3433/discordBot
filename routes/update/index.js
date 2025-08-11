const express = require('express');
const router = express.Router();

const addCharacter = require('./addCharacter');
const getCharacters = require('./getCharacters');
const deleteCharacter = require('./deleteCharacter');
const updateCharacter = require('./updateCharacter');

router.post('/characters/:serverId/:discordId', addCharacter);
router.get('/characters/:serverId/:discordId', getCharacters);
router.patch('/characters/:serverId/:discordId/:characterId', updateCharacter);
router.delete('/characters/:serverId/:discordId/:characterId', deleteCharacter);

module.exports = router;
