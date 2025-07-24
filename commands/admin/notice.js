module.exports = {
  name: '!공지',
  execute: async (message, args) => {
    if (args.length === 0) {
      return message.reply('공지할 메시지를 입력하세요.');
    }

    const noticeText = args.join(' ');
    await message.channel.send(`📢 ${noticeText}`);
  }
};
