/**
 * Magic 8-Ball Command
 * Answers questions with a funny yes/no response and an anime reaction gif.
 */

const axios = require('axios');

const ANSWERS = [
  'Yes! The stars are aligned in your favor. 🌟',
  'Absolutely — go for it! 😎',
  'For sure. Your vibe says yes. ✅',
  'Nope. Not this time. ❌',
  'Nah, that’s not looking great. 🙅',
  'I’d say no, unless you want chaos. 😅',
  'Yes, but with a side of luck. 🍀',
  'No. Save yourself the drama. 🎭',
  'Yes! It feels like a green light. 🟢',
  'Nope. The universe says not now. 🌌'
];

const CATEGORY_TAGS = [
  { name: 'funny', regex: /funny|lol|lmao|rofl|joke|memes?|humor|hilarious/, tag: 'anime funny' },
  { name: 'sad', regex: /sad|cry|depress|broken|heartbroken|tears|misery|lonely|unhappy/, tag: 'anime sad' },
  { name: 'angry', regex: /angry|mad|pissed|furious|rage|hate|annoyed/, tag: 'anime angry' },
  { name: 'love', regex: /love|crush|date|relationship|romance|heart|valentine|boyfriend|girlfriend/, tag: 'anime love' },
  { name: 'happy', regex: /happy|yay|excited|awesome|great|good|awesome|amazing/, tag: 'anime happy' },
  { name: 'surprised', regex: /surprise|surprised|shocked|wow|whoa|amazed/, tag: 'anime surprised' },
  { name: 'confused', regex: /confused|confusion|uncertain|unsure|what|huh|dunno/, tag: 'anime confused' },
  { name: 'nervous', regex: /nervous|anxiety|anxious|worried|scared|fear|afraid/, tag: 'anime nervous' }
];

const TENOR_KEY = 'LIVDSRZULELA';

const detectTag = (question) => {
  const text = question.toLowerCase();
  const found = CATEGORY_TAGS.find(category => category.regex.test(text));
  return found ? found.tag : 'anime reaction';
};

const getGifFromTenor = async (tag) => {
  try {
    const url = `https://g.tenor.com/v1/search?q=${encodeURIComponent(tag)}&key=${TENOR_KEY}&limit=12`;
    const response = await axios.get(url, { timeout: 10000 });
    const results = response.data?.results || [];
    if (!results.length) return null;
    const item = results[Math.floor(Math.random() * results.length)];
    const media = item.media?.[0] || {};

    const mp4Url = media?.mp4?.url || media?.mediumgif?.url || media?.gif?.url || media?.tinygif?.url;
    const type = media?.mp4?.url ? 'mp4' : media?.gif?.url ? 'gif' : null;

    if (!mp4Url || !type) return null;
    return { url: mp4Url, type };
  } catch (error) {
    console.error('[8ball] Tenor fetch failed:', error.message || error);
    return null;
  }
};

const fallbackGif = (tag) => {
  const defaultGifs = {
    funny: 'https://media.tenor.com/1G3ZzLLy5zAAAAAM/anime-laugh.gif',
    sad: 'https://media.tenor.com/3ORzWjGgGggAAAAC/anime-sad.gif',
    angry: 'https://media.tenor.com/ycZG4Yg5B9sAAAAC/anime-angry.gif',
    love: 'https://media.tenor.com/RtbCb9MjEEQAAAAC/anime-love.gif',
    happy: 'https://media.tenor.com/Z0x_Np5jbvMAAAAC/anime-happy.gif',
    surprised: 'https://media.tenor.com/7qxcWEmqf_MAAAAC/anime-surprised.gif',
    confused: 'https://media.tenor.com/2J0s2nxK6_kAAAAC/anime-confused.gif',
    nervous: 'https://media.tenor.com/_6PfI2eeZyEAAAAC/anime-anxious.gif',
    reaction: 'https://media.tenor.com/tCTW5kbqPkQAAAAC/anime-what.gif'
  };

  const key = Object.keys(defaultGifs).find(k => tag.includes(k)) || 'reaction';
  return { url: defaultGifs[key], type: tag === 'anime reaction' ? 'gif' : 'gif' };
};

module.exports = {
  name: '8ball',
  aliases: ['eightball', '8-ball'],
  category: 'fun',
  description: 'Ask the magic 8-ball a question and get a funny yes/no answer with an anime reaction gif.',
  usage: '.8ball <question>',
  async execute(sock, msg, args, extra) {
    try {
      const question = args.join(' ').trim();
      if (!question) {
        return await extra.reply('🎱 Ask me a question like: .8ball Will I pass the test?');
      }

      const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      const tag = detectTag(question);
      let gif = await getGifFromTenor(tag);

      if (!gif) {
        gif = fallbackGif(tag);
      }

      const caption = `🎱 *Magic 8-Ball says...*\n\n${answer}`;

      if (gif.type === 'mp4') {
        await sock.sendMessage(extra.from, {
          video: { url: gif.url },
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption
        }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, {
          image: { url: gif.url },
          caption
        }, { quoted: msg });
      }
    } catch (error) {
      console.error('[8ball] ERROR:', error);
      await extra.reply('❌ Something went wrong while reading the 8-ball. Please try again.');
    }
  }
};