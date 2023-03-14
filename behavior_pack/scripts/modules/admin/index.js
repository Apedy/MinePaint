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
import { uuid } from '../../lib/uuid';
import { World } from '../../lib/minecraft';

import { lang } from '../../@minepaint/lang';
import { config } from '../../server/config';

const mcLib = new World("overworld");


/** レポートの種類を選択します。*/
export const worldReportOptions = {
	harassment: lang.words.report.harassment,
	hate_speech: lang.words.report.hate_speech,
	cheats: lang.words.report.cheats,
	bug: lang.words.report.bug,
	system: lang.words.report.system,
	other: lang.words.report.other
};
export const mapOptions = {
	gb: "gb",
	wt: "wt"
};
/** KITを指定します。 */
export const kitOptions = {
	Warrior: "Warrior",
	Archer: "Archer",
	Berserker: "Berserker",
	Nightmare: "Nightmare"
};
/** プレイヤーのステータスを作成します。 */
export class PlayerStatus {
	/**
	 * @param {mc.Player} player プレイヤー
	 */
	constructor(player) {
		this.player = player.name;
		this.level = 0;
		this.exp = 0;
		this.sp = 0;
		this.inTeam = null;
		this.selectKit = null;
		this.haveKits = [];
		this.lastLogin = 0;
	}
	static queryOptions = {
		level: "level",
		sp: "sp",
		inTeam: "inTeam",
		selectKit: "selectKit",
		haveKits: "haveKits",
		lastLogin: "lastLogin"
	};
	static contents = {
		status: []
	};
	/**
	 * データを取得します。
	 * @param {boolean?} original
	 * @returns {PlayerStatus[]}
	 */
	static get(original) {
		const contents = JSON.parse(Array.from(mc.world.getDimension('overworld').getEntities(
			{
				type: "minecraft:armor_stand",
				name: "PlayerStatus"
			}
		))[0].getTags()[0]);

		if (original) return contents;
		return contents.status;
	}
	/**
	 * 新たにコンテンツを作成、追加します。
	 * @param {mc.Player} player プレイヤー
	 */
	static create(player) {
		const contents = this.get();

		contents.push(new this(player));
		this.apply(contents);
	}
	/**
	 * コンテンツに値を代入します。
	 * @param {PlayerStatus.queryOptions} option カテゴリ
	 * @param {mc.Player} player プレイヤー
	 * @param {any} value 指定する値
	 * @param {boolean?} nameTag
	 */
	static set(option, player, value, nameTag) {
		const contents = this.get();

		if (!name) player = player.name;

		if (Array.isArray(value)) value = [...new Set(value)];
		if (option === this.queryOptions.haveKits) value = value.sort((a, b) => Object.values(kitOptions).indexOf(a) - Object.values(kitOptions).indexOf(b));

		contents.find(content => content.player === player)[option] = value;

		this.apply(contents);
	}
	/**
	 * コンテンツから値の取得を行います。
	 * @param {mc.Player} player プレイヤー
	 * @param {string} option オプション
	 * @returns {any|undefined}
	 */
	static find(player, option) {
		return this.get().find(content => content.player === player.name)?.[option];
	}
	/**
	 * フィルターの値を基にコンテンツの取得を行います。
	 * @param {any} value フィルターの値
	 * @param {string} option オプション
	 * @returns {PlayerStatus[]}
	 */
	static filter(value, option) {
		return this.get().filter(contents => contents[option] === value);
	}
	/**
	 * プレイヤーのステータスを更新します。
	 * @param {PlayerStatus[]} contents コンテンツ
	 */
	static apply(contents) {
		const prevContents = this.get(true);
		const strageEntity = Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "PlayerStatus" }))[0];

		strageEntity.removeTag(JSON.stringify(prevContents));
		strageEntity.addTag(JSON.stringify({status: contents}));
	}
}
/** レポートを作成します。 */
export class WorldReport {
	/**
	 * @param {mc.Player} player プレイヤー
	 * @param {string} category 報告の種類
	 * @param {string} detail 詳細
	 */
	constructor(player, category, detail) {
		this.id = uuid.v4();
		this.player = player.name;
		this.category = category;
		this.detail = detail;
		this.read = false;
	}
	static queryOptions = {
		id: "id",
		player: "player",
		category: "category",
		detail: "detail",
		read: "read"
	};
	static contents = {
		report: []
	};
	/**
	 * データを取得します。
	 * @param {boolean?} original
	 * @returns {WorldReport[]}
	 */
	static get(original) {
		const contents = JSON.parse(Array.from(mc.world.getDimension('overworld').getEntities(
			{
				type: "minecraft:armor_stand",
				name: "WorldReport"
			}
		))[0].getTags()[0]);

		if (original) return contents;
		return contents.report;
	}
	/**
	 * 新たにコンテンツを作成、追加します。
	 * @param {mc.Player} player 報告したプレイヤー
	 * @param {string} category 報告の種類
	 * @param {string} detail 詳細な報告
	 */
	static create(player, category, detail) {
		const contents = this.get();

		contents.push(new WorldReport(player, category, detail));
		this.apply(contents);
	}
	/**
	 * コンテンツを既読にします。
	 * @param {uuid.v4} id
	 */
	static makeRead(id) {
		const contents = this.get();

		contents.find(content => content.id === id).read = true;
		this.apply(contents);
	}
	/**
	 * コンテンツの値を削除します。
	 */
	static delete(id) {
		const contents = this.get().filter(content => content.id !== id);
		this.apply(contents);
	}
	/**
	 * コンテンツから値の取得を行います。
	 * @param {uuid.v4?} id ユニークな識別ID
	 * @returns {WorldReport[]?}
	 */
	static find(id) {
		return this.get().find(content => content.id === id);
	}
	/**
	 * フィルターの値を基にコンテンツの取得を行います。
	 * @param {any} value フィルターの値
	 * @param {string} option オプション
	 * @returns {WorldReport[]}
	 */
	static filter(value, option) {
		return this.get().filter(content => content[option] === value);
	}
	/**
	 * レポートを更新します。
	 * @param {WorldReport[]?} contents コンテンツ
	 */
	static apply(contents) {
		const prevContents = this.get(true);
		const strageEntity = Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "WorldReport" }))[0];

		strageEntity.removeTag(JSON.stringify(prevContents));
		strageEntity.addTag(JSON.stringify({report: contents}));
	}
}
/** 鉱石の状態を作成します。 */
export class OreState {
	/**
	 * @param {mc.Location|mc.BlockLocation} location
	 * @param {string} oreType 鉱石
	 * @param {number} respawnTime 時間
	 */
	constructor(location, oreType, respawnTime) {
		this.location = `${location.x} ${location.y} ${location.z}`;
		this.oreType = oreType;
		this.respawnTime = respawnTime;
	}
	static contents = {
		ore: []
	};
	/**
	 * データを取得します。
	 * @param {boolean?} original
	 * @returns {OreState[]}
	 */
	static get(original) {
		const contents = JSON.parse(Array.from(mc.world.getDimension('overworld').getEntities(
			{
				type: "minecraft:armor_stand",
				name: "OreState"
			}
		))[0].getTags()[0]);

		if (original) return contents;
		return contents.ore;
	}
	/**
	 * 新たにコンテンツを作成、追加します。
	 * @param {mc.Location|mc.BlockLocation} location
	 * @param {string} oreType 鉱石
	 * @param {number} respawnTime 時間
	 */
	static create(location, oreType, respawnTime) {
		const contents = this.get();

		contents.push(new this(location, oreType, respawnTime));
		this.apply(contents);
	}
	/**
	 * 復活までの時間を減らします。
	 * @param {string} location
	 */
	static countDown(location) {
		const contents = this.get();

		contents.find(content => content.location === location).respawnTime--;
		this.apply(contents);
	}
	/**
	 * コンテンツの値を削除します。
	 * @param {string} location
	 */
	static delete(location) {
		const contents = this.get().filter(content => content.location !== location);
		this.apply(contents);
	}
	/**
	 * コンテンツから値の取得を行います。
	 * @param {mc.Location} location 鉱石の座標
	 * @returns {OreState|undefined}
	 */
	static find(location) {
		return this.get().find(content => content.location === location);
	}
	/**
	 * フィルターの値を基にコンテンツの取得を行います。
	 * @param {any} value フィルターの値
	 * @param {string} option オプション
	 * @returns {OreState[]|undefined}
	 */
	static filter(value, option) {
		return this.get().filter(content => content[option] === value);
	}
	/**
	 * 鉱石の状態を更新します。
	 * @param {OreState[]} contents コンテンツ
	 */
	static apply(contents) {
		const prevContents = this.get(true);
		const strageEntity = Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "OreState" }))[0];

		strageEntity.removeTag(JSON.stringify(prevContents));
		strageEntity.addTag(JSON.stringify({ore: contents}));
	}
}
export const worldData = {
	setting: {
		timer: 120,
		map: 0,
		quality: 1
	},
	system: {
		"startUp": false,
		"game": false,
		"room_open": false
	},
	game: {
		timer: 0,
		getMap() { return Object.keys(mapOptions)[worldData.setting.map]; }
	}
};
export const PlayerInbox = {
	sendGift(player) {
		{
			category = "gift";
			message = "";
			contents = "";
		}
	},
	sendNotice() {
		return {
			category: "notice",
			message: ""
		};
	},
	queryOptions: {
		sendTime: "sendTime",
		category: "category",
		message: "message"
	}
};

