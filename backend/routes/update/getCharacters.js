const pool = require('../../pg/db');

module.exports = async function getCharacters(req, res) {
  const discordId = req.session.user.id;

  try {
    // DB에서 serverId + discordId 기준 캐릭터 모두 가져오기
    const query = `
  SELECT
    c.character_uuid,
    c.discord_id,
    c.ingame_name,
    c.level,
    c.hp,
    c.acc,
    c.atk,
    c.boss_dmg,
    c.maple_warrior,
    c.updated_at,
    j.job_name,
    j.job_group
  FROM characters c
  LEFT JOIN jobs j ON c.job_id = j.job_id
  WHERE c.discord_id = $1
  ORDER BY c.ingame_name ASC;
`;


    const result = await pool.query(query, [discordId]);

    // characters만 필터링
    const characters = result.rows
      .filter((row) => row.character_uuid) // 캐릭터 없는 멤버는 제외
      .map((row) => ({
        serverId: row.server_id,
        discordId: row.discord_id,
        id: row.character_uuid, // UUID
        nickname: row.discord_name, // 디코닉
        ign: row.ingame_name,
        level: row.level,
        hp: row.hp,
        acc: row.acc,

        jobName: row.job_name,
        jobGroup: row.job_group,

        atk: row.atk,
        bossDmg: row.boss_dmg,
        mapleWarrior: row.maple_warrior,

        updatedAt: row.updated_at,
      }));

    return res.json({ discordId, characters });
  } catch (err) {
    console.error('[getCharacters ERROR]', err);
    return res
      .status(500)
      .json({ error: '캐릭터 목록 불러오기 실패', detail: err.message });
  }
};
