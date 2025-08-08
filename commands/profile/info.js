require('dotenv').config();
const { getProfilesByNickname } = require('../../utils/getProfile');
const parseArgs = require('../../utils/parseArgs');
const {
  createRegisterEmbed,
  createProfileEmbed,
} = require('../../utils/embedHelper');
const { clearCache } = require('../../utils/profileCache');

module.exports = {
  name: '!정보',
  description: '닉네임으로 프로필 정보를 조회합니다.',
  execute: async (message, args) => {
    const serverId = message.guild.id;

    // 캐시 초기화 명령 처리
    if (args[0] === '업데이트') {
      clearCache(serverId);
      return message.reply(
        '정보를 업데이트 했어. 다음부터 최신 프로필을 불러올게!'
      );
    }

    // 닉네임 없는 경우
    if (!args.length) {
      const embed = createRegisterEmbed(serverId, message.author.id);
      return message.channel.send({ embeds: [embed] });
    }

    // 닉네임 파싱
    const parsed = parseArgs(args, { requireName: true });
    if (parsed.error) return message.reply(parsed.error);
    const { name: nickname } = parsed;

    // 2글자 미만이면 차단
    if (nickname.trim().length < 2) {
      return message.reply('닉네임은 최소 2글자 이상 입력해주세요.');
    }

    // 프로필 조회
    const profiles = await getProfilesByNickname(message, nickname);
    if (!profiles.length) {
      const embed = createRegisterEmbed(serverId, message.author.id);
      return message.channel.send({ embeds: [embed] });
    }

    // 본계정 / 부계정만 필터링
    const filtered = profiles.filter(
      (p) => p.accountGroup === '본계정' || p.accountGroup === '부계정'
    );

    // ign 기준 그룹화
    const grouped = filtered.reduce((acc, profile) => {
      if (!acc[profile.ign]) acc[profile.ign] = [];
      acc[profile.ign].push(profile);
      return acc;
    }, {});

    // 본계정 먼저, 부계정은 그 뒤로 정렬
    const sortedGroups = Object.values(grouped).sort((a, b) => {
      const groupOrder = {
        본계정: 0,
        부계정: 1,
      };
      const aGroup = groupOrder[a[0]?.accountGroup] ?? 99;
      const bGroup = groupOrder[b[0]?.accountGroup] ?? 99;
      return aGroup - bGroup;
    });

    // embed 생성 및 전송
    for (const chars of sortedGroups) {
      const [first, ...rest] = chars;
      const result = await createProfileEmbed(first, serverId, rest);
      await message.channel.send(result);
    }
  },
};
