const { fetchPriceData } = require('../../utils/fetchPrice');
const { SlashCommandBuilder } = require('discord.js');

function padRight(str, length) {
  str = String(str);
  return str + ' '.repeat(Math.max(0, length - str.length));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('복대')
    .setDescription('최근 복대 시세 내역을 조회합니다.'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: false });

      const data = await fetchPriceData();

      if (!data || data.length === 0) {
        return interaction.editReply('❌ 시세 데이터를 찾을 수 없어!');
      }

      const msg = data
        .map((d) => {
          const date = padRight(`📅 ${d.date}`, 12);
          const volume = padRight(`📦 ${d.volume}건`, 12);
          const price = padRight(`💰 ${d.price}`, 15);
          return `${date} | ${volume} | ${price}`;
        })
        .join('\n');

      return interaction.editReply(
        `\`\`\`\n🔎 최근 시세 내역:\n${msg}\n\`\`\``
      );
    } catch (error) {
      console.error('시세 조회 에러:', error);
      return interaction.editReply('😥 시세 데이터를 가져오는 데 실패했어...');
    }
  },
};
