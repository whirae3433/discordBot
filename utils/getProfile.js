const { sheets } = require('./googleSheets');
const serverConfigs = require('../config/dataConfig');

async function getProfileByNickname(message, nickname) {
  if (!message.guild) return null;

  const guildId = String(message.guild.id);
  const serverConfig = serverConfigs[guildId];
  if (!serverConfig) return null;

  // 채널 권한 체크
  // if (!serverConfig.allowedChannels.includes(message.channel.id)) {
  //   return message.reply('❌ 이 채널에서는 명령어를 사용할 수 없습니다.');
  // }

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: serverConfig.spreadsheetId,
      range: '길드원!A:K',
    });

    const rows = res.data.values || [];
    const dataRows = rows.filter((row) => row.length > 0).slice(1); // 빈 행 제거, 헤더 제외

    // 닉네임 검색
    const profile = dataRows.find(
      (row) => row[2] && row[2].toLowerCase() === nickname.toLowerCase()
    );

    if (!profile) return null;

    const [
      discordId,
      profileImg,
      nicknameValue,
      ign,
      jobGroup,
      job,
      level,
      atk,
      bossDmg,
      skill,
      date,
    ] = profile;

    return {
      discordId,
      profileImg,
      nicknameValue,
      ign,
      jobGroup,
      job,
      level,
      atk,
      bossDmg,
      skill,
      date,
    };
  } catch (err) {
    console.error('프로필 조회 중 오류:', err.message);
    return null;
  }
}

module.exports = { getProfileByNickname };
