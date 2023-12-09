const { Scenes, Telegraf} = require('telegraf');
const { backMenu } = require('../controllers/commands');
const { MongoClient } = require('mongodb');
const mongoXlsx = require('mongo-xlsx');
const moment = require("moment");

const stepOne = Telegraf.on('photo', async ctx => {
  return ctx.wizard.next()
});
const exportDataForDay = async (ctx) => {
  MongoClient.connect(process.env.CONNECT)
    .then(async client => {
      const db = client.db('botqrbd');
      const dataCollection = db.collection('data');

      const dateToday = new Date();
      const dateFormat = moment(dateToday).format('DD.MM.YYYY');

      const results = await dataCollection.find({"Дата": {$regex: dateFormat}}).toArray();
      const model = mongoXlsx.buildDynamicModel(results);

      mongoXlsx.mongoData2Xlsx(results, model,  {
        fileName: `tools-${moment(dateToday).format('DD.MM.YYYY')}.xlsx`,
        path: './files',
      },  async function (err) {
        if (!err){
          await ctx.reply("Файл сохранился на сервере");
        }
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
