import * as mc from '@minecraft/server';
import { uuid } from './uuid';
import { lang } from './lang';

/** レポートの種類を選択します。*/
export const reportOptions = {
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
/** レポートデータの内容を指定します。 */
export class RDStack {
	/**
	 * @param {mc.Player} player プレイヤー
	 * @param {string} category 報告の種類
	 * @param {string} detail 詳細
	 */
	constructor(player, category, detail) {
		this.player = player.nameTag;
		this.category = category;
		this.detail = detail;
		this.read = false;
	}
}
/** 鉱石データの内容を指定します。 */
export class ODStack {
	/**
	 * @param {string} ore 鉱石
	 * @param {number} time 時間
	 */
	constructor(ore, time) {
		this.ore = ore;
		this.time = time;
	}
}
export class PDMhs {
	/**
	 * データを読み込みます。
	 * @returns {Object.PlayerData}
	 */
	get() {return JSON.parse(Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "PlayerData" }))[0].getTags()[0]);}
	/**
	 * コンテンツに値を代入します。
	 * @param {Object.playerData.queryOptions} option カテゴリ
	 * @param {mc.Player} player プレイヤー
	 * @param {string|string[]} value 指定する値
	 */
	set(option, player, value) {
		const contents = this.get().contents;

		if (Array.isArray(value)) value = [...new Set(value)];

		switch (option) {
			case playerData.queryOptions.inTeam: contents[playerData.queryOptions.inTeam][player.nameTag] = value; break;
			case playerData.queryOptions.selectKit: contents[playerData.queryOptions.selectKit][player.nameTag] = value; break;
			case playerData.queryOptions.haveKits: contents[playerData.queryOptions.haveKits][player.nameTag] = value.sort((a, b) => Object.values(kitOptions).indexOf(a) - Object.values(kitOptions).indexOf(b)); break;
			case playerData.queryOptions.lastLogin: contents[playerData.queryOptions.lastLogin][player.nameTag] = value; break;
			default: return;
		}

		Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "PlayerData" }))[0].removeTag(JSON.stringify(this.get()));
		Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "PlayerData" }))[0].addTag(JSON.stringify({contents}));
	}
	/**
	 * コンテンツの値を取得します。
	 * @param {Object.playerData.queryOptions} option カテゴリ
	 * @param {mc.player} player プレイヤー
	 * @returns {string|string[]}
	 */
	find(option, player) {
		const contents = this.get().contents;

		if (player) return contents[option]?.[player.nameTag];
		return contents?.[option] ? Object.keys(contents[option]) : [undefined];
	}
}
export class RDMhs {
	/**
	 * データを読み込みます。
	 * @returns {Object.ReportData}
	 */
	get() {return JSON.parse(Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "ReportData" }))[0].getTags()[0]);}
	/**
	 * コンテンツを管理します。
	 * @param {new RDMhs} method 実行するメソッド
	 * @param {new uuid.v4} id ユニークな識別ID
	 * @param {new RDStack?} data 操作する値
	 */
	manager(method, id, data) {
		const prevContents = this.get().contents;
		const contents = method(prevContents, id, data ? data : null);

		Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "ReportData" }))[0].removeTag(JSON.stringify(this.get()));
		Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "ReportData" }))[0].addTag(JSON.stringify({contents: contents}));
	}
	/**
	 * コンテンツに値を追加します。
	 */
	add(contents, id, data) {
		contents[id] = data;
		return contents;
	}
	/**
	 * コンテンツを既読にします。
	 */
	read(contents, id) {
		contents[id].read = true;
		return contents;
	}
	/**
	 * コンテンツの値を削除します。
	 */
	delete(contents, id) {
		delete contents[id];
		return contents;
	}
	/**
	 * コンテンツの値を取得します。
	 * @param {new uuid.v4?} id ユニークな識別ID
	 * @returns {{ player: mc.Player.nameTag, category: Object.reportOptions, detail: string, read: boolean}|uuid.v4[]}
	 */
	find(id) {
		const contents = this.get().contents;

		if (id) return contents[id];
		return Object.keys(contents);
	}
}
export class ODMhs {
	/**
	 * データを読み込みます。
	 * @returns {Object.OreData}
	 */
	get() {return JSON.parse(Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "OreData" }))[0].getTags()[0]);}
	/**
	 * コンテンツを管理します。
	 * @param {new ODMhs} method 実行するメソッド
	 * @param {mc.Location} location 鉱石の座標
	 * @param {new ODStack?} data 操作する値
	 */
	manager(method, location, data) {
		const prevContents = this.get().contents;
		const contents = method(prevContents, location, data ? data : null);

		Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "OreData" }))[0].removeTag(JSON.stringify(this.get()));
		Array.from(mc.world.getDimension('overworld').getEntities({ type: "minecraft:armor_stand", name: "OreData" }))[0].addTag(JSON.stringify({contents: contents}));
	}
	/**
	 * コンテンツに値を追加します。
	 */
	add(contents, location, data) {
		contents[location] = data;
		return contents;
	}
	/**
	 * コンテンツの値を更新します。
	 */
	update(contents, location) {
		contents[location].time--;
		return contents;
	}
	/**
	 * コンテンツの値を削除します。
	 */
	delete(contents, location) {
		delete contents[location];
		return contents;
	}
	/**
	 * コンテンツの値を取得します。
	 * @param {mc.Location_} location 鉱石の座標
	 * @returns {{ time: any, ore: any }|mc.Location[]|undefined}
	 */
	find(location) {
		const contents = this.get().contents;

		if (location) return {
			time: contents[location].time,
			ore: contents[location].ore
		};
		return Object.keys(contents).length ? Object.keys(contents) : undefined;
	}
}

