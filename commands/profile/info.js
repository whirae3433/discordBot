const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getProfileByNickname } = require('../../utils/getProfile');
const { cropCenterSquare } = require('../../utils/imageHelper');
const parseArgs = require('../../utils/parseArgs');

module.exports = {
  name: '!정보',
  description: '닉네임으로 프로필 정보를 조회합니다.',
  execute: async (message, args) => {
    const parsed = parseArgs(args, { requireName: true });
    if (parsed.error) {
      return message.reply(parsed.error);
    }

    const { name: nickname } = parsed;

    const profile = await getProfileByNickname(message, nickname);
    if (!profile) {
      return message.reply(`❌ "${nickname}" 프로필을 찾을 수 없습니다.`);
    }

    // ---- 등록일 → 며칠 전 계산 ----
    let daysAgoText = '미기록';
    let color = 0x00ae86; // 기본 색상 (초록)

    if (profile.regDate) {
      const currentYear = new Date().getFullYear();
      const registeredDate = new Date(`${currentYear}-${profile.regDate}`); // 예: 2025-07-30
      const diffTime = Date.now() - registeredDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        daysAgoText = 'now';
      } else {
        daysAgoText = `${diffDays}일 전`;
      }

      if (diffDays >= 30) {
        color = 0xff0000; // 빨간색
        daysAgoText = `⚠️ ${daysAgoText}`;
      }
    }
    // 서버 ID
    const serverId = message.guild.id;

    // 이미지 크롭 & 첨부
    const imagePath = await cropCenterSquare(profile.profileImg);
    const attachment = new AttachmentBuilder(imagePath);

    // Embed 생성
    const embed = new EmbedBuilder()
      .setTitle(`${profile.nicknameValue}님의 프로필`)
      .setDescription(
        `[📝 프로필 확인/수정하기](http://localhost:3001/${serverId}/profile/${profile.discordId}\n\u200B`
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
