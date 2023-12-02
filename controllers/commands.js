const { mainMenu } = require('../buttons/buttons');

const start = (ctx) => {
  return ctx.reply(`Выбери действие`, {
    disable_web_page_preview: true,
    parse_mode: 'HTML',
    ...mainMenu
  });
}

const backMenu = ctx => {
  ctx.reply('Возвращаю тебя в меню', {
    disable_web_page_preview: true,
    parse_mode: 'HTML',
    ...mainMenu
  });
}
const startSendQR = (ctx) => ctx.scene.enter('sendQR');

module.exports = {
  start,
  backMenu,
  startSendQR
}
