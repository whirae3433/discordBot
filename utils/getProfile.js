const { sheets } = require('./googleSheets');
const serverConfigs = require('../config/dataConfig');

async function getProfilesByNickname(message, nickname) {
  if (!message.guild) return [];

  const guildId = String(message.guild.id);
  const serverConfig = serverConfigs[guildId];
  if (!serverConfig) return [];

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: serverConfig.spreadsheetId,
      range: '길드원!A:K',
    });

    const rows = res.data.values || [];
    const dataRows = rows.filter((row) => row.length > 0).slice(1); // 헤더 제외

    // 1. 닉네임으로 첫 번째 캐릭터 찾아 Discord ID 추출
    const normalizedInput = nickname.trim().toLowerCase();
    const matchedRow = dataRows.find(
      (row) => row[3] && row[3].trim().toLowerCase() === normalizedInput
    );

    if (!matchedRow) return [];

    const targetDiscordId = matchedRow[0]; // A열 = Discord ID

    // 2. 같은 Discord ID 가진 모든 캐릭터 반환
    const profiles = dataRows
      .filter((row) => row[0] === targetDiscordId)
      .map((row) => {
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
          regDate, // K
        ] = row;

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
          regDate,
        };
      });

    return profiles;
  } catch (err) {
    console.error('프로필 조회 중 오류:', err.message);
    return [];
  }
}

module.exports = { getProfilesByNickname };
