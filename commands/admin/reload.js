module.exports = {
  name: '!리로드',
  execute: async (message) => {
    delete require.cache[require.resolve('../../config')];
    message.reply('✅ 리로드 완료!');
  },
};
