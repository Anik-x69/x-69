const axios = require("axios");

module.exports = {
	config: {
		name: "leave2",
		version: "1.0",
		author: "YeasiN",
		category: "events"
	},

	onStart: async ({ threadsData, message, event, api, usersData }) => {
		if (event.logMessageType !== "log:unsubscribe") return;

		const { threadID } = event;
		const threadData = await threadsData.get(threadID);
		if (!threadData?.settings?.sendLeaveMessage) return;

		const { leftParticipantFbId } = event.logMessageData;
		if (leftParticipantFbId == api.getCurrentUserID()) return;

		const userName = await usersData.getName(leftParticipantFbId);

		const isKicked = leftParticipantFbId != event.author;
		if (!isKicked) return;

		const text = `👉 ${userName} nigga was kicked from the group`;

		try {
			await message.send({
				body: text,
				mentions: [{ tag: userName, id: leftParticipantFbId }]
			});
		} catch (err) {
			console.error("Kickmem message failed to send:", err.message);
		}
	}
};
