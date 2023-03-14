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
import { World } from '../lib/minecraft';

import * as admin from '../modules/admin/index';
import { MainPanel, SystemPanel } from '../modules/panel/index';
import { lang } from '../@minepaint/lang';
import { config } from './config';
import './support';

const mcLib = new World("overworld");


mc.system.events.beforeWatchdogTerminate.subscribe(eventData => eventData.cancel = true);
mc.world.events.beforeItemUseOn.subscribe(eventData => {
	if (mcLib.getPlayerList({ excludeGameModes: [mc.GameMode.creative] }).map(player => player.id).includes(eventData.source.id)) eventData.cancel = true;
});

mc.world.getDimension("overworld").runCommandAsync(`say Build Number: §e${config.buildNumber}`);

mc.world.events.beforeItemUse.subscribe(eventData => {
	const {	source } = eventData;

	if (eventData.item.typeId === "minecraft:book") {
		if (admin.worldData.system.startUp) {
			if (admin.worldData.system.game && source.hasTag(config.opTag)) SystemPanel.resetGame(source);
			else source.isSneaking && source.hasTag(config.opTag) ? SystemPanel.show(source) : MainPanel.show(source);
		}
		else if (source.hasTag(config.opTag)) {
			try {
				SystemPanel.startup(source);
			}
			catch {
				admin.worldData.system.startUp = false;
				mcLib.runCommands(source, `say §l§e(§cERROR§e) §fcode:#FFFF`);
				panel.Error.show(source, `${lang.system.message.startUp.again}` );
			}
		}
		else return panel.Error.show(source, lang.system.message.startUp.not);
	}
	else return;
});

//* ore event
mc.world.events.blockBreak.subscribe(eventData => {
	const { player } = eventData;
	const block = {
		typeId: eventData.brokenBlockPermutation.type.id,
		location: eventData.block.location,
		permutation: eventData.brokenBlockPermutation,
		set: () => eventData.block.setPermutation(block.permutation)
	};
	const blockData = {
		"minecraft:deepslate_diamond_ore": { item: 32, time: 400 },
		"minecraft:diamond_ore": { item: 32, time: 400 },
		"minecraft:deepslate_gold_ore": { item: 12, time: 200 },
		"minecraft:gold_ore": { item: 12, time: 200 },
		"minecraft:iron_ore": { item: 5, time: 100 },
		"minecraft:coal_ore": { item: 1, time: 20 }
	};

	if (admin.worldData.system.game && Object.keys(blockData).includes(block.typeId)) {
		admin.OreState.create(block.location, block.typeId, blockData[block.typeId].time);

		if (/^minecraft:deepslate/i.test(block.id)) mcLib.runCommands(mcLib.dimension, `setblock ${block.location.x} ${block.location.y} ${block.location.z} cobbled_deepslate`);
		else mcLib.runCommands(mcLib.dimension, `setblock ${block.location.x} ${block.location.y} ${block.location.z} cobblestone`);

		switch (admin.PlayerStatus.find(player, admin.PlayerStatus.queryOptions.inTeam)) {
			// case "red": mcLib.runCommands(player, `give @s concrete_powder ${blockData[block.id].item} 6`); break;
			// case "blue": mcLib.runCommands(player, `give @s concrete_powder ${blockData[block.id].item} 3`); break;
			case "blue": mcLib.runCommands(player, `give @s stone ${blockData[block.typeId].item}`); break;
			case "red": mcLib.runCommands(player, `give @s cobblestone ${blockData[block.typeId].item}`); break;
		}
	}
	else if (admin.worldData.system.game && ["minecraft:cobblestone", "minecraft:cobbled_deepslate"].includes(block.typeId)) return block.set();
});


//* game tick event
mc.system.run(function tick() {
	mc.system.run(tick);

	mcLib.runCommands(mcLib.dimension,
		`effect @a saturation 1 255 true`
	);

	if (admin.worldData.system.game) {
		//? game event
		admin.worldData.game.timer--;

		if (admin.worldData.game.timer > 0) {
			mcLib.runCommands(mcLib.dimension,
				`effect @a night_vision 11 0 true`,
				`title @a actionbar "${Math.floor(admin.worldData.game.timer / 20 * Math.pow(10, 1) ) / Math.pow(10, 1)}"`,
				`function game/system/${admin.worldData.game.getMap()}`
			);
		}

		/**
		 * ^: (_ [to] _s), meaning [to]. / _ is the seconds.
		 * +: Seconds to start.
		 * ..: Seconds to end.
		 */
		//? +30^+6s^
		if (admin.worldData.game.timer - 120 >= admin.worldData.setting.timer * 20 && admin.worldData.game.timer % 20 === 0) mcLib.runCommands(mcLib.dimension, `playsound note.hat @a`);
		//? +5^+1s
		else if (admin.worldData.game.timer > admin.worldData.setting.timer * 20 && admin.worldData.game.timer % 20 === 0) mcLib.runCommands(mcLib.dimension, `title @a title §e${admin.worldData.game.timer / 20 - admin.worldData.setting.timer}`, `playsound note.harp @a`);
		//? +0s
		else if (admin.worldData.game.timer === admin.worldData.setting.timer * 20 && admin.worldData.game.timer % 20 === 0) mcLib.runCommands(mcLib.dimension, `function game/process/start_${admin.worldData.game.getMap()}`);

		//? ..30s
		if (admin.worldData.game.timer === 600) mcLib.runCommands(mcLib.dimension, `tellraw @a {"rawtext": [{"translate": "${lang.system.message.game.time[30]}"}]}`, `playsound random.toast @a`);
		//? ..10s
		if (admin.worldData.game.timer === 200) mcLib.runCommands(mcLib.dimension, `tellraw @a {"rawtext": [{"translate": "${lang.system.message.game.time[10]}"}]}`, `playsound random.toast @a`);
		//? ..10^5s
		if (admin.worldData.game.timer <= 200 && admin.worldData.game.timer >= 100 && admin.worldData.game.timer % 10 === 0) mcLib.runCommands(mcLib.dimension, `playsound note.hat @a`);
		//? ..5^0s
		if (admin.worldData.game.timer === 100 && admin.worldData.game.timer >= 0 && admin.worldData.game.timer % 5 === 0) mcLib.runCommands(mcLib.dimension, `playsound note.hat @a`);
		//? ..0s
		if (admin.worldData.game.timer === 0) admin.quitGame();
		if (admin.worldData.game.timer === -200) admin.resultGame();

		//? ore event
		if (admin.OreState.get().length) admin.OreState.get().forEach(content => {
			if (content.respawnTime <= 0) {
				mcLib.runCommands(mcLib.dimension, `setblock ${content.location} ${admin.OreState.find(content.location).oreType}`);
				admin.OreState.delete(content.location);
			}
			else admin.OreState.countDown(content.location);
		});
		else return;
	}
	else return;
});

mc.world.events.playerSpawn.subscribe(eventData => {
	const { player } = eventData;

	if (admin.worldData.system.startUp) admin.loginProcess(player);
	else return;
});

mc.system.events.scriptEventReceive.subscribe(eventData => {
	const { id, sourceEntity } = eventData;
	const msg = eventData.message;

	if (id === "minepaint:team") {
		if (msg === "blue") admin.PlayerStatus.set(admin.PlayerStatus.queryOptions.inTeam, sourceEntity, "blue");
		if (msg === "red") admin.PlayerStatus.set(admin.PlayerStatus.queryOptions.inTeam, sourceEntity, "red");
	}
	if (id === "minepaint:open") {
		MainPanel.show(sourceEntity);
		mcLib.runCommands(sourceEntity, "give @s apple");
	}
});
