const { sheets } = require('../../utils/googleSheets');
const channelConfigMap = require('../../config');

module.exports = async function getCharacters(req, res) {
  const { discordId, serverId } = req.params;
  const spreadsheetId = channelConfigMap[serverId]?.spreadsheetId;

  if (!spreadsheetId) {
    return res.status(400).json({ error: '유효하지 않은 serverId' });
  }

  try {
    const range = `길드원!A:O`;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = result.data.values || [];

    const characters = rows
      .filter(
        (row) =>
          row[0] && row[0].toString().trim() === discordId.toString().trim()
      )
      .map((row) => ({
        discordId: row[0], // A
        id: row[1], // B
        profileImg: row[2], // C
        nicknameValue: row[3], // D
        ign: row[4], // E
        accountGroup: row[5], // F
        order: row[6], // G
        level: row[7], // H
        hp: row[8], // I
        acc: row[9], // J
        job: row[10], // K
        atk: row[11], // L
        bossDmg: row[12], // M
        mapleWarrior: row[13], // N
        regDate: row[14], // O
      }));

    res.json({ discordId, characters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '캐릭터 목록 불러오기 실패' });
  }
};
