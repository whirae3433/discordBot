const pool = require('../pg/db');

async function getProfileObjects(serverId) {
  try {
    const query = `
      SELECT
        m.server_id,
        m.discord_id,
        m.discord_name,
        c.character_uuid,
        c.ingame_name,
        c.job_id,
        j.job_name,
        j.job_group,
        c.level,
        c.hp,
        c.acc,
        c.atk,
        c.boss_dmg,
        c.maple_warrior,
        c.updated_at
      FROM members m
      LEFT JOIN characters c
        ON m.discord_id = c.discord_id
      LEFT JOIN jobs j
        ON c.job_id = j.job_id
      WHERE m.server_id = $1
      ORDER BY c.ingame_name ASC;
    `;

    const result = await pool.query(query, [serverId]);

    return result.rows.map((row) => ({
      serverId: row.server_id,
      discordId: row.discord_id,
      discordName: row.discord_name,

      characterUuid: row.character_uuid,
      ign: row.ingame_name,

      jobId: row.job_id,
      jobName: row.job_name,
      jobGroup: row.job_group,
      
      level: row.level,
      hp: row.hp,
      acc: row.acc,
      atk: row.atk,
      bossDmg: row.boss_dmg,
      mapleWarrior: row.maple_warrior,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.error(`[ERROR] getProfileObjects(PG, ${serverId}):`, err.message);
    return [];
  }
}

module.exports = { getProfileObjects };
