const axios = require('axios');

// Dynamic API URL fetch
const getBaseApiUrl = async () => {
    try {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
    } catch (e) {
        return "https://noobs-api.top";
    }
};

// Triggers: bby & bot
const triggerWords = ["bby", "বট", "baby", "babu", "jan", "alya", "hinata"];

module.exports = {
    config: {
        name: "bby",
        version: "12.0.0",
        author: "Anik Islam Sadik",
        countDown: 0,
        role: 0,
        description: "Bot responds to 'bby' or 'bot' with funny Bangla dialogues.",
        category: "fun",
        guide: { 
            en: "{pn} [text]\n{pn} teach [q] - [a]\n{pn} list" 
        }
    },

    onStart: async function ({ api, event, args, usersData, commandName }) {
        const { threadID, messageID, senderID } = event;
        const baseUrl = await getBaseApiUrl();
        try {
            const name = await usersData.getName(senderID);

            if (!args[0]) {
                return api.sendMessage({
                    body: `「 ${name} 」\nবলুন আমি "Bby/Bot" আপনাকে কিভাবে সাহায্য করতে পারি? 😘`,
                    mentions: [{ tag: name, id: senderID }]
                }, threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                }, messageID);
            }

            const action = args[0].toLowerCase();

            if (action === "teach") {
                const input = args.slice(1).join(" ");
                const [trigger, ...responsesArr] = input.split(" - ");
                const responses = responsesArr.join(" - ");
                if (!trigger || !responses) return api.sendMessage("⚠️ Format: teach ask - reply", threadID, messageID);
                const res = await axios.post(`${baseUrl}/api/jan/teach`, { trigger, responses, userID: senderID });
                return api.sendMessage(`✅ Added: ${trigger} -> ${responses}`, threadID, messageID);
            }

            const res = await axios.post(`${baseUrl}/api/hinata`, { 
                text: args.join(" "), 
                style: 3, 
                attachments: event.attachments || [] 
            });
            return api.sendMessage(res.data.message, threadID, (err, info) => {
                if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
            }, messageID);

        } catch (err) {
            return api.sendMessage("API Busy! ❌", threadID, messageID);
        }
    },

    onReply: async function ({ api, event, commandName }) {
        if (api.getCurrentUserID() == event.senderID) return;
        try {
            const baseUrl = await getBaseApiUrl();
            const res = await axios.post(`${baseUrl}/api/hinata`, { 
                text: event.body?.toLowerCase() || "হাই", 
                style: 3, 
                attachments: event.attachments || [] 
            });
            return api.sendMessage(res.data.message, event.threadID, (err, info) => {
                if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: event.senderID });
            }, event.messageID);
        } catch (err) {}
    },

    onChat: async function ({ api, event, usersData, commandName }) {
        const { body, senderID, threadID, messageID } = event;
        if (!body) return;
        const lowerBody = body.toLowerCase();

        if (triggerWords.some(word => lowerBody.startsWith(word))) {
            const text = body.replace(/^(bby|bot)\s*/i, "").trim();

            if (!text) {
                const name = await usersData.getName(senderID);
                const randomReplies = [
                    "-𝙂𝙖𝙮𝙚𝙨-🤗-যৌবনের কসম দিয়ে আমারে 𝐁𝐥𝐚𝐜𝐤𝐦𝐚𝐢𝐥 করা হচ্ছে-🥲🤦🏻", "-বেশি বেবি বেবি করলে এমন লাথি দিমু বংশের বাতি নিভে যাবে-😾😎", "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 𝗫𝗮𝗮'𝗻 বলো-🫣🥺",
                    "-আম গাছে আম নাই ঢিল কেন মারো-🙄-তোমার সাথে প্রেম নাই-🥺-বেবি কেন ডাকো-😐🤭", "-মন সুন্দর বানাও-🤗-মুখের জন্য snapchat তো আছেই-🙂👻",
                    "-আমি তোমার সিনিয়র আপু ওকে-😼-সম্মান দেও-😽🤗", "-এই এই তোর পরীক্ষা কবে?_শুধু 𝗕𝗯𝘆 𝗯𝗯𝘆 করিস-😾🫡",
                    "শুনবো না😼তুমি আমাকে প্রেম করাই দাও নাই🥺পচা তুমি🥺", "-কতদিন হয়ে গেলো বিছানায় মুতি না-😿-মিস ইউ নেংটা কাল-🥺🤧",
                    "-তোরা যে হারে 𝗕𝗯𝘆 ডাকছিস আমিতো সত্যি বাচ্চা হয়ে যাবো-☹️🤭", "তোর বাড়ি কি মাল দিপ গ্রামে? 😵‍💫",
                    "𝗢𝗶𝗶 ঘুমানোর আগে তোমার মনটা কোথায় রেখে ঘুমাও..!!🤔_নাহ মানে একটু চুরি করতাম-😘🍓", "তুই এত স্মার্ট না-🤧-গুগলও তোকে সার্চ দিলে ভাবে “𝗔𝗿𝗲 𝘆𝗼𝘂 𝘀𝘂𝗿𝗲?”🐸",
                    "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপাই গেছো না-🥺😴", "-তোর বাড়ি কি মালদ্বীপ গ্রাম-🙂🏡",
                    "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇", "-𝗢𝗶𝗶 মামা_আর ডাকিস না প্লিজ ৩২ তারিখ আমার বিয়ে-🥹🐤",
                    "ও মিম ও মিম-😇-তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম-🌚🤧", "𝗛𝗮𝗮 জানু_এইদিক এ আসো 𝗞𝗶𝘀𝘀 দেই-🤭😘",
                    "-আমাকে বেশি ডাকলে_আমি কিন্তু 𝗞𝗶𝘀𝘀 করে দেবো-😘🥱", "-তোর তো বিয়ে হয় নাই বেবি পাইলি কই-🤦🏻-পরকিয়া করছোছ নাকি শালা-🥲🤧", "-বেশি বেবি বেবি করলে এমন লাথি দিমু বংশের বাতি নিভে যাবে-😾😎"];
                const rand = randomReplies[Math.floor(Math.random() * randomReplies.length)];

                return api.sendMessage({
                    body: `「 ${name} 」\n\n${rand}`,
                    mentions: [{ tag: name, id: senderID }]
                }, threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                }, messageID);
            }

            try {
                const baseUrl = await getBaseApiUrl();
                const { data } = await axios.post(`${baseUrl}/api/hinata`, { text: text, style: 3 });
                api.sendMessage(data.message, threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                }, messageID);
            } catch (err) {}
        }
    }
};
