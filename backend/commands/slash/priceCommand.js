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

// 아이콘 URL 정제
function fixIconUrl(rawUrl, itemId) {
  if (!rawUrl) {
    return `https://maplestory.io/api/kms/389/item/${itemId}/icon?resize=3`;
  }

  const baseUrl = rawUrl.trim().replace('/kms/latest/', '/kms/389/');
  return baseUrl.includes('resize=')
    ? baseUrl
    : `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}resize=3`;
}

// 가격 Embed 생성 함수
function buildPriceEmbed(itemName, iconUrl, chartFileName, priceData) {
  const embed = new EmbedBuilder()
    .setColor(0x00aaff)
    .setTitle(`📈 ${itemName} 시세 정보`)
    .setDescription(
      `🔗 [등록되지 않은 아이템 제보하기](${FRONTEND_BASE_URL}/report-item)\n\u200B`
    )
    .setThumbnail(iconUrl)
    .setImage(`attachment://${chartFileName}`);

  const GAP = '‎ ‎ ‎ ‎ ';

  priceData.slice(0, 8).forEach((d) => {
    embed.addFields(
      { name: `🗓️ ${d.date}${GAP}${GAP}`, value: ' ', inline: true },
      { name: `📦 ${d.volume}${GAP}${GAP}`, value: ' ', inline: true },
      { name: `💰 ${d.price}`, value: ' ', inline: true }
    );
  });

  return embed;
}

// Slash Command
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

    // 캐시 기반 시세 데이터 조회
    let { data: priceData } = fetchPriceDataCached(itemId);

    // 캐시 MISS → 자동 대기 UX
    if (!priceData) {
      await interaction.editReply(
        `⏳ **${itemName}** 시세를 불러오는 중입니다...\n잠시만 기다려주세요.`
      );

      const start = Date.now();
      const TIMEOUT = 20_000; // 20초
      const INTERVAL = 1_000; // 1초

      while (Date.now() - start < TIMEOUT) {
        await new Promise((r) => setTimeout(r, INTERVAL));

        const res = fetchPriceDataCached(itemId);
        if (res.data) {
          priceData = res.data;
          break;
        }
      }

      if (!priceData) {
        return interaction.editReply(
          `❌ **${itemName}** 시세를 불러오지 못했습니다.\n잠시 후 다시 시도해주세요.`
        );
      }
    }

    // 차트 이미지 생성
    const chartBuffer = await createPriceChartCached(
      priceData,
      itemName,
      itemId
    );
    const chartFileName = 'chart.png';

    const chartAttachment = new AttachmentBuilder(chartBuffer, {
      name: chartFileName,
    });

    const embed = buildPriceEmbed(itemName, iconUrl, chartFileName, priceData);

    return interaction.editReply({
      content: '',
      embeds: [embed],
      files: [chartAttachment],
    });
  },
};
