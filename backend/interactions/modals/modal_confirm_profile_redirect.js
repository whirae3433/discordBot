const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { safeReply } = require('../../utils/safeReply');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const userId = interaction.user.id;

  const url = `${process.env.FRONTEND_BASE_URL}/${serverId}/profile/${userId}`;

  return safeReply(
    interaction,
    {
      content: '확인되었습니다. 아래 버튼을 눌러 이동하세요.',
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('👤 무영봇 웹으로 이동')
            .setStyle(ButtonStyle.Link)
            .setURL(url)
        ),
      ],
    },
    { ephemeral: true, deleteAfter: 15000 }
  );
};
