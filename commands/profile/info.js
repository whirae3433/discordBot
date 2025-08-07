require('dotenv').config();
const { getProfilesByNickname } = require('../../utils/getProfile');
const parseArgs = require('../../utils/parseArgs');
const { createRegisterEmbed, createProfileEmbed } = require('../../utils/embedHelper');

module.exports = {
  name: '!정보',
  description: '닉네임으로 프로필 정보를 조회합니다.',
  execute: async (message, args) => {
    const serverId = message.guild.id;

    // 닉네임 없는 경우
    if (!args.length) {
      const embed = createRegisterEmbed(serverId, message.author.id);
      return message.channel.send({ embeds: [embed] });
    }

    // 닉네임 파싱
    const parsed = parseArgs(args, { requireName: true });
    if (parsed.error) return message.reply(parsed.error);

    const { name: nickname } = parsed;

    // 프로필 조회
    const profiles = await getProfilesByNickname(message, nickname);
    if (!profiles.length) {
      const embed = createRegisterEmbed(serverId, message.author.id);
      return message.channel.send({ embeds: [embed] });
    }

    // ign 그룹화
    const grouped = profiles.reduce((acc, profile) => {
      if (!acc[profile.ign]) acc[profile.ign] = [];
      acc[profile.ign].push(profile);
      return acc;
    }, {});

    // 그룹별 Embed 생성
    for (const chars of Object.values(grouped)) {
      const [first, ...rest] = chars;
      const result = await createProfileEmbed(first, serverId, rest);
      await message.channel.send(result);
    }
  },
};
