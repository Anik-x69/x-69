const axios = require("axios");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

const getCatboxApiUrl = async () => {
    try {
        const configRes = await axios.get(nix);
        const baseUrl = configRes.data?.api;
        
        if (!baseUrl) {
            throw new Error("Missing 'api' base URL in GitHub JSON.");
        }
        
        return `${baseUrl}/catbox`; 
    } catch (error) {
        throw new Error(`Failed to load Catbox API configuration from JSON: ${error.message}`);
    }
};

module.exports = {
  config: {
    name: "catbox",
    version: "0.0.1",
    author: "ArYAN",
    description: {
      en: "Uploads an image to Catbox and returns the direct link"
    },
    guide: {
      en: "Reply to an image with catbox"
    },
    category: "utility",
    countDown: 5,
    role: 0
  },

  onStart: async function ({ api, event }) {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0 || event.messageReply.attachments[0].type !== "photo") return;

    let apiUrl;
    try {
        apiUrl = await getCatboxApiUrl();
    } catch (e) {
        return api.sendMessage(`❌ API Load Error: ${e.message}`, event.threadID, event.messageID);
    }

    const a = event.messageReply.attachments[0].url;

    api.setMessageReaction("⌛", event.messageID, (b) => { if (b) console.error(b); });

    try {
      const c = `${apiUrl}?imageUrl=${encodeURIComponent(a)}`;
      const { data: d } = await axios.get(c, { timeout: 45000 });

      if (d && d.uploadedUrl) {
        api.setMessageReaction("✅", event.messageID, (b) => { if (b) console.error(b); });
        api.sendMessage(`${d.uploadedUrl}`, event.threadID, event.messageID);
      }

    } catch (e) {
        api.setMessageReaction("❌", event.messageID, (b) => { if (b) console.error(b); });
    }
  }
};
