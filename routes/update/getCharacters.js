const { sheets } = require('../../utils/googleSheets');
const channelConfigMap = require('../../config');

module.exports = async function getCharacters(req, res) {
  const { discordId, serverId } = req.params;
  const spreadsheetId = channelConfigMap[serverId]?.spreadsheetId;

  if (!spreadsheetId) {
    return res.status(400).json({ error: '유효하지 않은 serverId' });
  }

  try {
    const range = `길드원!A:M`;
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
        id: row[1], // B열
        discordId: row[0], // A열
        profileImg: row[2], // C열
        nickname: row[3], // D열
        ign: row[4], // E열
        accountGroup: row[5], // F열
        order: row[6], // G열
        jobGroup: row[7], // H열
        job: row[8], // I열
        level: row[9], // J열
        atk: row[10], // K열
        bossDmg: row[11], // L열
        regDate: row[12], // M열
      }));

    res.json({ discordId, characters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '캐릭터 목록 불러오기 실패' });
  }
};
