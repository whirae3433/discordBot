const pool = require('../../pg/db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: '!멤버목록',
  description: 'DB에서 길드원 목록을 불러옵니다.',
  execute: async (message, args) => {
    try {
      const res = await pool.query(
        'SELECT * FROM member_list ORDER BY member_name;'
      );
      if (res.rows.length === 0) {
        return message.reply('⚠️ 등록된 멤버가 없습니다.');
      }

      // 결과를 embed로 보기 좋게
      const embed = new EmbedBuilder()
        .setTitle('📋 길드 멤버 목록')
        .setColor(0x00ae86);

      res.rows.forEach((row) => {
        embed.addFields({
          name: row.member_name,
          value: [
            `직업: ${row.job}`,
            `혹받이: ${row.decoy}`,
            `리저: ${row.resur}`,
            `리프: ${row.leap}`,
          ].join(' | '),
          inline: false,
        });
      });

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply('❌ DB 조회 중 오류가 발생했습니다.');
    }
  },
};
