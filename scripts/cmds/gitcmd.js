const axios = require("axios");

module.exports.config = {
 name: "gitcmd",
 version: "1.0",
 author: "Saimx69x",
 role: 2,
 description: "Add or delete bot commands directly from GitHub repo",
 category: "owner",
 guide: {
 en: "/gitcmd add fileName.js <content>\n/gitcmd delete fileName.js"
 }
};

exports.onStart = async function ({ api, event, args }) {
 if (args.length < 2)
 return api.sendMessage("❌ Usage:\n/gitcmd add fileName.js code...\n/gitcmd delete fileName.js",
 event.threadID, event.messageID);

 const action = args[0].toLowerCase();
 const fileName = args[1];

 if (!fileName.endsWith(".js"))
 return api.sendMessage("❌ File name must end with .js", event.threadID, event.messageID);

 const GITHUB_USERNAME = "Your_Github_Username";
 const REPO = "Your_Repo_Name";
 const TOKEN = "ghp_xxxxxxxxxxxxxxxxx"; //your_repo_acces-tokem
 const BRANCH = "main";

 const FILE_PATH = `scripts/cmds/${fileName}`;
 const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO}/contents/${FILE_PATH}`;

 const headers = {
 Authorization: `token ${TOKEN}`,
 "Content-Type": "application/json"
 };

 try {

 if (action === "add") {
 const content = args.slice(2).join(" ");

 if (!content)
 return api.sendMessage("❌ Please provide file content.", event.threadID, event.messageID);

 const encodedContent = Buffer.from(content).toString("base64");

 const res = await axios.put(
 API_URL,
 {
 message: `Add command: ${fileName}`,
 content: encodedContent,
 branch: BRANCH
 },
 { headers }
 );

 return api.sendMessage(
 `✅ Command added successfully:\n📄 ${fileName}`,
 event.threadID,
 event.messageID
 );
 }

 if (action === "delete") {
 const getFile = await axios.get(API_URL, { headers });
 const fileSHA = getFile.data.sha;

 await axios.delete(API_URL, {
 headers,
 data: {
 message: `Delete command: ${fileName}`,
 sha: fileSHA,
 branch: BRANCH
 }
 });

 return api.sendMessage(
 `✅ Command deleted successfully:\n🗑 ${fileName}`,
 event.threadID,
 event.messageID
 );
 }

 return api.sendMessage("❌ Invalid action.\nUse: add / delete", event.threadID, event.messageID);


 } catch (error) {
 console.error(error?.response?.data);

 return api.sendMessage(
 "❌ GitHub Error! Check token/repo/path.\nDetails logged in console.",
 event.threadID,
 event.messageID
 );
 }
};
