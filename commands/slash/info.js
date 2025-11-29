const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('정보')
    .setDescription('프로필 조회 방법을 안내합니다.'),

  async execute(interaction) {
    try {
      const guild = interaction.guild;
      if (!guild) return;

      // 🟦 무영봇 채널 찾기
      const muBotChannel = guild.channels.cache.find(
        (ch) => ch.name === '🤖무영봇'
      );

      const channelMention = muBotChannel
        ? `<#${muBotChannel.id}>`
        : '무영봇 채널을 찾을 수 없습니다.';

      // 유저 입력 메시지 삭제
      // (슬래시 명령어는 자동 삭제가 아니라 "회색 안내 메시지"라서 followUp 방식 사용)
      // 그래도 interaction.deferReply 후 deleteReply 로 지움

      await interaction.deferReply({ ephemeral: false });

      const reply = await interaction.editReply({
        content:
          `무영봇 패널을 통해 프로필을 조회해주세요!\n` +
          `👉 ${channelMention}`,
      });

      // 🟥 7초 뒤 메시지 삭제
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (e) {}
      }, 7000);
    } catch (err) {
      console.error('/정보 오류:', err);
    }
  },
};
