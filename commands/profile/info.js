require('dotenv').config();
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getProfileByNickname } = require('../../utils/getProfile');
const { cropCenterSquare } = require('../../utils/imageHelper');
const parseArgs = require('../../utils/parseArgs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

module.exports = {
  name: '!정보',
  description: '닉네임으로 프로필 정보를 조회합니다.',
  execute: async (message, args) => {
    const serverId = message.guild.id;

    // ---- 1. 닉네임 없는 경우 ----
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setTitle('무영봇 프로필 등록')
        .setDescription(
          `아직 프로필 정보가 없어요.\n[📝 프로필 등록하기](${BASE_URL}/${serverId}/profile/${message.author.id})\n\u200B`
        )
        .setColor(0x00ae86);

      return message.channel.send({ embeds: [embed] });
    }

    // ---- 2. 닉네임 파싱 ----
    const parsed = parseArgs(args, { requireName: true });
    if (parsed.error) {
      return message.reply(parsed.error);
    }

    const { name: nickname } = parsed;

    // ---- 3. 프로필 조회 ----
    const profile = await getProfileByNickname(message, nickname);

    // 프로필 없는 경우도 Embed로 안내
    if (!profile) {
      const embed = new EmbedBuilder()
        .setTitle(`"${nickname}" 프로필 없음`)
        .setDescription(
          `등록된 프로필이 없습니다.\n[📝 프로필 등록하기](${BASE_URL}/${serverId}/profile/${message.author.id})\n\u200B`
        )
        .setColor(0xff0000);

      return message.channel.send({ embeds: [embed] });
    }

    // ---- 4. 등록일 → 며칠 전 계산 ----
    let daysAgoText = '미기록';
    let color = 0x00ae86; // 기본 초록

    if (profile.regDate) {
      const currentYear = new Date().getFullYear();
      const registeredDate = new Date(`${currentYear}-${profile.regDate}`);
      const diffTime = Date.now() - registeredDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        daysAgoText = 'now';
      } else {
        daysAgoText = `${diffDays}일 전`;
      }

      if (diffDays >= 30) {
        color = 0xff0000; // 오래된 프로필 빨간색
        daysAgoText = `⚠️ ${daysAgoText}`;
      }
    }

    // ---- 5. 이미지 크롭 & 첨부 ----
    const imagePath = await cropCenterSquare(profile.profileImg);
    const attachment = new AttachmentBuilder(imagePath);

    // ---- 6. 프로필 Embed 생성 ----
    const embed = new EmbedBuilder()
      .setTitle(`${profile.nicknameValue}님의 프로필`)
      .setDescription(
        `[📝 프로필 확인/수정하기](${BASE_URL}/${serverId}/profile/${profile.discordId})\n\u200B`
      )
      .addFields(
        { name: '레벨', value: profile.level || '없음', inline: true },
        { name: '직업', value: profile.job || '없음', inline: true },
        {
          name: '스공 | 보공',
          value: `${profile.atk || '없음'} | ${
            profile.bossDmg ? profile.bossDmg + '%' : '없음'
          }`,
          inline: true,
        }
      )
      .setThumbnail('attachment://thumbnail.png')
      .setColor(color)
      .setFooter({ text: `업데이트 : ${daysAgoText || '미기록'}` });

    return message.channel.send({ embeds: [embed], files: [attachment] });
  },
};
