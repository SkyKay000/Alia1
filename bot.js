const { Telegraf } = require('telegraf');
const schedule = require('node-schedule');

const bot = new Telegraf('ТВОЙ_ТОКЕН');

let points = [];

// Команда старт
bot.start((ctx) => {
    ctx.reply('Привіт! Надішли мені своє місцезнаходження, щоб я міг показати його на карті.', {
        reply_markup: {
            keyboard: [
                [{ text: "Надіслати місцезнаходження", request_location: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    });
});

// Обробка локації
bot.on('location', (ctx) => {
    const { latitude, longitude } = ctx.message.location;

    // Додавання точки до списку
    const point = {
        user: ctx.from.username,
        latitude,
        longitude,
        time: new Date()
    };
    points.push(point);

    // Відправка повідомлення про додавання точки
    ctx.reply(Точка додана: ${latitude}, ${longitude}. Вона буде доступна 20 хвилин.);

    // Видалення точки через 20 хвилин
    schedule.scheduleJob(new Date(Date.now() + 20 * 60 * 1000), () => {
        points = points.filter(p => p !== point);
        ctx.reply('Точка була видалена.');
    });
});

// Команда для перегляду точок
bot.command('points', (ctx) => {
    if (points.length === 0) {
        ctx.reply('Немає активних точок.');
    } else {
        points.forEach(point => {
            ctx.replyWithLocation(point.latitude, point.longitude, {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Видалити точку', callback_data: delete_${point.latitude}_${point.longitude} }]]
                }
            });
        });
    }
});

// Видалення точки
bot.action(/delete_(.+)_(.+)/, (ctx) => {
    const [latitude, longitude] = ctx.match[1].split('_');
    points = points.filter(p => p.latitude != latitude || p.longitude != longitude);
    ctx.reply('Точка видалена.');
});

bot.launch()
    .then(() => console.log('Бот запущений'))
    .catch((err) => console.error('Помилка при запуску бота:', err));
