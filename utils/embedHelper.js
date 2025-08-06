const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { cropCenterSquare } = require('./imageHelper');
const { getDaysAgo } = require('./dateHelper');

const BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3001';

const getProfileUrl = (serverId, discordId) =>
  `${BASE_URL}/${serverId}/profile/${discordId}`;

function createRegisterEmbed(serverId, discordId) {
  return new EmbedBuilder()
    .setTitle('무영봇 프로필 등록')
    .setDescription(
      `프로필을 등록하고 싶어?\n[📝 프로필 등록하기](${getProfileUrl(
        serverId,
        discordId
      )})\n\u200B`
    )
    .setColor(0x00ae86);
}

async function createProfileEmbed(profile, serverId, extraProfiles = []) {
  const { text: daysAgoText, color } = getDaysAgo(profile.regDate);

  const imagePath = await cropCenterSquare(profile.profileImg);
  const attachment = new AttachmentBuilder(imagePath, {
    name: 'thumbnail.png',
  });

  const embed = new EmbedBuilder()
    .setTitle(`${profile.ign}님의 프로필`)
    // 링크 + 공백 한 줄
    .setDescription(
      `[📝 프로필 확인/수정하기](${getProfileUrl(
        serverId,
        profile.discordId
      )})\n\u200B`
    )
    .setThumbnail('attachment://thumbnail.png')
    .setColor(color)
    .setFooter({ text: `업데이트 : ${daysAgoText}` });

  const allProfiles = [profile, ...extraProfiles];

  // 캐릭터 정보 필드
  for (const p of allProfiles) {
    embed.addFields(
      { name: `${p.level || '없음'}`, value: '\u200B', inline: true },
      { name: `${p.job || '없음'}`, value: '\u200B', inline: true },
      {
        name: `${p.atk || '없음'} | ${p.bossDmg ? p.bossDmg + '%' : '없음'}`,
        value: '\u200B',
        inline: true,
      }
    );
  }

  return { embeds: [embed], files: [attachment] };
}

module.exports = { createRegisterEmbed, createProfileEmbed };
