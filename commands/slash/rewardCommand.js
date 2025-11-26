const { SlashCommandBuilder } = require('discord.js');
const { sheets } = require('../../utils/googleSheets');
const channelConfigMap = require('../../config');
const { wrapMessage } = require('../../utils/format');
const { safeReply } = require('../../utils/safeReply');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('분배금')
    .setDescription('닉네임으로 분배금을 조회합니다.')
    .addStringOption(option =>
      option
        .setName('닉네임')
        .setDescription('조회할 캐릭터 이름을 입력하세요.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const serverId = interaction.guild.id;
    const name = interaction.options.getString('닉네임');

    const serverConfig = channelConfigMap[serverId];
    if (!serverConfig) {
      return safeReply(interaction, '❌ 이 서버는 아직 등록되지 않았습니다.');
    }

    const spreadsheetId = serverConfig.spreadsheetId;
    const range = `복대!AT5:AW87`;

    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = res.data.values;
      if (!rows || rows.length === 0) {
        return safeReply(interaction, '❌ 데이터를 찾을 수 없습니다.');
      }

      // 이름 매칭
      const matchedRows = rows.filter((row) => row[0] === name);
      if (matchedRows.length === 0) {
        return safeReply(interaction, `${name}? 그런 이름은 없는데요?`);
      }

      // 금액 합산
      const totalAmount = matchedRows.reduce((sum, row) => {
        const rawValue = row[1] || '0';
        const status = row[3] || '';
        const numericValue = parseInt(rawValue.replace(/,/g, ''), 10) || 0;
        const effectiveValue = status.trim() !== '' ? 0 : numericValue;
        return sum + effectiveValue;
      }, 0);

      const formattedTotal = totalAmount.toLocaleString('ko-KR');

      return safeReply(
        interaction,
        wrapMessage(
          `어디보자...\n${name}의 분배금은 \`${formattedTotal}\` 메소입니다!`
        ),
        { deleteAfter: 5000 }
      );
    } catch (err) {
      console.error('[분배금 오류]', err);
      return safeReply(interaction, '❌ 에러 발생! 잠시 후 다시 시도해주세요.');
    }
  },
};
