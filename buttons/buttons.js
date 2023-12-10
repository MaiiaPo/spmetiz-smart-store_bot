const { Markup } = require('telegraf');

// основное меню
const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback('Получить данные', 'excelDayButton')],
  [Markup.button.callback('Возврат в меню', 'backMenuButton')],
])

// возврат
const backButtonMenu =
  Markup.inlineKeyboard([
    Markup.button.callback('Возврат в меню', 'backMenuButton'),
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
