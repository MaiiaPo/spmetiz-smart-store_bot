const { Scenes, session, Telegraf } = require('telegraf');
const { start, backMenu, startSendQR } = require('./controllers/commands');
const { menuSceneSendQR } = require('./scenes/sendQR');
require('dotenv').config();
//https://api.telegram.org/bot6545961411:AAHkKugnDHNwm2FY1bo3KGPy-dEPI3yALA8/sendMessage?chat_id=535263198&text=Hello+World!

// подключение бота
const bot = new Telegraf(process.env.BOT_TOKEN);
// регистрация сцен (пример: new Scenes.Stage([menuSceneOne, menuSceneTwo, menuSceneTree]))
const stage = new Scenes.Stage([menuSceneSendQR]);

bot.use(session());
bot.use(stage.middleware());
bot.start(start);

// взаимодействие с кнопками
bot.action('sendQRButton', startSendQR)
bot.action('excelYesterdayButton', ctx => {ctx.reply('Вчера')})
bot.action('excelTodayButton', ctx => {ctx.reply('Сегодня')})
bot.action('backMenuButton', backMenu)
bot.launch()


