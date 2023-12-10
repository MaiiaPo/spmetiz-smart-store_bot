const { Scenes, session, Telegraf } = require('telegraf');
const { start, backMenu, startSendQR, startExportDay } = require('./controllers/commands');
const { menuSceneSendQR } = require('./scenes/sendQR');
const { menuSceneExportDay } = require('./scenes/exportDay');
const { menuSceneCreateUser } = require('./scenes/createUser');
require('dotenv').config();

// подключение бота
const bot = new Telegraf(process.env.BOT_TOKEN);
// регистрация сцен (пример: new Scenes.Stage([menuSceneOne, menuSceneTwo, menuSceneTree]))
const stage = new Scenes.Stage([menuSceneSendQR, menuSceneExportDay, menuSceneCreateUser]);

bot.use(session());
bot.use(stage.middleware());
bot.start(start);

// взаимодействие с кнопками
bot.on('photo', startSendQR)
bot.action('excelDayButton', startExportDay)
bot.action('backMenuButton', backMenu)
bot.launch()


