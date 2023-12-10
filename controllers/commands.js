const { mainMenu } = require('../buttons/buttons');

const start = (ctx) => {
  return ctx.reply(`Отправь QR или выбери действие`, {
    disable_web_page_preview: true,
    parse_mode: 'HTML',
    ...mainMenu
  });
}

const backMenu = ctx => {
  ctx.reply('Отправь QR или выбери действие', {
    disable_web_page_preview: true,
    parse_mode: 'HTML',
    ...mainMenu
  });
}
const startSendQR = (ctx) => ctx.scene.enter('sendQR');
const startExportDay = (ctx) => ctx.scene.enter('exportDay');
const startCreateUser = (ctx) => ctx.scene.enter('createUser');

module.exports = {
  start,
  backMenu,
  startSendQR,
  startExportDay,
  startCreateUser
}
