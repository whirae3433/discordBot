const { v4: uuidv4 } = require('uuid');
const pool = require('../../pg/db');
const { updateProfileChannel } = require('../../pg/updateProfileChannel');

module.exports = async function addCharacter(req, res) {
  const { discordId, serverId } = req.params;
  const { ign, level, hp, acc, job, atk, bossDmg, mapleWarrior } = req.body;

  // 숫자 변환 (함수 내부에서 해야 함)
  const levelNum = Number(level);
  const hpNum = Number(hp);
  const accNum = Number(acc);
  const atkNum = Number(atk);

  // 숫자 판별
  if ([levelNum, hpNum, accNum, atkNum].some((n) => Number.isNaN(n))) {
    return res.status(400).json({
      error: '숫자형 필드에 유효하지 않은 값이 들어왔습니다.',
    });
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const characterUuid = uuidv4();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const guild = await global.botClient.guilds.fetch(serverId);
    const member = await guild.members.fetch(discordId);

    const discordName =
      member.nickname || member.user.globalName || member.user.username;

    // 서버에 멤버 등록
    await client.query(
      `
      INSERT INTO members (server_id, discord_id, discord_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (server_id, discord_id)
      DO UPDATE SET discord_name = EXCLUDED.discord_name;
      `,
      [serverId, discordId, discordName]
    );

    // 직업명 → job_id 조회
    const jobRes = await client.query(
      `SELECT job_id FROM jobs WHERE job_name = $1`,
      [job]
    );

    if (jobRes.rowCount === 0) {
      throw new Error(`알 수 없는 직업명: ${job}`);
    }

    const jobId = jobRes.rows[0].job_id;

    // 캐릭터 INSERT
    await client.query(
      `
      INSERT INTO characters (
        character_uuid,
        discord_id, 
        ingame_name,
        job_id,
        level, 
        hp, 
        acc,
        atk, 
        boss_dmg,
        maple_warrior, 
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `,
      [
        characterUuid,
        discordId,
        ign,
        jobId,
        levelNum,
        hpNum,
        accNum,
        atkNum,
        bossDmg,
        mapleWarrior,
        today,
      ]
    );

    await client.query('COMMIT');

    // 프로필 채널 자동 업데이트
    updateProfileChannel(global.botClient, serverId, ign).catch((err) =>
      console.error('[프로필 채널 자동 갱신 실패]', err)
    );

    res.json({ success: true, message: '캐릭터 추가 완료', id: characterUuid });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ERROR addCharacter]', err);
    res.status(500).json({ error: '캐릭터 추가 실패', detail: err.message });
  } finally {
    client.release();
  }
};
