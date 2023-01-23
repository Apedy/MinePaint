import * as mc from '@minecraft/server';
import * as adm from '../@minepaint/admin';
import { lang } from '../@minepaint/lang';
import { uuid } from '../@minepaint/uuid';

const { runCommands, playerData } = adm;

mc.world.events.beforeChat.subscribe(eventData => {
	const { sender, message } = eventData;

	if (message.startsWith("\\") && sender.hasTag(adm.config.opTag)) {
		eventData.cancel = true;

		//*kit
		if (/^\\kit/i.test(message)) {
			const value = message.replace(/\\\w*\s\w*\s/, "");
			const type = message.replace(/^\\\w*\s|\s\w*$/g, "");

			switch (type) {
				case "add":
					const prevKits = playerData.find(playerData.queryOptions.haveKits, sender) ? playerData.find(playerData.queryOptions.haveKits, sender) : [];
					prevKits.push(adm.kitOptions[value]);

					playerData.set(playerData.queryOptions.haveKits, sender, prevKits.filter(e => e));
					runCommands(sender, `say ${playerData.find(playerData.queryOptions.haveKits, sender).toString()}`);
					break;
				case "remove":
					playerData.set(playerData.queryOptions.haveKits, sender, playerData.find(playerData.queryOptions.haveKits, sender).filter(e => !e.includes(adm.kitOptions[value])));
					runCommands(sender, `say ${playerData.find(playerData.queryOptions.haveKits, sender).toString()}`);
					break;
			}
		}

		//* team
		else if (/^\\team/i.test(message)) {
			const value = message.replace(/\\\w*\s\w*\s/, "");
			const type = message.replace(/^\\\w*\s|\s\w*$/g, "");

			switch (type) {
				case "join":
					playerData.set(playerData.queryOptions.inTeam, sender, {red: "red", blue: "blue"}[value]);
					break;
				case "leave":
					playerData.set(playerData.queryOptions.inTeam, sender, null);
					break;
			}
		}

		//* setup
		else if (/^\\setUp/i.test(message)) {
			Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "PlayerData" }))[0].addTag(JSON.stringify({
				contents: {
					inTeam: {},
					selectKit: {},
					haveKits: {},
					lastLogin: {}
				}
			}));
			Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "ReportData" }))[0].addTag(JSON.stringify({
				contents: {}
			}));
			Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "OreData" }))[0].addTag(JSON.stringify({
				contents: {}
			}));
			runCommands(sender, `say ${playerData.get().toString()}`);
		}
		else if (/\\getNum/i.test(message)) runCommands(sender, `say Build Number: §e${adm.config.buildNumber}`);
		else if (/\\getUUID/i.test(message)) runCommands(sender, `say ${new uuid().v4()}`);
		else runCommands(sender, `tellraw @s {"rawtext": [{"translate": "${lang.system.message.command.unknown}"}, {"text": "\\${message}\n"}, {"translate": "${lang.system.message.command.exist}"}]}`);
	}
	else if (message.startsWith("\\") && !sender.hasTag(adm.config.opTag)) {
		eventData.cancel = true;
		//sender.tell(mc.IRawMessage({"rawtext": [{"translate": "${lang.system.message.command_unknown}"}, {"text": "${message}\n"}, {"translate": "${lang.system.message.command_permission}"}]}));
		runCommands(sender, `tellraw @s {"rawtext": [{"translate": "${lang.system.message.command.unknown}"}, {"text": "\\${message}\n"}, {"translate": "${lang.system.message.command.permission}"}]}`);
	}
	else return;
});

// mc.world.events.beforeChat.subscribe(eventData => {
// 	const {	sender, message } = eventData;
// 	if (/okgoogle|heygoogle/i.test(message.replace(/\s/g, ""))) {
// 		eventData.cancel = true;
// 		const assistantPanelData = new ui.ModalFormData()
// 			.title("アシスタント")
// 			.textField("次のようにメッセージを送信してみてください。", `例: ${["いま何時？", "今日の天気は？"][Math.floor(Math.random() * 2)]}`),
// 		assistantPanel = async(mcPlayer) => {
// 			const response = await assistantPanelData.show(mcPlayer);
// 			const pattern = RegExp => RegExp.test(response.formValues[0]);
// 			switch (true) {
// 				case pattern(/いま|今/g):
// 					if (pattern(/時/g)) e;
// 					if (pattern(/天気/g)) e;
// 					break;
// 				case pattern(/あした|明日/g):
// 					if (pattern(/天気/g)) e;
// 					break;
// 			}
// 		};
// 		assistantPanel(sender);
// 	}
// 	else if (/addName|!a/i.test(message.replace(/\s/g, ""))) Array.from(mc.world.getDimension("overworld").getEntities({name: "PlayerData"}))[0].addTag(JSON.stringify(json));
// });
