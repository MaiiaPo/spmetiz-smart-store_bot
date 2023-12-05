const { Scenes } = require('telegraf');
const { backMenu } = require('../controllers/commands');
const { MongoClient } = require('mongodb');
const XLSX = require('xlsx');

const exportDataForDay = async (ctx) => {
  const dateToday = new Date().setUTCHours(0, 0, 0, 0).toString().substring(0, 10);

  MongoClient.connect(process.env.CONNECT)
    .then(async client => {
      const db = client.db('botqrbd');
      const dataCollection = db.collection('data');
      console.log(dateToday)

      const results = await dataCollection.find({dateTime: {$gte: Number(dateToday)}}).toArray();
      console.log(results);
    });
  await ctx.reply("Вы тут");
}

// передаём конструктору название сцены и шаги сцен
const menuSceneExportDay = new Scenes.WizardScene('exportDay');
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
