const { Scenes, Telegraf} = require('telegraf');
const { backMenu } = require('../controllers/commands');
const { MongoClient } = require('mongodb');
const mongoXlsx = require('mongo-xlsx');
const moment = require("moment");
const {backButtonMenu} = require("../buttons/buttons");

const stepOne = Telegraf.on('text', async ctx => {
  if (moment(ctx.message.text).isSameOrBefore( '08.12.2023')
  || !/[0-9]{2}.[0-9]{2}.[0-9]{4}/.test(ctx.message.text)) {
    await ctx.reply("Введено некорректное значение");
    return ctx.scene.enter('exportDay');
  }
  MongoClient.connect(process.env.CONNECT)
    .then(async client => {
      const db = client.db('botqrbd');
      const dataCollection = db.collection('data');

      const results = await dataCollection.find({"Дата": {$regex: ctx.message.text}}).toArray();
      const model = mongoXlsx.buildDynamicModel(results);

      mongoXlsx.mongoData2Xlsx(results, model,  {
        fileName: `tools-${ctx.message.text}.xlsx`,
        path: './files',
      },  async function (err) {
        if (!err){
          await ctx.reply("Файл сохранился на сервере", {...backButtonMenu});
          return ctx.scene.leave();
        }
      });
    });
});

// передаём конструктору название сцены и шаги сцен
const menuSceneExportDay = new Scenes.WizardScene('exportDay', stepOne);
menuSceneExportDay.enter((ctx) => { ctx.reply('Введи нужную дату в формате ДД.ММ.ГГГГ')});

// вешаем прослушку hears на сцену
menuSceneExportDay.hears('Возврат в меню', ctx => {
  ctx.scene.leave();
  return backMenu(ctx);
})

// экспортируем сцену
module.exports = {
  menuSceneExportDay
};
