const { SlashCommandBuilder } = require('discord.js');
const pool = require('../../pg/db');
const { safeReply } = require('../../utils/safeReply');
const { invalidateServerEnabledCache } = require('../../utils/serverGate');

// ---------------- Main ---------------- //
module.exports = {
  data: new SlashCommandBuilder()
    .setName('무영봇권한')
    .setDescription('무영봇 서버 사용권한을 ON / OFF 합니다. (운영자 전용)')
    .addStringOption((opt) =>
      opt
        .setName('mode')
        .setDescription('사용 여부')
        .setRequired(true)
        .addChoices(
          { name: '🟢 사용 ON', value: 'on' },
          { name: '🔴 사용 OFF', value: 'off' },
        ),
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    const serverId = guild?.id;
    const userId = interaction.user.id;

    try {
      // DM 방지
      if (!guild || !serverId) {
        return safeReply(
          interaction,
          '❌ 서버(길드)에서만 사용할 수 있는 명령어입니다.',
          { deleteAfter: 5000 },
        );
      }

      // 봇 운영자 체크
      const ownerId = process.env.OWNER_DISCORD_ID;
      if (!ownerId || userId !== ownerId) {
        return safeReply(
          interaction,
          '❌ 이 명령어는 **무영봇 운영자만** 사용할 수 있습니다.',
          { deleteAfter: 5000 },
        );
      }

      await interaction.deferReply({ ephemeral: true });

      // 옵션 파싱
      const mode = interaction.options.getString('mode', true);
      const enabled = mode === 'on';

      // DB 반영 (upsert)
      await pool.query(
        `
        INSERT INTO servers (server_id, server_name, is_enabled)
        VALUES ($1, $2, $3)
        ON CONFLICT (server_id)
        DO UPDATE SET
          server_name = EXCLUDED.server_name,
          is_enabled = EXCLUDED.is_enabled
        `,
        [serverId, guild.name, enabled],
      );

      // 캐시 무효화
      invalidateServerEnabledCache(serverId);

      // 결과 안내
      return safeReply(
        interaction,
        `✅ **${guild.name}** 서버의 무영봇 사용 권한이 **${
          enabled ? '🟢 ON' : '🔴 OFF'
        }** 상태로 변경되었습니다.`,
        { deleteAfter: 5000 },
      );
    } catch (err) {
      console.error('[무영봇권한 오류]', err);

      if (interaction.deferred) {
        return interaction.editReply(
          '⚠️ 무영봇 권한 설정 중 오류가 발생했습니다.',
        );
      }

      return safeReply(
        interaction,
        '⚠️ 무영봇 권한 설정 중 오류가 발생했습니다.',
        { deleteAfter: 5000 },
      );
    }
  },
};
