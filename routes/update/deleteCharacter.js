const pool = require('../../pg/db');
const { updateProfileChannel } = require('../../pg/updateProfileChannel');

module.exports = async function deleteCharacter(req, res) {
  const { serverId, discordId, characterId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) 삭제 대상 캐릭터 IGN 조회
    const find = await client.query(
      `
      SELECT ingame_name, discord_id
      FROM characters
      WHERE character_uuid = $1
      `,
      [characterId]
    );

    const row = find.rows[0];

    // ⛔ 본인만 삭제 가능
    if (String(row.discord_id) !== String(discordId)) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: '본인이 등록한 캐릭터만 삭제할 수 있습니다.',
      });
    }

    const targetIGN = find.rows[0].ingame_name;

    // 2) 캐릭터 삭제
    await client.query(
      `
      DELETE FROM characters
      WHERE character_uuid = $1
      `,
      [characterId]
    );

    await client.query('COMMIT');

    // 3) 프로필 채널 부분 갱신 (해당 IGN만 삭제/갱신)
    updateProfileChannel(global.botClient, serverId, targetIGN).catch((err) =>
      console.error('[프로필 채널 자동 갱신 실패]', err)
    );

    return res.json({ success: true, message: '캐릭터 삭제 완료' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ERROR deleteCharacter]', err);

    return res.status(500).json({
      error: '캐릭터 삭제 실패',
      detail: err.message,
    });
  } finally {
    client.release();
  }
};
