const { createRegisterEmbed } = require('../../utils/embedHelper');
const { safeReply } = require('../../utils/safeReply');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const userId = interaction.user.id;

  try {
    const embed = createRegisterEmbed(serverId, userId);

    return safeReply(
      interaction,
      { embeds: [embed] },
      {
        ephemeral: true,
        deleteAfter: 7000,
      }
    );
  } catch (err) {
    console.error('[등록 안내 임베드 오류]', err);

    return safeReply(
      interaction,
      '❌ 등록 안내 메시지를 생성하는 중 문제가 발생했습니다.',
      { ephemeral: true, deleteAfter: 3000 }
    );
  }
};
