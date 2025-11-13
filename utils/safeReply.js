/**
 * utils/safeReply.js
 * 안전한 디스코드 Interaction 응답 헬퍼
 *
 * - reply() / editReply() 자동 감싸기
 * - InteractionAlreadyReplied / Unknown interaction 에러 방지
 * - optional delay로 자동 삭제 가능
 */
const DEFAULT_DELETE_MS = 5000;
const { MessageFlags } = require('discord-api-types/v10');

/**
 * 안전하게 응답(reply 또는 editReply)
 * @param {Interaction} interaction - Discord Interaction 객체
 * @param {string|object} message - 보낼 메시지 (string 또는 { content, embeds, ... })
 * @param {object} [options]
 * @param {boolean} [options.ephemeral=true] - 기본적으로 ephemeral 설정
 * @param {number|null} [options.deleteAfter=null] - 자동 삭제 시간(ms). null이면 삭제 안함.
 */
async function safeReply(interaction, message, options = {}) {
  const { ephemeral = true, deleteAfter = DEFAULT_DELETE_MS } = options;

  try {
    // 이미 deferReply나 reply가 호출된 상태인지 확인
    if (!interaction.deferred && !interaction.replied) {
      // 아직 응답 전이면 reply
      await interaction.reply({
        ...(typeof message === 'string' ? { content: message } : message),
        flags: ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    } else {
      // 이미 응답이 있다면 editReply
      await interaction.editReply(
        typeof message === 'string' ? { content: message } : message
      );
    }

    // 자동 삭제 (옵션)
    if (deleteAfter) {
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (err) {
          console.log('[safeReply] deleteReply 실패 (무시됨):', err.message);
        }
      }, deleteAfter);
    }
  } catch (err) {
    console.error('[safeReply] 응답 중 오류 발생:', err);
  }
}

/**
 * 이미 reply된 interaction에 대해
 * 일정 시간 후 deleteReply만 안전하게 실행하는 헬퍼
 * @param {Interaction} interaction
 * @param {number} [ms=DEFAULT_DELETE_MS]
 * @returns {NodeJS.Timeout} setTimeout에서 반환되는 타이머 ID
 */
function safeDeleteReply(interaction, ms = DEFAULT_DELETE_MS) {
  return setTimeout(async () => {
    try {
      await interaction.deleteReply();
    } catch (err) {
      console.log('[safeDeleteReply] deleteReply 실패 (무시됨):', err.message);
    }
  }, ms);
}

module.exports = { safeReply, safeDeleteReply };
