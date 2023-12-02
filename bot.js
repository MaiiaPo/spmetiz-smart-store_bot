const { Scenes, session, Telegraf } = require('telegraf');
const { MongoClient } = require('mongodb');
const { start, backMenu, startSendQR } = require('./controllers/commands');
const { menuSceneSendQR } = require('./scenes/sendQR');

require('dotenv').config();

// подключение бота
const bot = new Telegraf(process.env.BOT_TOKEN);
// регистрация сцен (пример: new Scenes.Stage([menuSceneOne, menuSceneTwo, menuSceneTree]))
const stage = new Scenes.Stage([menuSceneSendQR]);

const onPhoto = async (ctx) => {
  try {

    // todo записывать количество (шт) и номер маршрутной квитанции

    // await dataCollection.insertOne({
    //   user: ctx.message.from.username,
    //   toolCode: toolCode,
    //   dateTime: ctx.message.date,
    // })

  } catch (error) {
    return null;
  }
}

// подключение БД
MongoClient.connect('mongodb://localhost:27017/botqrbd')
  .then(client => {
    const db = client.db('botqrbd');
    const dataCollection = db.collection('data');


    bot.use(session());
    bot.use(stage.middleware());
    bot.start(start);

    // взаимодействие с кнопками
    bot.action('sendQRButton', startSendQR)
    bot.action('excelYesterdayButton', ctx => {ctx.reply('Вчера')})
    bot.action('excelTodayButton', ctx => {ctx.reply('Сегодня')})
    bot.action('backMenuButton', backMenu)
    bot.launch()
  });
