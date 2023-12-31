const { Telegraf, Scenes } = require('telegraf');
const { backMenu } = require('../controllers/commands');
const { backButtonMenu } = require('../buttons/buttons');
const Jimp = require("jimp");
const { MongoClient } = require('mongodb');
const qrCodeReader = require('qrcode-reader');
const moment = require("moment/moment");

const stepOne = Telegraf.on('photo', async ctx => {
  try {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    ctx.wizard.state.data = {}; // стейт для хранения введенных пользователем данных

    // Проверка, есть ли пользователь в базе
    // если нет, то надо создать
    // подключение БД
    MongoClient.connect(process.env.CONNECT)
      .then(async client => {
        const db = client.db('botqrbd');
        const userCollection = db.collection('users');

        const findUser = await userCollection.find({userId: ctx.message.from.id}).toArray();
        if (findUser.length === 0) {
          ctx.scene.enter('createUser');
          ctx.scene.leave();
        } else {
          ctx.wizard.state.data.userName = findUser[0].userFullName;

          const photos = ctx.message.photo
          const photo = photos[photos.length - 1]
          const fileId = photo.file_id

          const url = await bot.telegram.getFileLink(fileId)
          Jimp.read(url.href, function(err, image) {
            if (err) {
              console.error(err);
            }
            const qrCodeInstance = new qrCodeReader();
            qrCodeInstance.callback = function(err, value) {
              if (err) {
                return ctx.reply('Не удалось распознать изображение. Попробуйте еще раз', {...backButtonMenu});
              }
              if (!value && !value.result) {
                return ctx.reply('Не удалось распознать изображение. Попробуйте еще раз', {...backButtonMenu});
              } else {
                ctx.wizard.state.data.toolCode = value.result;
                ctx.reply(`Введи количество`);
                return ctx.wizard.next()
              }
            };
            qrCodeInstance.decode(image.bitmap);
          });
        }
      });
  } catch (error) {
    console.log(error)
    ctx.reply('Упс... Произошла какая - то ошибка');
  }
});

// второй шаг сцены
const stepTwo = Telegraf.on('text', async ctx => {
  try {
    if (!/^\d+$/.test(ctx.message.text) || (ctx.message.text < 1 || ctx.message.text > 20)) {
      await ctx.reply("Введено некорректное значение, повтори ввод (цифры от 1 до 20)");
    } else {
      ctx.wizard.state.data.count = ctx.message.text;
      await ctx.reply('Введи номер маршрутного листа (4 цифры без букв)');
      return ctx.wizard.next()
    }
  } catch (error) {
    console.log(error)
    ctx.reply('Упс... Произошла какая - то ошибка');
  }
});

// третий шаг сцены
const result = Telegraf.on('text', async ctx => {
  try {
    if (!/^\d{4}$/.test(ctx.message.text)) {
      await ctx.reply("Введено некорректное значение, повтори ввод (4 цифры)");
    } else {
      ctx.wizard.state.data.numberList = ctx.message.text;
      const { toolCode, count, numberList, userName } = ctx.wizard.state.data;

      // подключение БД
      MongoClient.connect(process.env.CONNECT)
        .then(async client => {
          const db = client.db('botqrbd');
          const dataCollection = db.collection('data');

          const date =new Date(ctx.message.date*1000);
          const dateFormat = moment(date).format('DD.MM.YYYY HH:MM');

          await dataCollection.insertOne({
            "Логин": ctx.message.from.username ? ctx.message.from.username : null,
            "Имя пользователя": userName,
            "Код инструмента": toolCode,
            "Количество": count,
            "Номер маршрутного листа": numberList,
            "Дата": dateFormat,
          })
        });

      await ctx.reply(`Взято ${count} шт. инструмента с кодом ${toolCode} по маршрутному листу №${numberList}`, {...backButtonMenu})
    }
  } catch (error) {
    console.log(error)
    ctx.reply('Упс... Произошла какая - то ошибка');
  }
});

// передаём конструктору название сцены и шаги сцен
const menuSceneSendQR = new Scenes.WizardScene('sendQR', stepOne, stepTwo, result);

menuSceneSendQR.enter();

// вешаем прослушку hears на сцену
menuSceneSendQR.hears('Возврат в меню', ctx => {
  ctx.scene.leave();
  return backMenu(ctx);
})

// экспортируем сцену
module.exports = {
  menuSceneSendQR
};
