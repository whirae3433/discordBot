const { fetchPriceData } = require('../utils/fetchPrice');

function padRight(str, length) {
  str = String(str);
  return str + ' '.repeat(Math.max(0, length - str.length));
}

module.exports.priceCommand = async function (message) {
  const content = message.content.trim();

  if (content !== '!복대') return false; // 해당 명령이 아니면 처리하지 않음

  try {
    const data = await fetchPriceData();
    if (!data || data.length === 0) {
      await message.reply('❌ 시세를 찾을 수 없어!');
      return true;
    }

    const msg = data
      .map((d) => {
        const date = padRight(`📅 ${d.date}`, 12);
        const volume = padRight(`📦 ${d.volume}건`, 12);
        const price = padRight(`💰 ${d.price}`, 15);
        return `${date} | ${volume} | ${price}`;
      })
      .join('\n');

    await message.reply(`\`\`\`\n🔎 최근 시세 내역:\n${msg}\n\`\`\``);
  } catch (error) {
    console.error('시세 조회 에러:', error);
    await message.reply('😥 시세 데이터를 가져오는 데 실패했어...');
  }

  return true; // 명령어를 처리했으므로 true 반환
};
