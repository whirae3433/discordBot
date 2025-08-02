const express = require('express');
const router = express.Router();

const addCharacter = require('./addCharacter');
const getCharacters = require('./getCharacters');
const deleteChararcter = require('./deleteChararcter');

router.post('/characters/:serverId/:discordId', addCharacter);
router.get('/characters/:serverId/:discordId', getCharacters);
router.delete(
  '/characters/:serverId/:discordId/:characterId',
  deleteChararcter
);

module.exports = router;
