const { sheets } = require('../../utils/googleSheets');
const channelConfigMap = require('../../config');

module.exports = async function deleteCharacter(req, res) {
  const { serverId, discordId, characterId } = req.params;

  const spreadsheetId = channelConfigMap[serverId]?.spreadsheetId;
  if (!spreadsheetId) {
    return res.status(400).json({ error: '유효하지 않은 serverId' });
  }

  try {
    // 1. 시트 ID 얻기 (길드원 시트의 내부 ID 조회)
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const targetSheet = meta.data.sheets.find(
      (sheet) => sheet.properties.title === '길드원'
    );
    if (!targetSheet) {
      return res.status(404).json({ error: '길드원 시트를 찾을 수 없음' });
    }

    const sheetId = targetSheet.properties.sheetId;

    // 2. 전체 데이터 가져오기
    const range = `길드원!A:M`;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = result.data.values || [];

    // 3. 해당 캐릭터 위치 찾기
    const targetIndex = rows.findIndex(
      (row) =>
        row[0]?.toString().trim() === discordId.toString().trim() &&
        row[1]?.toString().trim() === characterId.toString().trim()
    );

    if (targetIndex === -1) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없음' });
    }

    // 4. 실제 데이터 행 번호 (헤더 포함이므로 +1 필요)
    const rowNumber = targetIndex;

    // 5. 행 삭제 (헤더 제외 → 데이터는 1행부터 시작하므로 startIndex = rowNumber)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowNumber,     // inclusive
                endIndex: rowNumber + 1,   // exclusive
              },
            },
          },
        ],
      },
    });

    res.json({ success: true, message: '캐릭터 삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '캐릭터 삭제 실패' });
  }
};
