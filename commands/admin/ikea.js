module.exports = {
  name: '!유보금',
  execute: async (message) => {
    await message.reply(
      '💲환영합니다 이케아님.\n스위스 은행에 있는 유보금은 400억입니다.'
    );
    return false;
  },
};
