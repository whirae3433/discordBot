const { getProfileObjects } = require('./getProfileObjects');

async function getProfilesByNickname(message, nickname) {
  if (!message.guild) return [];
  const serverId = String(message.guild.id);
  const q = (nickname || '').trim().toLowerCase();
  if (!q) return [];

  const list = await getProfileObjects(serverId);

  // IGN / 디코닉 매치 (기존 로직 유지)
  return list.filter(p => {
    const nick = (p.nicknameValue || '').toLowerCase();
    const ign  = (p.ign || '').toLowerCase();
    return nick.includes(q) || ign.includes(q);
  });
}

module.exports = { getProfilesByNickname };
