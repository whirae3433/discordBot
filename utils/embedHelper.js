const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { cropCenterSquare } = require('./imageHelper');
const { getDaysAgo } = require('./dateHelper');
const path = require('path'); // ← 이거 꼭 필요함

const BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3001';
const DEFAULT_IMAGE_PATH = path.resolve(__dirname, '../public/기본.jpeg');

const getProfileUrl = (serverId, discordId) =>
  `${BASE_URL}/${serverId}/profile/${discordId}`;

function createRegisterEmbed(serverId, discordId) {
  return new EmbedBuilder()
    .setTitle('무영봇 프로필 등록')
    .setDescription(
      `프로필을 등록하고 싶어?\n[📝 프로필 등록/수정](${getProfileUrl(
        serverId,
        discordId
      )})\n\u200B`
    )
    .setColor(0x00ae86);
}

async function createProfileEmbed(profile, serverId, extraProfiles = []) {
  const { text: daysAgoText, color } = getDaysAgo(profile.regDate);

  // URL 검증 → 잘못된 값이면 기본 이미지 사용
  const imageUrl =
    profile.profileImg && profile.profileImg.startsWith('http')
      ? profile.profileImg
      : DEFAULT_IMAGE_PATH;

  const imagePath = await cropCenterSquare(imageUrl);
  const attachment = new AttachmentBuilder(imagePath, {
    name: 'thumbnail.png',
  });

  const embed = new EmbedBuilder()
    .setTitle(`${profile.ign}님의 프로필`)
    // .setDescription(
    //   `[📝 프로필 확인/수정하기](${getProfileUrl(
    //     serverId,
    //     profile.discordId
    //   )})\n\u200B`
    // )
    // .setThumbnail('attachment://thumbnail.png')
    .setColor(color)
    .setFooter({ text: `업데이트 : ${daysAgoText}` });

  const allProfiles = [profile, ...extraProfiles];

  for (const p of allProfiles) {
    embed.addFields(
      { name: `Lv: ${p.level || '1'}`, value: '', inline: true },
      { name: `Hp: ${p.hp || '???'}`, value: '', inline: true },
      { name: `Acc: ${p.acc || '???'}`, value: '', inline: true },
      { name: `${p.job || '백수'}`, value: '', inline: true },
      {
        name: `${p.atk || '없음'} | ${p.bossDmg ? p.bossDmg + '%' : '0%'}`,
        value: '',
        inline: true,
      },
      {
        name: `${p.mapleWarrior || '없음'}`, //
        value: '',
        inline: true,
      },
      {
        name: '',
        value: '━━━━━━━━━━━━━━━━━━━━━━━━━━',
        inline: false,
      }
    );
  }

  // return { embeds: [embed], files: [attachment] };
  return { embeds: [embed] };
}

module.exports = { createRegisterEmbed, createProfileEmbed };
