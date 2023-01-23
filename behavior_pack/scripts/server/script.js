import * as mc from '@minecraft/server';
import { lang } from '../@minepaint/lang';
import * as ui from './display';
import './support';
import {
	config,
	dimension,

	//? Data
	worldData,
	playerData,
	reportData,
	oreData,

	//? Option
	kitOptions,
	mapOptions,
	reportOptions,

	//? Class
	RDStack,
	ODStack,
	PDMhs,
	RDMhs,
	ODMhs,

	//? Function
	runGame,
	resetGame,
	loginProcess,

	//? Support
	runCommands,
	getPlayerList
} from '../@minepaint/admin';


mc.system.events.beforeWatchdogTerminate.subscribe(eventData => eventData.cancel = true);

mc.world.getDimension("overworld").runCommandAsync(`say Build Number: §e${config.buildNumber}`);

mc.world.events.beforeItemUse.subscribe(eventData => {
	const {	source } = eventData;

	if (eventData.item.typeId === "minecraft:book") {
		if (worldData.system.startUp) {
			if (worldData.system.game) source.hasTag(config.opTag) ? ui.System.gameResetPanel() : null;
			else source.isSneaking && source.hasTag(config.opTag) ? ui.System.systemPanel(source) : ui.Main.mainPanel(source);
		}
		else if (source.hasTag(config.opTag)) {
			try {
				ui.System.startupPanel(source);
			}
			catch (e) {
				worldData.system.startUp = false;
				runCommands(source, `say §l§e(§cERROR§e) §fcode:#FFFF`);
				ui.errorPanel(source, `${lang.system.message.startUp.again}\n${e}`);
			}
		}
		else return ui.errorPanel(source, lang.system.message.startUp.not);
	}
	else if (eventData.item.typeId === "minecraft:apple") {
		runCommands(source, "say test");
		ui.errorPanel(source, "test");
	}
	else return;
});


//* ore event
mc.world.events.blockBreak.subscribe(eventData => {
	const { player } = eventData;
	const block = {
		id: eventData.brokenBlockPermutation.type.id,
		location: `${eventData.block.location.x} ${eventData.block.location.y} ${eventData.block.location.z}`,
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

	if (worldData.system.game && Object.keys(blockData).includes(block.id)) {
		oreData.manager(new ODMhs().add, block.location, new ODStack(block.id, blockData[block.id].time));

		if (/^minecraft:deepslate/i.test(block.id)) runCommands(dimension, `setblock ${block.location} cobbled_deepslate`);
		else runCommands(dimension, `setblock ${block.location} cobblestone`);

		switch (playerData.find(playerData.queryOptions.inTeam, player)) {
			// case "red": runCommands(player, `give @s concrete_powder ${blockData[block.id].item} 6`); break;
			// case "blue": runCommands(player, `give @s concrete_powder ${blockData[block.id].item} 3`); break;
			case "blue": runCommands(player, `give @s stone ${blockData[block.id].item}`); break;
			case "red": runCommands(player, `give @s cobblestone ${blockData[block.id].item}`); break;
		}
	}
	else if (worldData.system.game && ["minecraft:cobblestone", "minecraft:cobbled_deepslate"].includes(block.id)) return block.set();
});


//* game tick event
mc.system.run(function tick() {
	mc.system.run(tick);

	runCommands(dimension,
		`effect @a night_vision 11 0 true`,
		`effect @a saturation 1 255 true`,
		`tp @a[y=-65,dy=-100] 0 -60 0 0 0`
	);

	if (worldData.system.game) {
		//? game event
		worldData.game.timer--;

		runCommands(dimension,
			`title @a actionbar "${Math.floor(worldData.game.timer / 20 * Math.pow(10, 1) ) / Math.pow(10, 1)}"`,
			`function game/system/${worldData.game.getMap()}`
		);

		/**
		 * ^: (_ [to] _s), meaning [to]. / _ is the seconds.
		 * +: Seconds to start.
		 * ..: Seconds to end.
		 */
		//? +30^+6s^
		if (worldData.game.timer - 120 >= worldData.setting.timer * 20 && worldData.game.timer % 20 === 0) runCommands(dimension, `playsound note.hat @a`);
		//? +5^+1s
		else if (worldData.game.timer > worldData.setting.timer * 20 && worldData.game.timer % 20 === 0) runCommands(dimension, `title @a title §e${worldData.game.timer / 20 - worldData.setting.timer}`, `playsound note.harp @a`);
		//? +0s
		else if (worldData.game.timer === worldData.setting.timer * 20 && worldData.game.timer % 20 === 0) runCommands(dimension, `function game/process/start_${worldData.game.getMap()}`);

		//? ..30s
		if (worldData.game.timer === 600) runCommands(dimension, `tellraw @a {"rawtext": [{"translate": "${lang.system.message.game.time[30]}"}]}`, `playsound random.toast @a`);
		//? ..10s
		if (worldData.game.timer === 200) runCommands(dimension, `tellraw @a {"rawtext": [{"translate": "${lang.system.message.game.time[10]}"}]}`, `playsound random.toast @a`);
		//? ..10^5s
		if (worldData.game.timer < 200 && worldData.game.timer > 100 && worldData.game.timer % 10 === 0) runCommands(dimension, `playsound note.hat @a`);
		//? ..5^0s
		if (worldData.game.timer <= 100 && worldData.game.timer > 0 && worldData.game.timer % 5 === 0) runCommands(dimension, `playsound note.hat @a`);
		//? ..0s
		if (worldData.game.timer === 0) {
			resetGame();
		}

		//? ore event
		if (oreData.find()) oreData.find().map(location => {
			oreData.manager(new ODMhs().update, location);

			if (oreData.find(location).time <= 0) {
				runCommands(dimension, `setblock ${location} ${oreData.find(location).ore}`);
				oreData.manager(new ODMhs().delete, location);
			}
			else return;
		});
		else return;
	}
	else return;
});

mc.world.events.playerJoin.subscribe(eventData => {
	const {player} = eventData;

	if (worldData.system.startUp) loginProcess(player);
	else return;
});
