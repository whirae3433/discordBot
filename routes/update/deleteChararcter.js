const { sheets } = require('../../utils/googleSheets');
const channelConfigMap = require('../../config');

module.exports = async function deleteCharacter(req, res) {
  const { serverId, discordId, characterId } = req.params;

  const spreadsheetId = channelConfigMap[serverId]?.spreadsheetId;
  if (!spreadsheetId) {
    return res.status(400).json({ error: '유효하지 않은 serverId' });
  }

  try {
    const range = `길드원!A2:L`;
    const result = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = result.data.values || [];

    // UUID 비교 (row[1]이 ID 컬럼)
    const targetIndex = rows.findIndex(
      (row) =>
        row[0] && row[0].toString().trim() === discordId.toString().trim() &&
        row[1] && row[1].toString().trim() === characterId.toString().trim()
    );

    if (targetIndex === -1) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없음' });
    }

    // 시트에서 지울 행 번호 (헤더가 1행, 데이터는 2행부터 시작하니 +2)
    const rowNumber = targetIndex + 2;

    // 해당 행 clear
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `길드원!A${rowNumber}:K${rowNumber}`,
    });

    res.json({ success: true, message: '캐릭터 삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '캐릭터 삭제 실패' });
  }
};
