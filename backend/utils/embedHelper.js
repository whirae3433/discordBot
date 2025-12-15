const { EmbedBuilder } = require('discord.js');
const { getDaysAgo } = require('./dateHelper');

// 디스코드 아바타 URL 생성
async function getDiscordAvatarUrl(client, discordId) {
  try {
    const user =
      client.users.cache.get(discordId) ||
      (await client.users.fetch(discordId).catch(() => null));

    if (!user) {
      return 'https://cdn.discordapp.com/embed/avatars/0.png'; // 기본 디스코드 아바타
    }

    const url = user.displayAvatarURL({ extension: 'png', size: 256 });
    return url || 'https://cdn.discordapp.com/embed/avatars/0.png';
  } catch {
    return 'https://cdn.discordapp.com/embed/avatars/0.png';
  }
}

async function createProfileEmbed(profile, extraProfiles = []) {
  const client = global.botClient;
  const { text: daysAgoText, color } = getDaysAgo(profile.updatedAt);

  const avatarUrl = await getDiscordAvatarUrl(client, profile.discordId);

  const allProfiles = [profile, ...extraProfiles];

  const embeds = [];
  let currentEmbed = new EmbedBuilder()
    .setTitle(`${profile.ign}님의 프로필`)
    .setThumbnail(avatarUrl)
    .setColor(color)
    .setFooter({ text: `업데이트 : ${daysAgoText}` });

  let fieldCount = 0;

  for (const p of allProfiles) {
    const fields = [
      { name: `${p.jobName || '백수'}`, value: '', inline: true },
      {
        name: `${p.atk || '없음'} | ${p.bossDmg ? p.bossDmg + '%' : '0%'}`,
        value: '',
        inline: true,
      },
      { name: `${p.mapleWarrior || '없음'}`, value: '', inline: true },
      { name: `Lv: ${p.level || '1'}`, value: '', inline: true },
      { name: `Hp: ${p.hp || '???'}`, value: '', inline: true },
      { name: `Acc: ${p.acc || '???'}`, value: '', inline: true },
      { name: '', value: '━━━━━━━━━━━━━━━━━━━━━━━━━━', inline: false },
    ];

    if (fieldCount + fields.length > 25) {
      embeds.push(currentEmbed);
      currentEmbed = new EmbedBuilder().setColor(color);
      fieldCount = 0;
    }

    currentEmbed.addFields(...fields);
    fieldCount += fields.length;
  }

  // 마지막 embed push
  embeds.push(currentEmbed);

  return { embeds };
}
module.exports = { createProfileEmbed };
