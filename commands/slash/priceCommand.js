const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');

const ITEMS = require('../../items_full.json');
const { fetchPriceDataCached } = require('../../utils/fetchPriceDataCached');
const {
  createPriceChartCached,
} = require('../../utils/createPriceChartCached');

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

// 아이콘 URL 정제 /kms/latest/ → /kms/389/ 로 강제 변경 resize=3 없으면 자동 추가

function fixIconUrl(rawUrl, itemId) {
  if (!rawUrl) {
    return `https://maplestory.io/api/kms/389/item/${itemId}/icon?resize=3`;
  }

  let url = rawUrl.trim();

  // latest → 389 버전 강제
  url = url.replace('/kms/latest/', '/kms/389/');

  // resize 파라미터 없으면 추가
  if (!url.includes('resize=')) {
    url += (url.includes('?') ? '&' : '?') + 'resize=3';
  }

  return url;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('로나오프')
    .setDescription('아이템 시세를 조회합니다.')
    .addStringOption(
      (option) =>
        option
          .setName('아이템명')
          .setDescription('아이템명을 입력하세요.')
          .setRequired(true)
          .setAutocomplete(true) // 자동완성 활성화
    ),

  async execute(interaction) {
    const keyword = interaction.options.getString('아이템명');

    const item = ITEMS.find((i) => i.name === keyword);
    if (!item) {
      return interaction.reply(
        `❌ **${keyword}** 와 일치하는 아이템이 없습니다.`
      );
    }

    await interaction.deferReply();

    const itemId = item.id;
    const itemName = item.name;
    const iconUrl = fixIconUrl(item.icon, itemId);

    const data = await fetchPriceDataCached(itemId);
    if (!data || data.length === 0) {
      return interaction.editReply(
        `❌ **${itemName}** 의 시세 데이터가 없습니다.`
      );
    }

    const chartBuffer = await createPriceChartCached(data, itemName, itemId);
    const chartAttachment = new AttachmentBuilder(chartBuffer, {
      name: 'chart.png',
    });

    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle(`📈 ${itemName} 시세 정보`)
      .setDescription(
        `🔗 [등록되지 않은 아이템 제보하기](${FRONTEND_BASE_URL}/report-item)\n\u200B`
      )
      .setThumbnail(iconUrl)
      .setImage(`attachment://chart.png`);

    const GAP = '‎ ‎ ‎ ‎ ';
    data.slice(0, 8).forEach((d) => {
      embed.addFields(
        { name: `🗓️ ${d.date}${GAP}${GAP}`, value: '', inline: true },
        { name: `📦 ${d.volume}${GAP}${GAP}`, value: '', inline: true },
        { name: `💰 ${d.price}`, value: '', inline: true }
      );
    });

    return interaction.editReply({
      embeds: [embed],
      files: [chartAttachment],
    });
  },
};
