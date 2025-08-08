const { getProfilesFromSheet } = require('./profileCache'); // ✅ 캐싱된 버전 사용

async function getProfilesByNickname(message, nickname) {
  if (!message.guild) return [];

  const serverId = String(message.guild.id);
  const normalizedInput = nickname.trim().toLowerCase();

  const dataRows = await getProfilesFromSheet(serverId); // ✅ 캐싱된 rows 사용

  const matchedDiscordIds = new Set(
    dataRows
      .filter((row) => {
        const nick = row[3]?.trim().toLowerCase() || '';
        const ign = row[4]?.trim().toLowerCase() || '';
        return nick.includes(normalizedInput) || ign.includes(normalizedInput);
      })
      .map((row) => row[0])
  );

  if (matchedDiscordIds.size === 0) return [];

  const profiles = dataRows
    .filter((row) => matchedDiscordIds.has(row[0]))
    .map((row) => {
      const [
        discordId,
        id,
        profileImg,
        nicknameValue,
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
        regDate,
      ] = row;

      return {
        discordId,
        id,
        profileImg,
        nicknameValue,
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
        regDate,
      };
    });

  return profiles;
}

module.exports = { getProfilesByNickname };
