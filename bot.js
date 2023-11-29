const { Telegraf } = require('telegraf')
const { MongoClient } = require('mongodb');
const { session } = require('telegraf-session-mongodb');
const minimist = require('minimist')
const Jimp = require('jimp')
const jsQR = require('jsqr')

require('dotenv').config();

// подключение бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// подключение БД
MongoClient.connect('mongodb://localhost:27017/botqrbd')
  .then(client => {
    const db = client.db('botqrbd');
    const dataCollection = db.collection('data');

    //bot.use(session(db, { collectionName: 'sessions' }));

    async function tryParse(url) {
      const image = await Jimp.read(url.href)
      // a bit of preprocessing helps on QR codes with tiny details
      image.normalize()
      image.scale(2)
      const value = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height)
      if (value) {
        return value.data || String.fromCharCode.apply(null, value.binaryData)
      }
    }

    async function onPhoto(ctx) {
      try {
        const photos = ctx.message.photo
        const photo = photos[photos.length - 1]
        const fileId = photo.file_id
        const url = await bot.telegram.getFileLink(fileId)
        const toolCode = await tryParse(url)
        // todo записывать количество (шт) и номер маршрутной квитанции

        await dataCollection.insertOne({
          user: ctx.message.from.username,
          toolCode: toolCode,
          dateTime: ctx.message.date,
        })
        if (!toolCode) {
          ctx.reply('QR код не определен :(')
        } else {
          ctx.reply(`Вы взяли инструмент с кодом ${toolCode}`)
        }
      } catch (error) {
        ctx.reply('' + error)
      }
    }

    bot.start(ctx => ctx.reply('Отправьте QR код'))
    bot.on('photo', onPhoto)
    bot.launch()
  });
