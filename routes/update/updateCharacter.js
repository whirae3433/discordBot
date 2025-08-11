const { sheets } = require('../../utils/googleSheets');
const channelConfigMap = require('../../config');

const todayKST = () => {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
};

module.exports = async function updateCharacter(req, res) {
  const { serverId, discordId, characterId } = req.params;
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
    // clientLastModified, // 필요시 사용
  } = req.body;

  console.log('[PATCH] params=', { serverId, discordId, characterId }); // ✅
  console.log('[PATCH] body_keys=', Object.keys(req.body)); // ✅

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

    const targetIndex = rows.findIndex((row, idx) => {
      if (idx === 0) return false; // header
      const rowDiscordId = String(row[0] ?? '');
      const rowUuid = String(row[1] ?? '');
      return (
        rowDiscordId === String(discordId) && rowUuid === String(characterId)
      );
    });

    if (targetIndex === -1) {
      return res.status(404).json({ error: '대상 캐릭터를 찾을 수 없음' });
    }

    const old = rows[targetIndex];
    const safe = (arr, i, def = '') => (arr[i] !== undefined ? arr[i] : def);

    const nextRow = [];
    nextRow[0] = safe(old, 0); // 디코ID
    nextRow[1] = safe(old, 1); // UUID
    nextRow[2] = profileImg ?? safe(old, 2);
    nextRow[3] = nickname ?? safe(old, 3);
    nextRow[4] = ign ?? safe(old, 4);
    nextRow[5] = accountGroup ?? safe(old, 5);
    nextRow[6] = order ?? safe(old, 6);
    nextRow[7] = level ?? safe(old, 7);
    nextRow[8] = hp ?? safe(old, 8);
    nextRow[9] = acc ?? safe(old, 9);
    nextRow[10] = job ?? safe(old, 10);
    nextRow[11] = atk ?? safe(old, 11);
    nextRow[12] = bossDmg ?? safe(old, 12);
    nextRow[13] = mapleWarrior ?? safe(old, 13);
    nextRow[14] = todayKST(); // 수정일

    const rowNumber = targetIndex + 1; // 1-based
    const writeRange = `길드원!A${rowNumber}:O${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: writeRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [nextRow] },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('updateCharacter error:', err?.response?.data || err);
    return res.status(500).json({ error: '서버 오류', detail: String(err) });
  }
};
