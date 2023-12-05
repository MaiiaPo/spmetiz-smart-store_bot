const { Scenes, Telegraf} = require('telegraf');
const { backMenu } = require('../controllers/commands');
const { MongoClient } = require('mongodb');
const mongoXlsx = require('mongo-xlsx');
const moment = require("moment");

const stepOne = Telegraf.on('photo', async ctx => {
  return ctx.wizard.next()
});
const exportDataForDay = async (ctx) => {
  const dateToday = new Date().setUTCHours(0, 0, 0, 0).toString().substring(0, 10);
  const bot = new Telegraf(process.env.BOT_TOKEN);

  MongoClient.connect(process.env.CONNECT)
    .then(async client => {
      const db = client.db('botqrbd');
      const dataCollection = db.collection('data');

      const results = await dataCollection.find({dateTime: {$gte: Number(dateToday)}}).toArray();
      const model = mongoXlsx.buildDynamicModel(results);

      const date = new Date();

      mongoXlsx.mongoData2Xlsx(results, model,  {
        fileName: `tools-${moment(date).format('DD.MM.YYYY')}.xlsx`,
        path: './files',
      },  async function (err, data) {
        await ctx.reply("Файл сохранился на сервере");
      });
    });
}

// передаём конструктору название сцены и шаги сцен
const menuSceneExportDay = new Scenes.WizardScene('exportDay', stepOne);
menuSceneExportDay.enter(exportDataForDay);

// вешаем прослушку hears на сцену
menuSceneExportDay.hears('Возврат в меню', ctx => {
  ctx.scene.leave();
  return backMenu(ctx);
})

// экспортируем сцену
module.exports = {
  menuSceneExportDay
};