/**
 * スコアボードの値を取得します。
 * @param {string} objectiveId オブジェクト名
 * @param {ScoreboardIdentity} entity エンティティ名
 * @return {number} 数値
 */
export const getScore = (objectiveId, entity) => mc.world.scoreboard.getObjective(objectiveId).getScore(entity);
/**
 * システムをリセットします。
 */
export const resetSystem = () => {
	mcLib.runCommands(mcLib.dimension, `function system/reset`);
};
/**
 * ゲームを起動させます。
 */
export const runGame = () => {
	worldData.system.game = true;
	worldData.game.timer = (worldData.setting.timer + 20) * 20;

	PlayerStatus.filter("blue", PlayerStatus.queryOptions.inTeam).forEach(content => mcLib.runCommands(mcLib.dimension, `tag "${content.player}" add blue`));
	PlayerStatus.filter("red", PlayerStatus.queryOptions.inTeam).forEach(content => mcLib.runCommands(mcLib.dimension, `tag "${content.player}" add red`));

	mcLib.runCommands(mcLib.dimension, `function game/setup/${worldData.game.getMap()}`);
};
/**
 * ゲームの終了処理を行います。
 */
export const quitGame = () => {
	mcLib.runCommands(mcLib.dimension, `function game/quit`);
};
/**
 * ゲームの結果発表を行います。
 */
