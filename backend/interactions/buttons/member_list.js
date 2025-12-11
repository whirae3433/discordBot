const pool = require('../../pg/db');
const { EmbedBuilder } = require('discord.js');
const { safeReply } = require('../../utils/safeReply');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

  try {
    // 1) DB 조회
    const res = await pool.query(
      `
      SELECT *
      FROM member_list
      WHERE server_id = $1
      ORDER BY member_name
      `,
      [serverId]
    );

    // 2) 데이터 없을 때
    if (res.rowCount === 0) {
      return safeReply(interaction, '⚠️ 이 서버에 등록된 멤버가 없습니다.', {
        ephemeral: true,
        deleteAfter: 5000,
      });
    }

    // 3) Embed 구성
    const embed = new EmbedBuilder()
      .setTitle('📋 길드 멤버 목록')
      .setColor(0x00ae86);

    for (const m of res.rows) {
      embed.addFields({
        name: m.member_name,
        value: [
          `직업: ${m.job}`,
          `혹받이: ${m.decoy ?? '없음'}`,
          `리저: ${m.resur ?? '없음'}`,
          `리프: ${m.leap ?? '없음'}`,
        ].join(' | '),
      });
    }

    // 4) 공개 메시지로 전송 후 자동 삭제
    return safeReply(
      interaction,
      { embeds: [embed] },
      {
        ephemeral: false, // 공개 메시지
        deleteAfter: 5000, // 5초 뒤 자동 삭제
      }
    );
  } catch (err) {
    console.error('[member_list 버튼 오류]', err);

    return safeReply(
      interaction,
      '❌ 멤버 목록을 불러오는 중 오류가 발생했습니다.',
      {
        ephemeral: true,
        deleteAfter: 5000,
      }
    );
  }
};
