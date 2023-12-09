const { Scenes, Telegraf} = require('telegraf');
const { backMenu } = require('../controllers/commands');
const { MongoClient } = require('mongodb');
const mongoXlsx = require('mongo-xlsx');
const moment = require("moment");

const stepOne = Telegraf.on('photo', async ctx => {
  return ctx.wizard.next()
});
const exportDataForYesterday = async (ctx) => {
  MongoClient.connect(process.env.CONNECT)
    .then(async client => {
      const db = client.db('botqrbd');
      const dataCollection = db.collection('data');

      const dateYesterday = moment().subtract(1, 'days')
      const dateFormat = moment(dateYesterday).format('DD.MM.YYYY');

      const results = await dataCollection.find({"Дата": {$regex: dateFormat}}).toArray();
      const model = mongoXlsx.buildDynamicModel(results);

      mongoXlsx.mongoData2Xlsx(results, model,  {
        fileName: `tools-${moment(yesterday).format('DD.MM.YYYY')}.xlsx`,
        path: './files',
      },  async function () {
        await ctx.reply("Файл сохранился на сервере");
      });
    });
}

// передаём конструктору название сцены и шаги сцен
const menuSceneExportYesterday = new Scenes.WizardScene('exportYesterday', stepOne);
menuSceneExportYesterday.enter(exportDataForYesterday);

// вешаем прослушку hears на сцену
menuSceneExportYesterday.hears('Возврат в меню', ctx => {
  ctx.scene.leave();
  return backMenu(ctx);
})

// экспортируем сцену
module.exports = {
  menuSceneExportYesterday
};
