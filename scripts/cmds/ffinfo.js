const axios = require('axios');

module.exports = {
  config: {
    name: "ffinfo",
    version: "1.0",
    author: "Mueid Mursalin Rifat",
    countDown: 5,
    role: 0,
    shortDescription: "🎮 Free Fire stats",
    longDescription: "Get complete Free Fire player statistics",
    category: "game",
    guide: "{pn} [UID]\nExample: {pn} 9885725826",
    aliases: ["freefire", "ffstats"]
  },

  onStart: async function({ api, event, args, message }) {
    try {
      const uid = args[0];
      if (!uid) {
        return message.reply(
          `🎮 𝗙𝗿𝗲𝗲 𝗙𝗶𝗿𝗲 𝗜𝗻𝗳𝗼\n━━━━━━━━━━━━━━━━━━━━\n` +
          `📌 𝗨𝘀𝗮𝗴𝗲: .ffinfo [UID]\n` +
          `📍 𝗘𝘅𝗮𝗺𝗽𝗹𝗲: .ffinfo 9885725826\n` +
          `━━━━━━━━━━━━━━━━━━━━\n👨‍💻 ${this.config.author}`
        );
      }

      const waitMsg = await message.reply(`🔍 Fetching FF stats for UID: ${uid}...`);

      const response = await axios.get(`https://shadowx-api.onrender.com/api/ffinfo?uid=${uid}`, { timeout: 15000 });
      const data = response.data;

      if (!data.success) {
        throw new Error("Invalid UID or API error");
      }

      await api.unsendMessage(waitMsg.messageID);

      const acc = data.account;
      const ranks = data.ranks;
      const stats = data.stats;
      const guild = data.guild;
      const badges = data.badges;
      const pet = data.pet;
      const prefs = data.preferences;
      const genderEmoji = acc.gender === "MALE" ? "👨" : "👩";

      const messageBody = 
`🎮 𝗙𝗥𝗘𝗘 𝗙𝗜𝗥𝗘 𝗦𝗧𝗔𝗧𝗦
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 𝗔𝗖𝗖𝗢𝗨𝗡𝗧
${genderEmoji} Name: ${acc.nickname}
🆔 UID: ${acc.uid}
📊 Level: ${acc.level} (${acc.exp.toLocaleString()} XP)
❤️ Likes: ${acc.likes.toLocaleString()}
🏅 Honor Score: ${acc.honor_score}
🎨 Gender: ${acc.gender}
📝 Signature: ${acc.signature || "None"}
📅 Created: ${acc.created_at}
📱 Last Login: ${acc.last_login}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 𝗥𝗔𝗡𝗞𝗦
🎯 BR Rank: ${ranks.br_rank}
📊 BR Points: ${ranks.br_points}
🎯 BR Max Rank: ${ranks.br_max_rank}

⚔️ CS Rank: ${ranks.cs_rank}
📊 CS Points: ${ranks.cs_points}
⚔️ CS Max Rank: ${ranks.cs_max_rank}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏅 𝗦𝗢𝗟𝗢 𝗦𝗧𝗔𝗧𝗦
🎮 Matches: ${stats.solo.games_played}
🏆 Wins: ${stats.solo.wins} (${stats.solo.win_rate})
💀 Kills: ${stats.solo.kills} | KD: ${stats.solo.kd_ratio}
🔫 Headshots: ${stats.solo.headshots}
🎯 Top 10: ${stats.solo.top_10}
🏆 Highest Kills: ${stats.solo.highest_kills}
💥 Damage: ${(stats.solo.total_damage / 1000).toFixed(1)}K
⏱️ Survival: ${Math.floor(stats.solo.survival_time / 60)} min

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 𝗗𝗨𝗢 𝗦𝗧𝗔𝗧𝗦
🎮 Matches: ${stats.duo.games_played}
🏆 Wins: ${stats.duo.wins} (${stats.duo.win_rate})
💀 Kills: ${stats.duo.kills} | KD: ${stats.duo.kd_ratio}
🔄 Revives: ${stats.duo.revives}
🎯 Top 10: ${stats.duo.top_10}
🏆 Highest Kills: ${stats.duo.highest_kills}
💥 Damage: ${(stats.duo.total_damage / 1000).toFixed(1)}K

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 𝗦𝗤𝗨𝗔𝗗 𝗦𝗧𝗔𝗧𝗦
🎮 Matches: ${stats.squad.games_played}
🏆 Wins: ${stats.squad.wins} (${stats.squad.win_rate})
💀 Kills: ${stats.squad.kills} | KD: ${stats.squad.kd_ratio}
🔫 Headshots: ${stats.squad.headshots}
🔄 Revives: ${stats.squad.revives}
💀 Knock Downs: ${stats.squad.knock_downs}
🎯 Top 10: ${stats.squad.top_10}
🏆 Highest Kills: ${stats.squad.highest_kills}
💥 Damage: ${(stats.squad.total_damage / 1000).toFixed(1)}K

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ 𝗚𝗨𝗜𝗟𝗗
📛 Name: ${guild.guild_name || "No Guild"}
🆔 ID: ${guild.guild_id || "N/A"}
📊 Level: ${guild.guild_level || 0}
👥 Members: ${guild.members || 0}/${guild.capacity || 0}
👑 ${guild.is_leader === "Yes" ? "Guild Leader 👑" : "Member"}

${guild.is_leader === "Yes" ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 𝗚𝗨𝗜𝗟𝗗 𝗟𝗘𝗔𝗗𝗘𝗥
📛 ${guild.leader.name}
🆔 ${guild.leader.uid}
📊 Level ${guild.leader.level}
🎯 BR Rank: ${guild.leader.br_rank}
⚔️ CS Rank: ${guild.leader.cs_rank}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐾 𝗣𝗘𝗧
${pet.equipped === "Yes" ? "✅ Pet Equipped" : "❌ No Pet Equipped"}
${pet.equipped === "Yes" ? `• Level: ${pet.pet_level}
• XP: ${pet.pet_exp}
• Pet ID: ${pet.pet_id}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎖️ 𝗕𝗔𝗗𝗚𝗘𝗦 & 𝗣𝗥𝗢𝗙𝗜𝗟𝗘
🏅 Total Badges: ${badges.total_badges}
🎭 Evo Badge: ${badges.evo_badge_id}
📜 Title ID: ${badges.title_id}
👑 Celebrity: ${badges.celebrity_status.replace(/_/g, ' ')}
🎮 Skills: ${data.profile.equipped_skills_count}
🎨 Skin Color: ${data.profile.skin_color}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ 𝗣𝗥𝗘𝗙𝗘𝗥𝗘𝗡𝗖𝗘𝗦
🎯 Mode: ${prefs.mode_prefer}
🏆 Rank Show: ${prefs.rank_show}
🌐 Language: ${prefs.language}
🔫 Version: OB${data.release_version}
🌍 Region: ${data.region}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Powered by Anik Islam Sadik
👨‍💻 ${this.config.author}`;

      // Split message if too long
      if (messageBody.length > 4000) {
        const parts = messageBody.match(/[\s\S]{1,4000}/g);
        for (const part of parts) {
          await message.reply(part);
        }
      } else {
        await message.reply(messageBody);
      }

    } catch (error) {
      console.error("FF Info Error:", error);
      try {
        if (waitMsg) await api.unsendMessage(waitMsg.messageID);
      } catch(e) {}
      message.reply(`❌ Failed to fetch FF stats.\n🔍 Check UID and try again.`);
    }
  }
};
