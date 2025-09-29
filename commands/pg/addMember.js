const pool = require('../../pg/db');

module.exports = {
  name: '!멤버추가',
  description: '새 멤버를 DB에 등록합니다.',
  execute: async (message, args) => {
    const [member_name, job, decoy, resure, leap] = args;

    if (!member_name || !job) {
      return message.reply(
        '❌ 사용법: `!멤버추가 <이름> <직업> <혹받이> <리저> <리프>`'
      );
    }

    try {
      const res = await pool.query(
        `INSERT INTO member_list (member_id, member_name, job, decoy, resure, leap)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *;`,
        [
          Date.now().toString(), // 간단히 member_id는 timestamp string으로
          member_name,
          job,
          decoy || null,
          resure || null,
          leap || null,
        ]
      );

      const row = res.rows[0];
      message.reply(
        `✅ 멤버 추가 완료: ${row.member_name} (${row.job}) | 혹받이:${row.decoy}, 리저:${row.resure}, 리프:${row.leap}`
      );
    } catch (err) {
      console.error(err);
      message.reply('❌ DB 삽입 중 오류가 발생했습니다.');
    }
  },
};
