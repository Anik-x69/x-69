const axios = require("axios");

// Format numbers with commas for readability
function fmtNum(n) {
  if (n == null || n === undefined) return "0";
  const x = Number(n);

  // Format with commas for thousands
  if (x >= 1000) {
    const formatted = x.toLocaleString('en-US');
    if (x >= 1_000_000_000) return (x / 1_000_000_000).toFixed(1) + "B";
    if (x >= 1_000_000) return (x / 1_000_000).toFixed(1) + "M";
    if (x >= 1_000) return (x / 1_000).toFixed(1) + "K";
    return formatted;
  }
  return String(x);
}

// Format duration in MM:SS
function fmtDur(sec) {
  sec = Number(sec) || 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Format relative time (e.g., "2 hours ago")
function fmtTimeAgo(timestamp) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

// Video summary for list view
function videoSummary(v, idx) {
  const author = v?.author?.nickname || v?.author?.unique_id || "Unknown";
  const authorVerified = v?.author?.verified ? " ☑️" : "";
  const musicTitle = v?.music_info?.title || "Unknown";
  const musicAuthor = v?.music_info?.author || "Unknown";
  const hasWatermark = v?.wmplay ? "" : " 🚫 No WM";

  return `${idx}. 🎬 ${v?.title?.substring(0, 50) || "No title"}${v?.title?.length > 50 ? '...' : ''}
   👤 ${author}${authorVerified}  •  🌍 ${v?.region || "N/A"}  •  ⏱️ ${fmtDur(v?.duration)}${hasWatermark}
   📊 ${fmtNum(v?.play_count)} 👀  •  ${fmtNum(v?.digg_count)} ❤️  •  ${fmtNum(v?.comment_count)} 💬  •  ${fmtNum(v?.share_count)} 🔁
   🎵 ${musicTitle.substring(0, 30)}${musicTitle.length > 30 ? '...' : ''} — ${musicAuthor}
   ⏰ ${fmtTimeAgo(v?.create_time)}\n`;
}

// Full video details
function videoDetails(v) {
  const authorName = v?.author?.nickname || v?.author?.unique_id || "Unknown";
  const authorHandle = v?.author?.unique_id ? `@${v.author.unique_id}` : "";
  const authorVerified = v?.author?.verified ? " (Verified ☑️)" : "";
  const created = v?.create_time ? new Date(v.create_time * 1000).toLocaleString() : "N/A";
  const mb = v?.size ? (Number(v.size) / (1024 * 1024)).toFixed(2) + " MB" : "N/A";
  const music = v?.music_info;

  const tags = v?.hashtags ? v.hashtags.map(tag => `#${tag}`).join(' ') : 'No tags';
  const quality = v?.resolution ? `${v.resolution.width}x${v.resolution.height}` : 'N/A';

  // Engagement rate calculation
  const playCount = Number(v?.play_count) || 0;
  const likeRate = playCount > 0 ? ((Number(v?.digg_count) || 0) / playCount * 100).toFixed(1) : 0;
  const commentRate = playCount > 0 ? ((Number(v?.comment_count) || 0) / playCount * 100).toFixed(1) : 0;

  return `📱 TikTok Video Details

📄 BASIC INFO
• Title: ${v?.title || "No title"}
• Video ID: ${v?.video_id || "N/A"}
• Duration: ${fmtDur(v?.duration)}
• Quality: ${quality}
• File Size: ${mb}
• Created: ${created} (${fmtTimeAgo(v?.create_time)})

👤 AUTHOR
• Name: ${authorName} ${authorHandle}${authorVerified}
• Region: ${v?.region || "N/A"}
• Followers: ${fmtNum(v?.author?.follower_count || "N/A")}
• Following: ${fmtNum(v?.author?.following_count || "N/A")}

📊 STATISTICS
• Plays: ${fmtNum(v?.play_count)}
• Likes: ${fmtNum(v?.digg_count)} (${likeRate}% rate)
• Comments: ${fmtNum(v?.comment_count)} (${commentRate}% rate)
• Shares: ${fmtNum(v?.share_count)}
• Downloads: ${fmtNum(v?.download_count)}
• Saves: ${fmtNum(v?.collect_count || "N/A")}

🎵 MUSIC
• Title: ${music?.title || "Unknown"}
• Author: ${music?.author || "Unknown"}
• Album: ${music?.album || "N/A"}
• Duration: ${fmtDur(music?.duration || 0)}
• Music URL: ${music?.play_url || music?.play || "N/A"}

🏷️ TAGS & LINKS
• Hashtags: ${tags}
• Video URL (No WM): ${v?.play || "N/A"}
• Video URL (With WM): ${v?.wmplay || "N/A"}
• Cover Image: ${v?.cover || "N/A"}
`;
}

// Multiple API endpoints for better reliability
const API_ENDPOINTS = [
  "https://arychauhann.onrender.com/api/tiktoksearch",
  "https://tiktok-search-api.vercel.app/api/search",
  "https://tiksearch-api.glitch.me/search"
];

module.exports = {
  config: {
    name: "tiksearch",
    aliases: ["tiktok", "tt"],
    version: "5.0",
    author: "Fahad Islam (Api by Aryan Chauhan)",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search and download TikTok videos"
    },
    longDescription: {
      en: "Search TikTok videos with detailed information, multiple quality options, and advanced filtering. Supports downloading videos without watermark."
    },
    category: "media",
    guide: {
      en: "{pn} <query> | [count:1-20]\n{pn} <query> | [count] | [hd/nowm]\nExamples:\n{pn} funny cats | 5\n{pn} dance tutorial | 3 | hd\n{pn} trending | 10 | nowm"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    if (!args[0]) {
      return message.reply(`🔍 TikTok Search Module v5.0

Usage:
• ${this.config.name} <query> - Search videos (default: 5 results)
• ${this.config.name} <query> | <count> - Specify number of results (1-20)
• ${this.config.name} <query> | <count> | <quality> - Add quality preference

Quality Options:
• hd - Prefer HD quality
• nowm - Prefer without watermark
• both - Show both options

Examples:
• ${this.config.name} funny cats | 5
• ${this.config.name} dance tutorial | 3 | hd
• ${this.config.name} trending | 10 | nowm

Reply to the search results with:
• Number (1-10) - Download that video
• info <number> - Get detailed info
• all - Get all videos as a zip
• cancel - Cancel search`);
    }

    const input = args.join(" ").split("|");
    const query = input[0].trim();
    let count = input[1] ? parseInt(input[1].trim()) : 5;
    const quality = input[2] ? input[2].trim().toLowerCase() : "default";

    // Validate count
    if (isNaN(count) || count <= 0) count = 5;
    if (count > 20) count = 20;
    if (count < 1) count = 5;

    try {
      message.reply(`🔍 Searching TikTok for "${query}"... (Fetching ${count} videos)`);

      // Try multiple API endpoints for reliability
      let videos = [];
      let lastError = null;

      for (const endpoint of API_ENDPOINTS) {
        try {
          const url = `${endpoint}?q=${encodeURIComponent(query)}&count=${count}`;
          const res = await axios.get(url, { timeout: 15000 });

          if (res?.data?.data?.videos) {
            videos = res.data.data.videos;
            break;
          } else if (res?.data?.videos) {
            videos = res.data.videos;
            break;
          }
        } catch (err) {
          lastError = err;
          continue; // Try next endpoint
        }
      }

      if (!Array.isArray(videos) || videos.length === 0) {
        throw new Error("No results found or API unavailable");
      }

      // Sort by quality preference
      if (quality === "hd" || quality === "high") {
        videos.sort((a, b) => {
          const aQuality = a.resolution ? a.resolution.width * a.resolution.height : 0;
          const bQuality = b.resolution ? b.resolution.width * b.resolution.height : 0;
          return bQuality - aQuality;
        });
      } else if (quality === "nowm" || quality === "nowatermark") {
        videos = videos.filter(v => v.play && !v.play.includes("watermark"));
      }

      const resultsCount = Math.min(count, videos.length);

      let msg = `📱 TikTok Search Results for "${query}"\n`;
      msg += `📊 Found ${videos.length} videos | Showing ${resultsCount} results\n\n`;

      videos.slice(0, resultsCount).forEach((v, i) => {
        msg += videoSummary(v, i + 1) + "\n";
      });

      msg += `\n🔧 COMMANDS:\n`;
      msg += `• Reply with a number (1-${resultsCount}) to download\n`;
      msg += `• Reply "info <number>" for full details\n`;
      msg += `• Reply "all" to download all as zip (max 5)\n`;
      msg += `• Reply "cancel" to cancel\n`;
      msg += `• Quality: ${quality.toUpperCase()} | ⏰ Expires in 5 minutes`;

      const sentMsg = await message.reply(msg);

      // Store data for reply handling
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: "tiksearch",
        author: event.senderID,
        videos: videos.slice(0, resultsCount),
        searchMsgID: sentMsg.messageID,
        query: query,
        quality: quality,
        timestamp: Date.now()
      });

      // Auto cleanup after 5 minutes (300000 ms)
      setTimeout(() => {
        if (global.GoatBot.onReply.has(sentMsg.messageID)) {
          global.GoatBot.onReply.delete(sentMsg.messageID);
          api.unsendMessage(sentMsg.messageID).catch(() => {});
        }
      }, 300000);

    } catch (error) {
      console.error("TikTok Search Error:", error);
      message.reply(`❌ Error: ${error.message || "Failed to search TikTok videos. Please try again later."}`);
    }
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author) {
      return message.reply("⚠️ This search session belongs to someone else. Please start your own search.");
    }

    // Check if session expired (5 minutes)
    if (Date.now() - Reply.timestamp > 300000) {
      global.GoatBot.onReply.delete(event.messageID);
      return message.reply("⌛ This search session has expired. Please start a new search.");
    }

    const body = (event.body || "").trim().toLowerCase();
    const videos = Reply.videos || [];

    // Handle "cancel" command
    if (body === "cancel") {
      global.GoatBot.onReply.delete(event.messageID);
      if (Reply.searchMsgID) {
        api.unsendMessage(Reply.searchMsgID).catch(() => {});
      }
      return message.reply("✅ Search cancelled.");
    }

    // Handle "info <number>" command
    const infoMatch = body.match(/^info\s+(\d+)$/);
    if (infoMatch) {
      const choice = parseInt(infoMatch[1], 10);
      if (isNaN(choice) || choice < 1 || choice > videos.length) {
        return message.reply(`⚠️ Please choose a number between 1 and ${videos.length}`);
      }
      const v = videos[choice - 1];
      return message.reply(videoDetails(v));
    }

    // Handle "all" command to download all videos
    if (body === "all") {
      const maxVideos = Math.min(5, videos.length);
      message.reply(`📦 Preparing ${maxVideos} videos for download... This may take a moment.`);

      try {
        const attachments = [];
        for (let i = 0; i < maxVideos; i++) {
          const v = videos[i];
          const videoURL = Reply.quality === "nowm" ? (v.play || v.wmplay) : (v.wmplay || v.play);

          if (videoURL) {
            try {
              const response = await axios({
                method: 'GET',
                url: videoURL,
                responseType: 'stream',
                timeout: 30000
              });

              attachments.push({
                type: "video",
                data: response.data,
                name: `tiktok_${v.video_id || i+1}.mp4`
              });
            } catch (err) {
              console.error(`Failed to fetch video ${i+1}:`, err.message);
            }
          }
        }

        if (attachments.length > 0) {
          await message.reply({
            body: `📦 Downloaded ${attachments.length} TikTok videos from search "${Reply.query}"`,
            attachment: attachments
          });
        } else {
          message.reply("❌ Failed to download any videos. Please try downloading individually.");
        }
      } catch (error) {
        console.error("Batch download error:", error);
        message.reply("❌ Error downloading multiple videos. Please try downloading individually.");
      }

      global.GoatBot.onReply.delete(event.messageID);
      return;
    }

    // Handle single number selection for download
    const numMatch = body.match(/^\d+$/);
    if (!numMatch) {
      return message.reply(`⚠️ Invalid command. Please reply with:\n• Number (1-${videos.length}) to download\n• "info <number>" for details\n• "all" for all videos\n• "cancel" to cancel`);
    }

    const choice = parseInt(body, 10);
    if (isNaN(choice) || choice < 1 || choice > videos.length) {
      return message.reply(`⚠️ Please choose a number between 1 and ${videos.length}`);
    }

    const v = videos[choice - 1];

    // Clean up search message
    if (Reply.searchMsgID) {
      api.unsendMessage(Reply.searchMsgID).catch(() => {});
    }

    try {
      message.reply(`⬇️ Downloading video ${choice}/${videos.length}...`);

      // Choose URL based on quality preference
      let videoURL;
      if (Reply.quality === "nowm" || Reply.quality === "nowatermark") {
        videoURL = v.play || v.wmplay; // Prefer without watermark
      } else if (Reply.quality === "hd" || Reply.quality === "high") {
        videoURL = v.hdplay || v.play || v.wmplay; // Prefer HD if available
      } else {
        videoURL = v.wmplay || v.play; // Default: with watermark
      }

      if (!videoURL) {
        throw new Error("No downloadable video URL found");
      }

      // Download video
      const response = await axios({
        method: 'GET',
        url: videoURL,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.tiktok.com/',
          'Accept': '*/*'
        },
        timeout: 45000
      });

      const author = v?.author?.nickname || v?.author?.unique_id || "Unknown";
      const qualityInfo = v.resolution ? ` | ${v.resolution.width}x${v.resolution.height}` : '';
      const watermarkInfo = videoURL === v.play ? " | No Watermark" : "";

      await message.reply({
        body: `✅ Download Complete!

🎬 ${v?.title?.substring(0, 100) || "TikTok Video"}${v?.title?.length > 100 ? '...' : ''}
👤 ${author}
⏱️ ${fmtDur(v?.duration)}${qualityInfo}${watermarkInfo}
📊 ${fmtNum(v?.play_count)} 👀 • ${fmtNum(v?.digg_count)} ❤️
💬 ${fmtNum(v?.comment_count)} • 🔁 ${fmtNum(v?.share_count)}

🔍 Search: ${Reply.query}
📥 Reply "info ${choice}" for full details`,
        attachment: response.data
      });

      // Clean up reply handler
      global.GoatBot.onReply.delete(event.messageID);

    } catch (error) {
      console.error("Video download error:", error);

      // Try fallback URL if first attempt failed
      try {
        const fallbackURL = v.wmplay || v.play;
        if (fallbackURL && fallbackURL !== videoURL) {
          message.reply("🔄 Trying alternative download source...");
          const response = await axios({
            method: 'GET',
            url: fallbackURL,
            responseType: 'stream',
            timeout: 30000
          });

          await message.reply({
            body: `✅ Download Complete! (Using fallback source)\n\nVideo from search: "${Reply.query}"`,
            attachment: response.data
          });

          global.GoatBot.onReply.delete(event.messageID);
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError);
      }

      message.reply(`❌ Download failed: ${error.message || "Network error"}\n\nYou can try:\n1. Searching again\n2. Choosing a different video\n3. Using "info <number>" to check availability`);
    }
  }
};
