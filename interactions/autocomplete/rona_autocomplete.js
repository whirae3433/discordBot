const ITEMS = require('../../items_full.json');

module.exports = async (interaction) => {
  if (!interaction.isAutocomplete()) return;
  if (interaction.commandName !== '로나오프') return;

  const focused = interaction.options.getFocused();
  const keyword = focused.trim();

  let results = [];

  if (keyword.length === 0) {
    // 아무 글자 없으면 첫 25개만 표시
    results = ITEMS.slice(0, 25);
  } else {
    // 부분일치 검색
    results = ITEMS.filter((i) => i.name.includes(keyword)).slice(0, 25);
  }

  await interaction.respond(
    results.map((item) => ({
      name: item.name,  // 자동완성에 표시될 텍스트
      value: item.name, // execute에서 받을 값
    }))
  );
};
