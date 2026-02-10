const pool = require('../../pg/db');

module.exports = async function updateCharacter(req, res) {
  const discordId = req.session.user.id;
  const { characterId } = req.params;
  const { ign, level, hp, acc, job, atk, bossDmg, mapleWarrior } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 기존 캐릭터 정보 가져오기
    const prevRes = await client.query(
      `
      SELECT 
        c.character_uuid,
        c.discord_id,
        c.ingame_name AS ign,
        c.job_id,
        c.level,
        c.hp,
        c.acc,
        c.atk,
        c.boss_dmg,
        c.maple_warrior,
        j.job_name
      FROM characters c
      LEFT JOIN jobs j ON c.job_id = j.job_id
      WHERE c.character_uuid = $1
      `,
      [characterId]
    );

    if (prevRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res
        .status(404)
        .json({ error: '수정할 캐릭터를 찾을 수 없습니다.' });
    }

    const prev = prevRes.rows[0];

    // 본인만 수정 가능
    if (String(prev.discord_id) !== String(discordId)) {
      await client.query('ROLLBACK');
      return res
        .status(403)
        .json({ error: '본인이 등록한 캐릭터만 수정할 수 있습니다.' });
    }

    // job_name → job_id 변환
    let jobId = prev.job_id;
    if (job) {
      const jobRes = await client.query(
        `SELECT job_id FROM jobs WHERE job_name = $1`,
        [job]
      );
      if (jobRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `알 수 없는 직업명: ${job}` });
      }
      jobId = jobRes.rows[0].job_id;
    }

    const today = new Date().toISOString().split('T')[0];

    // DB 업데이트
    await client.query(
      `
      UPDATE characters
      SET
        ingame_name = COALESCE($1, ingame_name),
        job_id      = $2,
        level       = COALESCE($3, level),
        hp          = COALESCE($4, hp),
        acc         = COALESCE($5, acc),
        atk         = COALESCE($6, atk),
        boss_dmg    = COALESCE($7, boss_dmg),
        maple_warrior = COALESCE($8, maple_warrior),
        updated_at  = $9
      WHERE character_uuid = $10
        AND discord_id = $11
      `,
      [
        ign ?? null,
        jobId,
        level ?? null,
        hp ?? null,
        acc ?? null,
        atk ?? null,
        bossDmg ?? null,
        mapleWarrior ?? null,
        today,
        characterId,
        discordId,
      ]
    );

    await client.query('COMMIT');

    // // 프로필 채널 갱신
    // updateProfileChannel(global.botClient, serverId, newIGN)
    //   .catch(err => console.error('[프로필 채널 자동 갱신 실패]', err));

    return res.json({ success: true, message: '캐릭터 수정 완료' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ERROR updateCharacter]', err);
    return res.status(500).json({
      error: '캐릭터 수정 실패',
      detail: err.message,
    });
  } finally {
    client.release();
  }
};
