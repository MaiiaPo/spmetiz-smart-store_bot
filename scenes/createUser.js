const { Telegraf, Scenes } = require('telegraf');
const { backMenu } = require('../controllers/commands');
const { MongoClient } = require('mongodb');
const { backButtonMenu } = require("../buttons/buttons");

const stepOne = Telegraf.on('text', async ctx => {
  try {
    // подключение БД
    MongoClient.connect(process.env.CONNECT)
      .then(async client => {
        const db = client.db('botqrbd');
        const userCollection = db.collection('users');

        await userCollection.insertOne({
          "userId": ctx.message.from.id,
          "userFullName": ctx.message.text,
        })
      });
    await ctx.reply(`Спасибо, вы зарегистрированы`, {...backButtonMenu})
    return ctx.scene.leave()

  } catch (error) {
    console.log(error)
    ctx.reply('Упс... Произошла какая - то ошибка');
  }
});

// передаём конструктору название сцены и шаги сцен
const menuSceneCreateUser = new Scenes.WizardScene('createUser', stepOne);

menuSceneCreateUser.enter((ctx) => { ctx.reply('Вы еще не зарегистрированы. Введите имя и фамилию')});

// вешаем прослушку hears на сцену
menuSceneCreateUser.hears('Возврат в меню', ctx => {
  ctx.scene.leave();
  return backMenu(ctx);
})

// экспортируем сцену
module.exports = {
  menuSceneCreateUser
};
