const pool = require('../../pg/db');
const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

  try {
    const res = await pool.query(
      'SELECT * FROM member_list WHERE server_id = $1 ORDER BY member_name;',
      [serverId]
    );

    if (res.rows.length === 0) {
      return await interaction.reply({
        content: '⚠️ 이 서버에 등록된 멤버가 없습니다.',
        ephemeral: true,
      });
    }

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
        inline: false,
      });
    });

    const sent = await interaction.reply({
      embeds: [embed],
      ephemeral: false,
      fetchReply: true, // 이걸 추가해야 메시지 객체를 가져올 수 있음
    });

    setTimeout(() => {
      sent.delete().catch((err) => console.error('[메시지 삭제 오류]', err));
    }, 5000);
  } catch (err) {
    console.error('[member_list 버튼 오류]', err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ 멤버 목록을 불러오는 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  }
};
