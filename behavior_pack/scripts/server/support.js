/*!
 * Copyright (C) 2023 Apedy
 * This file is part of MinePaint.
 *
 * MinePaint is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MinePaint is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this MinePaint. If not, see <https://www.gnu.org/licenses/>.
 */

import * as mc from '@minecraft/server';
import { uuid } from '../lib/uuid';
import { World } from '../lib/minecraft';

import * as admin from '../modules/admin/index';
import { lang } from '../@minepaint/lang';
import { config } from './config';

const mcLib = new World("overworld");


mc.world.events.beforeChat.subscribe(eventData => {
	const { sender, message } = eventData;

	eventData.cancel = true;

	if (/^\\\w/i.test(message) && sender.hasTag(config.opTag)) {

		//*kit
		if (/^\\kit/i.test(message)) {
			const value = message.replace(/\\\w*\s\w*\s/, "");
			const type = message.replace(/^\\\w*\s|\s\w*$/g, "");

			switch (type) {
				case "add":
					const prevKits = admin.PlayerStatus.find(sender, admin.PlayerStatus.queryOptions.haveKits) || [];
					prevKits.push(admin.kitOptions[value]);

					admin.PlayerStatus.set(admin.PlayerStatus.queryOptions.haveKits, sender, prevKits.filter(e => e));
					mcLib.runCommands(sender, `say ${admin.PlayerStatus.find(sender, admin.PlayerStatus.queryOptions.haveKits).toString()}`);
					break;
				case "remove":
					admin.PlayerStatus.set(admin.PlayerStatus.queryOptions.haveKits, sender, admin.PlayerStatus.find(sender, admin.PlayerStatus.queryOptions.haveKits).filter(e => !e.includes(admin.kitOptions[value])));
					mcLib.runCommands(sender, `say ${admin.PlayerStatus.find(sender, admin.PlayerStatus.queryOptions.haveKits).toString()}`);
					break;
			}
		}

		//* team
		else if (/^\\team/i.test(message)) {
			const value = message.replace(/\\\w*\s\w*\s/, "");
			const type = message.replace(/^\\\w*\s|\s\w*$/g, "");

			switch (type) {
				case "join":
					admin.PlayerStatus.set(admin.PlayerStatus.queryOptions.inTeam, sender, {red: "red", blue: "blue"}[value]);
					break;
				case "leave":
					admin.PlayerStatus.set(admin.PlayerStatus.queryOptions.inTeam, sender, null);
					break;
			}
		}

		//* setup
		else if (/^\\setUp/i.test(message)) {
			Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "PlayerStatus" }))[0].addTag(JSON.stringify(admin.PlayerStatus.contents));
			Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "WorldReport" }))[0].addTag(JSON.stringify(admin.WorldReport.contents));
			Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "OreState" }))[0].addTag(JSON.stringify(admin.OreState.contents));
			mcLib.runCommands(sender, `say ${admin.PlayerStatus.get().toString()}`);
		}
		else if (/\\getNum/i.test(message)) mcLib.runCommands(sender, `say Build Number: §e${config.buildNumber}`);
		else if (/\\getUUID/i.test(message)) mcLib.runCommands(sender, `say ${uuid.v4()}`);
		else mcLib.runCommands(sender, `tellraw @s {"rawtext": [{"translate": "${lang.system.message.command.unknown}"}, {"text": "\\${message}\n"}, {"translate": "${lang.system.message.command.exist}"}]}`);
	}
	else if (/^\\\w/i.test(message) && !sender.hasTag(config.opTag)) {
		//sender.tell(mc.IRawMessage({"rawtext": [{"translate": "${lang.system.message.command_unknown}"}, {"text": "${message}\n"}, {"translate": "${lang.system.message.command_permission}"}]}));
		mcLib.runCommands(sender, `tellraw @s {"rawtext": [{"translate": "${lang.system.message.command.unknown}"}, {"text": "\\${message}\n"}, {"translate": "${lang.system.message.command.permission}"}]}`);
	}
	else if (admin.worldData.system.game) admin.sendTeamChat(sender, message);
	else if (admin.worldData.system.startUp) admin.sendChat(sender, message);
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
