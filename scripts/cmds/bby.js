const axios = require('axios');

const baseApiUrl = "https://noobs-api.top/dipto/baby";

module.exports = {
  config: {
    name: "bby",
    version: "10.0.0",
    author: "Anik Islam Sadik (edit by fahad)",
    countDown: 0,
    role: 0,
    description: "High-speed bot with extra dialogues and fixed mentions",
    category: "fun",
    guide: { en: "{pn} [text]" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    try {
      const name = await usersData.getName(senderID);
      if (!args[0]) {
        return api.sendMessage({
          body: `「 ${name} 」\nবলুন আমি "বট" আপনাকে কিভাবে সাহায্য করতে পারি?`,
          mentions: [{ tag: name, id: senderID }]
        }, threadID, messageID);
      }

      if (args[0] === 'teach') {
        const [q, a] = args.slice(1).join(" ").split(/\s*-\s*/);
        if (!q || !a) return api.sendMessage("⚠️ Format: teach ask - reply", threadID, messageID);
        const { data } = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(q)}&reply=${encodeURIComponent(a)}&senderID=${senderID}`);
        return api.sendMessage(`✅ Added: ${data.message}`, threadID, messageID);
      }

      const { data } = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(args.join(" "))}&senderID=${senderID}&font=1`);
      return api.sendMessage(data.reply, threadID, (err, info) => {
        if (global.GoatBot?.onReply) global.GoatBot.onReply.set(info.messageID, { commandName: "bby", messageID: info.messageID, author: senderID });
      }, messageID);
    } catch { return api.sendMessage("API Busy!", threadID, messageID); }
  },

  onReply: async ({ api, event }) => {
    if (api.getCurrentUserID() == event.senderID) return;
    try {
      const { data } = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(event.body)}&senderID=${event.senderID}&font=1`);
      api.sendMessage(data.reply, event.threadID, (err, info) => {
        if (global.GoatBot?.onReply) global.GoatBot.onReply.set(info.messageID, { commandName: "bby", messageID: info.messageID, author: event.senderID });
      }, event.messageID);
    } catch (err) {}
  },

  onChat: async ({ api, event, usersData }) => {
    const { body, senderID, threadID, messageID } = event;
    if (!body) return;
    const lowerBody = body.toLowerCase();

    // নির্দিষ্ট কি-ওয়ার্ডগুলো চেক করার জন্য অ্যারে এবং কন্ডিশন
    const triggerWords = ["bot", "বট", "baby", "babu", "bby", "jan", "alya", "hinata"];
    const matchedWord = triggerWords.find(word => lowerBody.startsWith(word));

    if (matchedWord) {
      // মেসেজ থেকে ট্রিগার ওয়ার্ডটি বাদ দিয়ে মূল টেক্সট বের করা
      const regex = new RegExp(`^${matchedWord}\\s*`, "i");
      const text = body.replace(regex, "").trim();

      if (!text) {
        const name = await usersData.getName(senderID);
        const randomReplies = [
          "-𝙂𝙖𝙮𝙚𝙨-🤗-যৌবনের কসম দিয়ে আমারে 𝐁𝐥𝐚𝐜𝐤𝐦𝐚𝐢𝐥 করা হচ্ছে-🥲🤦🏻", "𝙸 𝙻𝚘𝚟𝚎 𝚈𝚘𝚞 𝚇𝚊𝚊'𝚗 💋🫣", "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 𝗫𝗮𝗮'𝗻 বলো-🫣🥺",
          " -আম গাছে আম নাই ঢিল কেন মারো-🙄-তোমার সাথে প্রেম নাই-🥺-বেবি কেন ডাকো-😐🤭",
          "-মন সুন্দর বানাও-🤗-মুখের জন্য snapchat তো আছেই-🙂👻", "-আমি তোমার সিনিয়র আপু ওকে-😼-সম্মান দেও-😽🤗",
          "-এই এই তোর পরীক্ষা কবে?_শুধু 𝗕𝗯𝘆 𝗯𝗯𝘆 করিস-😾🫡", "-তোরা যে হারে 𝗕𝗯𝘆 ডাকছিস আমিতো সত্যি বাচ্চা হয়ে যাবো-☹️🤭",
          "শুনবো না😼তুমি আমাকে প্রেম করাই দাও নাই🥺পচা তুমি🥺", "-কতদিন হয়ে গেলো বিছানায় মুতি না-😿-মিস ইউ নেংটা কাল-🥺🤧",
          "𝗢𝗶𝗶 ঘুমানোর আগে তোমার মনটা কোথায় রেখে ঘুমাও..!!🤔_নাহ মানে একটু চুরি করতাম-😘🍓", "তুই এত স্মার্ট না-🤧-গুগলও তোকে সার্চ দিলে ভাবে “𝗔𝗿𝗲 𝘆𝗼𝘂 𝘀𝘂𝗿𝗲?”😹🐸",
          "-তোর বাড়ি কি মালদ্বীপ গ্রাম-🙂🏡", "  🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপাই গেছো না-🥺😴",
          "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇", "-𝗢𝗶𝗶 মামা_আর ডাকিস না প্লিজ ৩২ তারিখ আমার বিয়ে-🥹🐤",
          "ও মিম ও মিম-😇-তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম-🌚🤧", "𝗛𝗮𝗮 জানু_এইদিক এ আসো 𝗞𝗶𝘀𝘀 দেই-🤭 😘",
          "-তোর তো বিয়ে হয় নাই বেবি পাইলি কই-🤦🏻-পরকিয়া করছোছ নাকি শালা-🥲🤧", "-আমাকে বেশি ডাকলে_আমি কিন্তু 𝗞𝗶𝘀𝘀 করে দেবো-😘🥱",
          "-বেশি বেবি বেবি করলে এমন লাথি দিমু বংশের বাতি নিভে যাবে-😾😎"
        ];
        const rand = randomReplies[Math.floor(Math.random() * randomReplies.length)];

        return api.sendMessage({
          body: `「 ${name} 」\n\n${rand}`,
          mentions: [{ tag: name, id: senderID }]
        }, threadID, (err, info) => {
          if (global.GoatBot?.onReply) global.GoatBot.onReply.set(info.messageID, { commandName: "bby", messageID: info.messageID, author: senderID });
        }, messageID);
      }

      try {
        const { data } = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(text)}&senderID=${senderID}&font=1`);
        api.sendMessage(data.reply, threadID, (err, info) => {
          if (global.GoatBot?.onReply) global.GoatBot.onReply.set(info.messageID, { commandName: "bby", messageID: info.messageID, author: senderID });
        }, messageID);
      } catch (err) {}
    }
  }
};
