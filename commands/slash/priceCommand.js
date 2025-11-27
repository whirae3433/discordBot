const { fetchPriceDataCached } = require('../../utils/fetchPriceDataCached');
const {
  createPriceChartCached,
} = require('../../utils/createPriceChartCached');
const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');
const path = require('path');
const sharp = require('sharp');

// 품목별 이미지 매핑
const THUMB_MAP = {
  bok: 'bok.jpg',
  hon: 'hon.jpg',
  sijo: 'sijo.jpg',
  kkum: 'kkum.jpg',
  point: 'point.jpg',
};

const LABEL_MAP = {
  bok: '복대',
  hon: '혼줌',
  sijo: '시조',
  kkum: '꿈조',
  point: '포인트',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('로나오프')
    .setDescription('최근 시세 내역을 조회합니다.')
    .addStringOption((option) =>
      option
        .setName('품목')
        .setDescription('조회할 시세 종류를 선택하세요.')
        .setRequired(true)
        .addChoices(
          { name: '복대', value: 'bok' },
          { name: '혼줌', value: 'hon' },
          { name: '시조', value: 'sijo' },
          { name: '꿈조', value: 'kkum' },
          { name: '포인트', value: 'point' }
        )
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const category = interaction.options.getString('품목');
      const label = LABEL_MAP[category];

      const data = await fetchPriceDataCached(category);
      const chartBuffer = await createPriceChartCached(data, label, category);
      const chartAttachment = new AttachmentBuilder(chartBuffer, {
        name: 'chart.png',
      });

      // -----------------------------------------------------------------------------------------
      // ② 아이템 썸네일 생성
      // -----------------------------------------------------------------------------------------
      const thumbFile = THUMB_MAP[category];
      const filePath = path.join(__dirname, '../../public', thumbFile);

      const resizedBuffer = await sharp(filePath).resize(128, 128).toBuffer();
      const thumbAttachment = new AttachmentBuilder(resizedBuffer, {
        name: thumbFile,
      });

      // -----------------------------------------------------------------------------------------
      // ③ Embed 생성
      // -----------------------------------------------------------------------------------------
      const embed = new EmbedBuilder()
        .setColor(0x00aaff)
        .setThumbnail(`attachment://${thumbFile}`) // 썸네일
        .setImage(`attachment://chart.png`); // ⬅ 그래프 이미지 추가

      const GAP = '‎ ‎ ‎ ‎ ';

      // 최근 8개만 embed에 표시
      data.slice(0, 8).forEach((d) => {
        embed.addFields(
          { name: `🗓️ ${d.date}${GAP}${GAP}`, value: '', inline: true },
          { name: `📦 ${d.volume}${GAP}${GAP}`, value: '', inline: true },
          { name: `💰 ${d.price}`, value: '', inline: true }
        );
      });

      // -----------------------------------------------------------------------------------------
      // ④ reply
      // -----------------------------------------------------------------------------------------
      return interaction.editReply({
        embeds: [embed],
        files: [thumbAttachment, chartAttachment],
      });
    } catch (error) {
      console.error('시세 조회 에러:', error);
      return interaction.editReply('😥 시세 데이터를 가져오는 데 실패했어...');
    }
  },
};