export const resultGame = () => {
	mcLib.runCommands(mcLib.dimension, `function game/result`);
};
/**
 * ゲームをリセットします。
 */
export const resetGame = () => {
	worldData.system.game = false;

	mcLib.runCommands(mcLib.dimension, `function game/reset`, ...Object.keys(mapOptions).map(map => `function game/process/end_${map}`));

	if (OreState.get().length) {
		Object.keys(
			OreState.get().forEach(content => {
				mcLib.runCommands(mcLib.dimension, `setblock ${content.location} ${content.oreType}`);
				OreState.delete(content.location);
			})
		);
	}

};
/**
 * チャットを送信します。
 * @param {mc.Player} player プレイヤー
 * @param {string} msg メッセージ
 */
export const sendChat = (player, msg) => {
	const syntax = {"rawtext": [{"text": `${player.hasTag(config.opTag) ? "§l[§dADMIN§f]" : "§l[§7PLAYER§f]"} §f${player.name}§r §7>§r ${msg}`}]};
	mcLib.runCommands(player, `tellraw @a ${JSON.stringify(syntax)}`);
};
/**
 * チームチャットを送信します。
 * @param {mc.Player} player プレイヤー
 * @param {string} msg メッセージ
 */
export const sendTeamChat = (player, msg) => {
	let inTeam = "§7PLAYER";
	switch (PlayerStatus.find(player, PlayerStatus.queryOptions.inTeam)) {
		case "red": inTeam = "§cRED"; break;
		case "blue": inTeam = "§bBLUE"; break;
	}

	let syntax = {"rawtext": [{"text": `§l[${inTeam}§f] §f${player.name} §r>§r ${msg}`}]};

	if (/^!/i.test(msg)) {
		syntax = {"rawtext": [{"text": `§l[${inTeam}§f] §f${player.name}§r§7(TEAM) >§r ${msg}`}]};
		mcLib.runCommands(player, `tellraw @a[tag=!${{red: "blue", blue: "red"}[PlayerStatus.find(player, PlayerStatus.queryOptions.inTeam)]}] ${JSON.stringify(syntax)}`);
	}
	else mcLib.runCommands(player, `tellraw @a ${JSON.stringify(syntax)}`);
};
/**
 * ログインの処理を行います。
 * @param {mc.Player} player 対象のプレイヤー
 */
export const loginProcess = player => {
	const distGift = () => {
		PlayerStatus.set(PlayerStatus.queryOptions.lastLogin, player, new Date().getTime());

		mcLib.runCommands(player, `function system/player/loginGift`);
	};

	mcLib.runCommands(player, "function system/player/loginProcess");

	if (PlayerStatus.find(player, PlayerStatus.queryOptions.lastLogin)) {
		mcLib.runCommands(player, "say Data found.");

		if (PlayerStatus.find(player, PlayerStatus.queryOptions.lastLogin) + 86400000 <= new Date().getTime()) distGift();
		else return;
	}
	else {
		mcLib.runCommands(player, "say Data not found.");
		PlayerStatus.create(player);
		PlayerStatus.set(PlayerStatus.queryOptions.haveKits, player, [kitOptions.Warrior]);
		distGift();
	}
};
