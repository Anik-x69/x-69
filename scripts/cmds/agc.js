const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "agc",
		version: "1.0",
		author: "Mueid Mursalin Rifat",
		countDown: 5,
		role: 2,
		description: {
			en: "Auto accept friend requests and add to specific thread"
		},
		category: "utility",
		guide: {
			en: "{pn} [accept|reject|list] [number|all]"
		}
	},

	langs: {
		en: {
			alreadyInGroup: "Already in group",
			successAdd: "✅ Successfully added %1 members to the group",
			failedAdd: "❌ Failed to add %1 members to the group",
			cannotAddUser: "Bot is blocked or user blocked adding to groups"
		}
	},

	onReply: async function ({ message, Reply, event, api, commandName }) {
		const { author, listRequest, messageID, threadID } = Reply;
		if (author !== event.senderID) return;
		
		const args = event.body.trim().toLowerCase().split(/\s+/);
		const targetThreadID = "1215517716999247"; // Fixed thread ID

		clearTimeout(Reply.unsendTimeout);

		const form = {
			av: api.getCurrentUserID(),
			fb_api_caller_class: "RelayModern",
			variables: {
				input: {
					source: "friends_tab",
					actor_id: api.getCurrentUserID(),
					client_mutation_id: Math.round(Math.random() * 19).toString()
				},
				scale: 3,
				refresh_num: 0
			}
		};

		const success = [];
		const failed = [];

		if (args[0] === "accept") {
			form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
			form.doc_id = "3147613905362928";
		}
		else if (args[0] === "reject") {
			form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
			form.doc_id = "4108254489275063";
		}
		else {
			return api.sendMessage("❌ Invalid command. Use: accept <number|all> or reject <number|all>", event.threadID, event.messageID);
		}

		let targetIDs = args.slice(1);

		if (args[1] === "all") {
			targetIDs = Array.from({ length: listRequest.length }, (_, i) => i + 1);
		}

		const newTargetIDs = [];
		const promiseFriends = [];

		for (const stt of targetIDs) {
			const user = listRequest[parseInt(stt) - 1];
			if (!user) {
				failed.push(`🚫 Can't find request #${stt}`);
				continue;
			}
			form.variables.input.friend_requester_id = user.node.id;
			form.variables = JSON.stringify(form.variables);
			newTargetIDs.push(user);
			promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
			form.variables = JSON.parse(form.variables);
		}

		const results = await Promise.allSettled(promiseFriends);

		// Process each result and add to thread if accepted
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const user = newTargetIDs[i];
			
			if (result.status === "fulfilled" && !JSON.parse(result.value).errors) {
				success.push(`✅ ${user.node.name} (${user.node.id})`);
				
				// If this was an accept action, add user to the target thread
				if (args[0] === "accept") {
					try {
						// Small delay to ensure friend request is processed
						await sleep(2000);
						
						// Check if user is already in the thread
						const threadInfo = await api.getThreadInfo(targetThreadID);
						const isInGroup = threadInfo.participantIDs.includes(user.node.id);
						
						if (!isInGroup) {
							await api.addUserToGroup(user.node.id, targetThreadID);
							console.log(`✅ Added ${user.node.name} to thread ${targetThreadID}`);
						} else {
							console.log(`ℹ️ ${user.node.name} is already in the thread`);
						}
					} catch (addError) {
						console.error(`❌ Failed to add ${user.node.name} to thread:`, addError);
					}
				}
			} else {
				failed.push(`❌ ${user.node.name} (${user.node.id})`);
			}
		}

		let replyMsg = "";
		if (success.length > 0) {
			replyMsg += `✨ Successfully ${args[0] === 'accept' ? 'accepted' : 'rejected'} ${success.length} request(s):\n${success.join("\n")}\n`;
			
			if (args[0] === "accept") {
				replyMsg += `\n📦 Users have been added to the target thread.`;
			}
		}
		
		if (failed.length > 0) {
			replyMsg += `\n\n⚠️ Failed to process ${failed.length} request(s):\n${failed.join("\n")}`;
		}

		if (replyMsg) {
			api.sendMessage(replyMsg, event.threadID, event.messageID);
		}

		api.unsendMessage(messageID);
	},

	onStart: async function ({ event, api, commandName }) {
		try {
			const form = {
				av: api.getCurrentUserID(),
				fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
				fb_api_caller_class: "RelayModern",
				doc_id: "4499164963466303",
				variables: JSON.stringify({ input: { scale: 3 } })
			};

			const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
			const listRequest = JSON.parse(response).data.viewer.friending_possibilities.edges;

			if (!listRequest || listRequest.length === 0) {
				return api.sendMessage("🌟 You have no pending friend requests!", event.threadID);
			}

			let msg = "📩 **AUTO ADD TO THREAD SYSTEM**\n";
			msg += "━━━━━━━━━━━━━━━━━━━\n";
			msg += `🎯 Target Thread: 9900035400016366\n`;
			msg += "━━━━━━━━━━━━━━━━━━━\n\n";
			msg += "**Pending Friend Requests:**\n\n";
			
			listRequest.forEach((user, index) => {
				msg += `🔹 **${index + 1}. ${user.node.name}**\n`;
				msg += `   🆔: \`${user.node.id}\`\n`;
				msg += `   🔗: ${user.node.url.replace("www.facebook", "fb")}\n`;
				msg += `   ⏰: ${moment(user.time * 1000).tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss")}\n\n`;
			});

			msg += "━━━━━━━━━━━━━━━━━━━\n";
			msg += "💡 **Reply with:**\n";
			msg += "• `accept <number>` - Accept & auto-add to thread\n";
			msg += "• `accept all` - Accept all & auto-add to thread\n";
			msg += "• `reject <number>` - Reject request\n";
			msg += "• `reject all` - Reject all requests\n";
			msg += "━━━━━━━━━━━━━━━━━━━\n";
			msg += "⏳ This menu will auto-delete in 2 minutes";

			api.sendMessage(msg, event.threadID, (e, info) => {
				global.GoatBot.onReply.set(info.messageID, {
					commandName,
					messageID: info.messageID,
					listRequest,
					author: event.senderID,
					threadID: event.threadID,
					unsendTimeout: setTimeout(() => {
						api.unsendMessage(info.messageID);
					}, 2 * 60 * 1000)
				});
			});

		} catch (error) {
			console.error("Error in agc command:", error);
			api.sendMessage("❌ An error occurred while fetching friend requests.", event.threadID);
		}
	},

	onFriendRequest: async function ({ event, api }) {
		// This will auto-accept friend requests if you want
		// But since we're handling it through the command, we'll leave this empty
	}
};
