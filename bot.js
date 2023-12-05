const { Scenes, session, Telegraf } = require('telegraf');
const { start, backMenu, startSendQR, startExportDay, startExportYesterday } = require('./controllers/commands');
const { menuSceneSendQR } = require('./scenes/sendQR');
const { menuSceneExportDay } = require('./scenes/exportDay');
const { menuSceneExportYesterday } = require('./scenes/exportYesterday');
require('dotenv').config();

// подключение бота
const bot = new Telegraf(process.env.BOT_TOKEN);
// регистрация сцен (пример: new Scenes.Stage([menuSceneOne, menuSceneTwo, menuSceneTree]))
const stage = new Scenes.Stage([menuSceneSendQR, menuSceneExportDay, menuSceneExportYesterday]);

bot.use(session());
bot.use(stage.middleware());
bot.start(start);

// взаимодействие с кнопками
bot.on('photo', startSendQR)
bot.action('excelYesterdayButton', startExportYesterday)
bot.action('excelTodayButton', startExportDay)
bot.action('backMenuButton', backMenu)
bot.launch()


