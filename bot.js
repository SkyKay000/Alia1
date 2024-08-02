const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const PointSchema = new mongoose.Schema({
  userId: String,
  lat: Number,
  lng: Number
});

const Point = mongoose.model('Point', PointSchema);

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! Send your location to mark a point.");
});

bot.on('location', (msg) => {
  const { id: userId } = msg.chat;
  const { latitude: lat, longitude: lng } = msg.location;

  const newPoint = new Point({ userId, lat, lng });

  newPoint.save()
    .then(() => {
      bot.sendMessage(userId, "Location saved successfully!");
    })
    .catch(err => {
      bot.sendMessage(userId, "Failed to save location.");
    });
});

const app = express();
app.use(bodyParser.json());

app.get('/points', async (req, res) => {
  try {
    const points = await Point.find();
    res.json(points);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(Server running on port ${port});
});
