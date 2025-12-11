const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { safeReply } = require('../../utils/safeReply');
const pool = require('../../pg/db');

// 관리자 확인
async function ensureAdmin(serverId, userId) {
  const check = await pool.query(
    `
    SELECT 1 
    FROM bot_admins 
    WHERE server_id = $1 AND discord_id = $2
    `,
    [serverId, userId]
  );
  return check.rowCount > 0;
}

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const userId = interaction.user.id;

  // 관리자 체크
  const isAdmin = await ensureAdmin(serverId, userId);
  if (!isAdmin) {
    return safeReply(interaction, '⚠️ 관리자 전용 메뉴입니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('button_create_guest_status_channel')
      .setLabel('🪪손님현황')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('button_create_profile_channel')
      .setLabel('🗂️길드원-프로필')
      .setStyle(ButtonStyle.Secondary)
  );

  return safeReply(
    interaction,
    {
      content: '✅ 생성할 채널을 선택하세요.',
      components: [row],
    },
    { ephemeral: true, deleteAfter: 10000 }
  );
};
