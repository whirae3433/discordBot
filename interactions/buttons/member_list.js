const pool = require('../../pg/db');
const { EmbedBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

  try {
    const res = await pool.query(
      'SELECT * FROM member_list WHERE server_id = $1 ORDER BY member_name;',
      [serverId]
    );

    // 멤버 없을 때
    if (res.rows.length === 0) {
      await interaction.reply({
        content: '⚠️ 이 서버에 등록된 멤버가 없습니다.',
        flags: MessageFlags.Ephemeral, // ✅ 최신 방식
      });

      // 5초 뒤 자동 삭제
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (err) {
          console.error('[메시지 삭제 오류]', err);
        }
      }, 5000);

      return;
    }

    // 📋 Embed 구성
    const embed = new EmbedBuilder()
      .setTitle('📋 길드 멤버 목록')
      .setColor(0x00ae86);

    res.rows.forEach((row) => {
      embed.addFields({
        name: row.member_name,
        value: [
          `직업: ${row.job}`,
          `혹받이: ${row.decoy ?? '없음'}`,
          `리저: ${row.resur ?? '없음'}`,
          `리프: ${row.leap ?? '없음'}`,
        ].join(' | '),
      });
    });

    // ✅ 메시지 전송
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.None, // 공개 메시지
    });

    // ✅ 안정적으로 메시지 가져오기 (경고 없음 + 항상 작동)
    const message = await interaction.fetchReply();

    // 5초 뒤 자동 삭제
    setTimeout(() => {
      message.delete().catch((err) => console.error('[메시지 삭제 오류]', err));
    }, 5000);
  } catch (err) {
    console.error('[member_list 버튼 오류]', err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ 멤버 목록을 불러오는 중 오류가 발생했습니다.',
        flags: MessageFlags.Ephemeral, // ✅ 최신 방식
      });

      // 5초 뒤 삭제
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (err2) {
          console.error('[에러 메시지 삭제 오류]', err2);
        }
      }, 5000);
    }
  }
};
