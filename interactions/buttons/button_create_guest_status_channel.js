const {
  ChannelType,
  PermissionsBitField,
  MessageFlags,
} = require('discord.js');
const pool = require('../../pg/db');
const { deleteAfter } = require('../../utils/deleteAfter');

module.exports = async (interaction) => {
  const guild = interaction.guild;
  const serverId = guild.id;
  const userId = interaction.user.id;

  try {
    // DB에서 관리자 권한 확인
    const adminCheck = await pool.query(
      `SELECT 1 FROM bot_admins 
       WHERE server_id = $1 AND discord_id = $2`,
      [serverId, userId]
    );

    if (adminCheck.rowCount === 0) {
      await interaction.reply({
        content: '⚠️ 관리자 전용 버튼입니다.',
        flags: MessageFlags.Ephemeral,
      });
      return deleteAfter(interaction, 7000);
    }

    // 이미 존재하는 채널 찾기
    const channelRes = await pool.query(
      `SELECT channel_id FROM bot_channels 
       WHERE server_id = $1 AND type = 'guest_status'`,
      [serverId]
    );

    let existingChannel = null;

    // DB에 채널 ID가 등록되어 있으면 캐시에서 확인
    if (channelRes.rowCount > 0) {
      const channelId = channelRes.rows[0].channel_id;

      try {
        // 캐시에 없으면 API에서 가져오기
        existingChannel =
          guild.channels.cache.get(channelId) ||
          (await guild.channels.fetch(channelId).catch(() => null));
      } catch (err) {
        console.log(
          `[손님 현황] 채널 ${channelId} 조회 실패 (삭제되었거나 접근 불가)`
        );
      }

      if (!existingChannel) {
        console.log(
          `[손님 현황] 등록된 채널(${channelId})이 삭제됨 또는 접근 불가.`
        );
      }
    }

    // 없으면 새로 생성
    if (!existingChannel) {
      const newChannel = await guild.channels.create({
        name: '🪪손님현황',
        type: ChannelType.GuildText,
        topic: '무영봇이 관리하는 손님 예약 현황 채널입니다.',
        permissionOverwrites: [
          {
            id: guild.roles.everyone, // 모든 유저는 보기만 가능
            allow: [PermissionsBitField.Flags.ViewChannel],
            deny: [PermissionsBitField.Flags.SendMessages],
          },
          {
            id: interaction.user.id, // 버튼 누른 유저에게만 쓰기 권한
            allow: [PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      //  DB에 저장 또는 갱신
      if (channelRes.rowCount > 0) {
        await pool.query(
          `UPDATE bot_channels 
           SET channel_id = $1 
           WHERE server_id = $2 AND type = 'guest_status'`,
          [newChannel.id, serverId]
        );
      } else {
        await pool.query(
          `INSERT INTO bot_channels (server_id, channel_id, type)
           VALUES ($1, $2, 'guest_status')`,
          [serverId, newChannel.id]
        );
      }

      await interaction.reply({
        content: `✅ 새 채널 <#${newChannel.id}> 이(가) 생성되었습니다.`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      // 이미 존재하는 경우
      await interaction.reply({
        content: `이미 <#${existingChannel.id}> 채널이 등록되어 있습니다.`,
        flags: MessageFlags.Ephemeral,
      });
    }
    deleteAfter(interaction, 3000);
  } catch (error) {
    console.error('[손님 현황 채널 생성 오류]', error);
    await interaction.reply({
      content: '⚠️ 채널 생성 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
    deleteAfter(interaction, 3000);
  }
};
