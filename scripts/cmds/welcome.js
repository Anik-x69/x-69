const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "welcome",
    version: "2.2",
    author: "Ew'r Saim (editor by Fahad Islam)",
    category: "events"
  },

  onStart: async function ({ event, api, threadsData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const newUsers = logMessageData.addedParticipants;
    const botID = api.getCurrentUserID();

    if (newUsers.some(u => u.userFbId === botID)) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName;
    const memberCount = threadInfo.participantIDs.length;

    const tmpDir = path.join(__dirname, "cache");
    fs.ensureDirSync(tmpDir);

    const backgrounds = [
      "https://files.catbox.moe/iywqeh.jpg",
      "https://files.catbox.moe/ilcdfk.jpg",
      "https://files.catbox.moe/9rr7hm.jpg",
      "https://files.catbox.moe/y54nii.jpg",
      "https://files.catbox.moe/n6auag.jpg",
      "https://files.catbox.moe/jhvwkx.jpg"
    ];

    const avatarSize = 180;

    for (const user of newUsers) {
      const userId = user.userFbId;
      const fullName = user.fullName;

      try {
        // Download avatar
        const avatarURL = `https://graph.facebook.com/${userId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatarPath = path.join(tmpDir, `avt_${userId}.png`);
        const avatarRes = await axios.get(avatarURL, { responseType: "arraybuffer" });
        fs.writeFileSync(avatarPath, Buffer.from(avatarRes.data));

        // Download random background
        const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        const bgPath = path.join(tmpDir, `bg_${userId}.jpg`);
        const bgRes = await axios.get(bgURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, Buffer.from(bgRes.data));

        const avatar = await loadImage(avatarPath);
        const background = await loadImage(bgPath);

        // Canvas
        const W = 983, H = 480;
        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext("2d");

        // Draw background
        ctx.drawImage(background, 0, 0, W, H);

        // Draw glowing avatar
        const ax = (W - avatarSize) / 2;
        const ay = 40;
        const r = avatarSize / 2;

        for (let i = 4; i >= 0; i--) {
          ctx.beginPath();
          ctx.arc(ax + r, ay + r, r + i * 4, 0, Math.PI * 2);
          const glowColor = ["#00ffff", "#00ccff", "#0099cc", "#005577"][i] || "#ffffff";
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 2;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 20 + i * 4;
          ctx.stroke();
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ax + r, ay + r, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, ax, ay, avatarSize, avatarSize);
        ctx.restore();

        // Text
        ctx.textAlign = "center";

        ctx.font = "bold 42px Arial";
        ctx.fillStyle = "#00ffff";
        ctx.shadowColor = "#00ccff";
        ctx.shadowBlur = 25;
        ctx.fillText(`Hello ${fullName}`, W / 2, 280);

        ctx.font = "bold 34px Arial";
        ctx.fillStyle = "#ff99cc";
        ctx.shadowColor = "#cc6699";
        ctx.shadowBlur = 20;
        ctx.fillText(`Welcome to ${groupName}`, W / 2, 330);

        ctx.font = "30px Arial";
        ctx.fillStyle = "#ffff99";
        ctx.shadowColor = "#cccc66";
        ctx.shadowBlur = 20;
        ctx.fillText(`You're the ${memberCount} member, please enjoy🎉!`, W / 2, 375);

        ctx.font = "28px monospace";
        ctx.fillStyle = "#bbbbbb";
        ctx.shadowBlur = 0;
        ctx.fillText("━━━━━━━━━━━━━━━━", W / 2, 415);

        const timeStr = moment().tz("Asia/Dhaka").format("[📅] hh:mm:ss A - DD/MM/YYYY - dddd");
        ctx.font = "20px Arial";
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText(timeStr, W / 2, 455);

        // Save canvas
        const outputPath = path.join(tmpDir, `welcome_card_${userId}.png`);
        fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

        // Send message
        const messageText = `👋𝖧𝖾𝗅𝗅𝗈 ${fullName}\n🎀𝖶𝖾𝗅𝖼𝗈𝗆𝖾 𝗍𝗈 ${groupName}\n🎇𝖸𝗈𝗎'𝗋𝖾' 𝗍𝗁𝖾 ${memberCount} 𝗆𝖾𝗆𝖻𝖾𝗋 𝗈𝗇 𝗍𝗁𝗂𝗌 𝗀𝗋𝗈𝗎𝗉 𝗉𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗃𝗈𝗒🎉\n━━━━━━━━━━━━━━━━\n${timeStr}`;
        await api.sendMessage({
          body: messageText,
          attachment: fs.createReadStream(outputPath),
          mentions: [{ tag: fullName, id: userId }]
        }, threadID);

        // Cleanup
        fs.unlinkSync(avatarPath);
        fs.unlinkSync(bgPath);
        setTimeout(() => fs.unlink(outputPath).catch(() => {}), 60000);

      } catch (err) {
        console.error(`⚠️ Error generating welcome image for user ${userId}:`, err);
      }
    }
  }
};
