import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from "dotenv";


dotenv.config();

const botToken = process.env.BOT_TOKEN;
const youtubeApiKey = process.env.YOUTUBE_API_KEY;

const bot = new TelegramBot(botToken, {polling: true});


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  let channelName = msg.text

 channelName = channelName.replace(/ /g, '');

  if (!channelName) {
    bot.sendMessage(chatId, 'Desculpe, não foi possível encontrar esse canal');
    return;
  }

  const channelId = await getChannelIdFromLink(channelName)

  getVideosFromChannel(channelId)
    .then((videos) => {
      if (!videos) {
        bot.sendMessage(chatId, 'Desculpe, não foi possível obter vídeos desse canal.');
        return;
      }
      const videoLinks = videos.map((video) => `https://www.youtube.com/watch?v=${video}`);
      const message = `Aqui estão os links para os últimos ${videos.length} vídeos desse canal: \n\n${videoLinks.join('\n')}`;

      bot.sendMessage(chatId, message);
    })
    .catch((error) => {
      bot.sendMessage(chatId, 'Desculpe, houve um erro ao obter vídeos desse canal.');
      console.error(error.message);
    });
});


async function getChannelIdFromLink(link) {
  try{
    const channelName = link
  const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=id%2Csnippet&maxResults=10&q=${channelName}&type=channel&key=${youtubeApiKey}`);
  return response.data.items[0].id.channelId;
  } catch (error) {
    console.error(error.message);
  }
}

async function getVideosFromChannel(channelId) {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=50&key=${youtubeApiKey}`);
    const videoIds = response.data.items.map(item => item.id.videoId);
    return videoIds;
  } catch (error) {
    console.error(error.message);
  }
}

