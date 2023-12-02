const { Telegraf, Scenes } = require('telegraf');
const { backMenu } = require('../controllers/commands');
const { backButtonMenu, mainMenu } = require('../buttons/buttons');
const Jimp = require("jimp");
const jsQR = require("jsqr");

async function tryParse(url) {
  const image = await Jimp.read(url.href)
  // a bit of preprocessing helps on QR codes with tiny details
  image.normalize()
  image.scale(2)
  const value = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height)
  if (value) {
    return value.data || String.fromCharCode.apply(null, value.binaryData)
  }
}

const stepOne = Telegraf.on('photo', async ctx => {
  try {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    ctx.wizard.state.data = {}; // стейт для хранения введенных пользователем данных
    const photos = ctx.message.photo
    const photo = photos[photos.length - 1]
    const fileId = photo.file_id
    const url = await bot.telegram.getFileLink(fileId)
    ctx.wizard.state.data.toolCode = await tryParse(url)

    ctx.reply(`Введите количество`);
    return ctx.wizard.next()
  } catch (error) {
    console.log(error)
    ctx.reply('Упс... Произошла какая - то ошибка');
  }
});

// второй шаг сцены
const stepTwo = Telegraf.on('text', async ctx => {
  try {
    ctx.wizard.state.data.count = ctx.message.text;
    await ctx.reply('Введи номер маршрутного листа');
    return ctx.wizard.next()
  } catch (error) {
    console.log(error)
    ctx.reply('Упс... Произошла какая - то ошибка');
  }
});

// третий шаг сцены
const result = Telegraf.on('text', async ctx => {
  try {
    ctx.wizard.state.data.numberList = ctx.message.text;
    const { toolCode, count, numberList } = ctx.wizard.state.data;

    // тут должна быть обработка полученных данных и вывод
    await ctx.reply(`
    Вы взяли ${count}шт. инструмента с кодом ${toolCode} 
    по маршрутному листу ${numberList}
    `, {
      disable_web_page_preview: true,
      parse_mode: 'HTML',
      ...mainMenu
    })
    return ctx.scene.leave()
  } catch (error) {
    console.log(error)
    ctx.reply('Упс... Произошла какая - то ошибка');
  }
});

// передаём конструктору название сцены и шаги сцен
const menuSceneSendQR = new Scenes.WizardScene('sendQR', stepOne, stepTwo, result);

menuSceneSendQR.enter(ctx => ctx.reply('Жду QR...', {
  ...backButtonMenu
}));

// вешаем прослушку hears на сцену
menuSceneSendQR.hears('Возврат в меню', ctx => {
  ctx.scene.leave();
  return backMenu(ctx);
})

// экспортируем сцену
module.exports = {
  menuSceneSendQR
};
