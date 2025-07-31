const { fetchPriceData } = require('../utils/fetchPrice');

function padRight(str, length) {
  str = String(str);
  return str + ' '.repeat(Math.max(0, length - str.length));
}

module.exports = {
  name: '!복대',
  description: '최근 복대 시세 내역을 조회합니다.',
  execute: async (message) => {
    try {
      const data = await fetchPriceData();

      if (!data || data.length === 0) {
        return message.reply('❌ 시세 데이터를 찾을 수 없어!');
      }

      const msg = data
        .map((d) => {
          const date = padRight(`📅 ${d.date}`, 12);
          const volume = padRight(`📦 ${d.volume}건`, 12);
          const price = padRight(`💰 ${d.price}`, 15);
          return `${date} | ${volume} | ${price}`;
        })
        .join('\n');

      return message.reply(`\`\`\`\n🔎 최근 시세 내역:\n${msg}\n\`\`\``);
    } catch (error) {
      console.error('시세 조회 에러:', error);
      return message.reply('😥 시세 데이터를 가져오는 데 실패했어...');
    }
  },
};
