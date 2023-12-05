const { mainMenu } = require('../buttons/buttons');

const start = (ctx) => {
  return ctx.reply(`Отправь QR или выбери действие`, {
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
const startExportDay = (ctx) => ctx.scene.enter('exportDay');
const startExportYesterday = (ctx) => ctx.scene.enter('exportYesterday');

module.exports = {
  start,
  backMenu,
  startSendQR,
  startExportDay,
  startExportYesterday
}
