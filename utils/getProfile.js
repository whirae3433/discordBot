const { sheets } = require('./googleSheets');
const serverConfigs = require('../config/dataConfig');

async function getProfileByNickname(message, nickname) {
  if (!message.guild) return null;

  const guildId = String(message.guild.id);
  const serverConfig = serverConfigs[guildId];
  if (!serverConfig) return null;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: serverConfig.spreadsheetId,
      range: '길드원!A:L',
    });

    const rows = res.data.values || [];
    const dataRows = rows.filter((row) => row.length > 0).slice(1); // 헤더 제외

    // 닉네임 검색 (D열 = index 3)
    const normalizedInput = nickname.trim().toLowerCase();
    const profile = dataRows.find(
      (row) => row[3] && row[3].trim().toLowerCase() === normalizedInput
    );

    if (!profile) return null;

    const [
      discordId, // A
      id, // B
      profileImg, // C
      nicknameValue, // D
      ign, // E
      jobGroup, // F
      job, // G
      level, // H
      atk, // I
      bossDmg, // J
      skill, // K
      regDate, // L
    ] = profile;

    return {
      discordId,
      id,
      profileImg,
      nicknameValue,
      ign,
      jobGroup,
      job,
      level,
      atk,
      bossDmg,
      skill,
      regDate,
    };
  } catch (err) {
    console.error('프로필 조회 중 오류:', err.message);
    return null;
  }
}

module.exports = { getProfileByNickname };