export const playerData = {
	get: new PDMhs().get,
	set: new PDMhs().set,
	find: new PDMhs().find,
	/** プレイヤーデータのカテゴリです。 */
	queryOptions: {
		inTeam: "inTeam",
		selectKit: "selectKit",
		haveKits: "haveKits",
		lastLogin: "lastLogin"
	},
	contents: {
		inTeam: {},
		selectKit: {},
		haveKits: {},
		lastLogin: {}
	}
};
export const reportData = {
	get: new RDMhs().get,
	manager: new RDMhs().manager,
	find: new RDMhs().find,
	contents: {}
};
export const oreData = {
	get: new ODMhs().get,
	manager: new ODMhs().manager,
	find: new ODMhs().find,
	contents: {}
};
export const config = {
	buildNumber: 102,
	opTag: "admin"
};
export const system = {
	"startUp": false,
	"game": false
};
export const game = {
	timer: 0,
	getMap: () => Object.keys(mapOptions)[setting.map]
};
export const setting = {
	timer: 120,
	map: 0,
	quality: 1
};
export const dimension = mc.world.getDimension("overworld");

/**
 * コマンドを実行します。
 * @param {mc.Player|mc.Dimension} caller 実行元
 * @param {...string} syntaxes 構文
 * @return {Promise<mc.CommandResult>} 実行結果
 */
export const runCommands = (caller, ...syntaxes) => syntaxes.map(e => caller.runCommandAsync(e));
/**
 * プレイヤーリストを取得します。
 * @returns {mc.Player[]}
 */
export const getPlayerList = () => Array.from(mc.world.getPlayers());
/**
 * スコアボードの値を取得します。
 * @param {string} objectiveId オブジェクト名
 * @param {ScoreboardIdentity} entity エンティティ名
 * @return {number} 数値
 */
export const getScore = (objectiveId, entity) => mc.world.scoreboard.getObjective(objectiveId).getScore(entity);
/**
 * ゲームを起動させます。
 */
export const runGame = () => {
	system.game = true;
	game.timer = (setting.timer + 20) * 20;

	getPlayerList().map(player => {
		switch (playerData.find(playerData.queryOptions.inTeam, player)) {
			case "red": runCommands(player, `tag @s add red`); break;
			case "blue": runCommands(player, `tag @s add blue`); break;
			default: return;
		}
	});

	runCommands(dimension, `function game/setup/${game.getMap()}}`);
};
/**
 * ゲームの処理を行います。
 */
export const quitGame = () => {
	system.game = false;

	runCommands(dimension, `function game/quit`);
};
/**
 * ゲームを停止させます。
 */
export const resetGame = () => {
	system.game = false;

	runCommands(dimension, `function game/reset`, ...Object.keys(mapOptions).map(e => `function game/process/end_${e}`));

	Object.keys(oreData.find()).length ? oreData.find().map(location => {
		runCommands(dimension, `setblock ${location} ${oreData.find(location).ore}`);
		oreData.manager(new ODMhs().delete, location);
	}) : null;

};
export const getLastLogin = player => playerData.find(playerData.queryOptions.lastLogin, player);
/**
 * ログインの処理を行います。
 * @param {mc.Player} player 対象のプレイヤー
 */
export const loginProcess = player => {
	const distGift = () => {
		playerData.set(playerData.queryOptions.lastLogin, player, new Date().getTime());

		runCommands(player, `give @s diamond`);
	};

	runCommands(player,
		`title @s title §fMinePaint`,
		`title @s subtitle §lSeason 0`,
		`tp @s 0 -59 0 0 0`,
		`clear @s`,
		`give @s book`
	);

	if (getLastLogin(player)) {
		if (getLastLogin(player) + 86400000 <= new Date().getTime()) distGift();
		else return;
	}
	else {
		playerData.set(playerData.queryOptions.haveKits, player, kitOptions.Warrior);
		distGift();
	}
};
