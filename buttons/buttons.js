const { Markup } = require('telegraf');

// основное меню
const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback('Отправить QR', 'sendQRButton')],
  [
    Markup.button.callback('Данные за вчера', 'excelYesterdayButton'),
    Markup.button.callback('Данные за сегодня', 'excelTodayButton')
  ]
])

// возврат
const backButtonMenu =
  Markup.inlineKeyboard([
    Markup.button.callback('Возврат в основное меню', 'backMenuButton'),
  ])


// запуск бота
const startCallbackButton =
  Markup.inlineKeyboard([
    Markup.button.callback(
      'Старт',
      'test_callback'
    ),
  ]).resize()

module.exports = {
  mainMenu,
  backButtonMenu,
  startCallbackButton
}
