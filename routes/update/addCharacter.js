const { sheets } = require('../../utils/googleSheets');
const { v4: uuidv4 } = require('uuid');
const channelConfigMap = require('../../config');

module.exports = async function addCharacter(req, res) {
  const { discordId, serverId } = req.params;
  const {
    profileImg,
    nickname,
    ign,
    accountGroup,
    order,
    level,
    hp,
    acc,
    job,
    atk,
    bossDmg,
    mapleWarrior,
  } = req.body;

  const spreadsheetId = channelConfigMap[serverId]?.spreadsheetId;
  if (!spreadsheetId) {
    return res.status(400).json({ error: '유효하지 않은 serverId' });
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const newId = uuidv4(); // UUID 생성

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: '길드원!A:O',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            discordId, // A
            newId, // B
            profileImg, // C
            nickname, // D
            ign, // E
            accountGroup, // F
            order, // G
            level, // H
            hp, // I
            acc, // J
            job, // K
            atk, // L
            bossDmg, // M
            mapleWarrior, // N
            today, // O
          ],
        ],
      },
    });

    res.json({ success: true, message: '캐릭터 추가 완료', id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '캐릭터 추가 실패' });
  }
};
