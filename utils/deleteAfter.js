/**
 * interaction 또는 message를 지정 시간(ms) 후 삭제
 *
 * @param {import('discord.js').Interaction | import('discord.js').Message} target
 * @param {number} delayMs - 지연 시간 (기본 5000ms)
 */
async function deleteAfter(target, delayMs = 7000) {
  setTimeout(async () => {
    try {
      if (target.deleteReply) {
        await target.deleteReply().catch(() => {});
      } else if (target.delete) {
        await target.delete().catch(() => {});
      }
    } catch (err) {
      console.error('[deleteAfter 오류]', err.message);
    }
  }, delayMs);
}

module.exports = { deleteAfter };
