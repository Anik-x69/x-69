module.exports = {
	config: {
		name: "goiadmin",
		author: "NIsAN",
		role: 0,
		shortDescription: " ",
		longDescription: "",
		category: "BOT",
		guide: "{pn}"
	},

onChat: function({ api, event }) {
	if (event.senderID !== "61574478201014") {
		var aid = ["61574478201014"];
		for (const id of aid) {
		if ( Object.keys(event.mentions) == id) {
			var msg = ["𝚂𝙰𝙳𝙸𝙺 বস এখন বিজি জা বলার আমার সাথে বলতে পারেন_!!😘🥰", "𝙸 𝙻𝚘𝚟𝚎 𝚈𝚘𝚞 𝙱𝚊𝚋𝚢 💋🙂", "বলো baby কি করতে পারি তোমার জন্য 😽🎀", "Mention দিস না পারলে 🆂︎🅰︎🅳︎🅸︎🅺︎ বসকে Friend request de...!!!😁🙃", "Mention দিস না বস এখন তার হবু বউ 𝙱𝚁𝙸𝚂𝚃𝚈𝚁 সাথে রোমান্টিক mood এ আছে"...!!!🥵🙈💋"];
			return api.sendMessage({body: msg[Math.floor(Math.random()*msg.length)]}, event.threadID, event.messageID);
		}
		}}
},
onStart: async function({}) {
	}
};
