const { sheets } = require('../../utils/googleSheets');
const channelConfigMap = require('../../config');

module.exports = async function getCharacters(req, res) {
  const { discordId, serverId } = req.params;
  const spreadsheetId = channelConfigMap[serverId]?.spreadsheetId;

  if (!spreadsheetId) {
    return res.status(400).json({ error: '유효하지 않은 serverId' });
  }

  try {
    const range = `길드원!A2:K`;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = result.data.values || [];

    const characters = rows
      .filter((row) => row[0] && row[0].toString().trim() === discordId.toString().trim())
      .map((row) => ({
        id: row[1],
        discordId: row[0],
        profileImg: row[2],
        nickname: row[3],
        ign: row[4],
        jobGroup: row[5],
        job: row[6],
        level: row[7],
        atk: row[8],
        bossDmg: row[9],
        regDate: row[10],
      }));

    res.json({ discordId, characters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '캐릭터 목록 불러오기 실패' });
  }
};
