import * as mc from '@minecraft/server';
import * as ui from '@minecraft/server-ui';
import { uuid } from '../@minepaint/uuid';
import { lang } from '../@minepaint/lang';
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

//* System
/**
 * システムパネル
 */
export const System = {
	/**
	 * システム起動パネルを開きます。
	 * @param {mc.Player} player
	 */
	async startupPanel(player) {
		runCommands(player, `playsound random.pop @s`);

		const response = await new ui.MessageFormData()
			.title(lang.system.panel.title)
			.body(lang.system.panel.startUp_confirmation + "\n" + lang.system.panel.startUp_note)
			.button1(lang.words.button.continue)
			.button2(lang.words.button.cancel)
			.show(player);

		if (response.selection === 1) {
			worldData.system.startUp = true;

			runCommands(player,
				`title @a times 0 100 10`,
				`tellraw @s {"rawtext":[{"translate":"${lang.system.message.startUp.success_box}"},{"text":"\n"},{"translate":"${lang.system.message.startUp.success}"},{"text":"\n"},{"translate":"${lang.system.message.startUp.success_box}"}]}`,
				`playsound random.toast @s`
			);

			getPlayerList().map(player => loginProcess(player));
		}
	},
	/**
	 * ゲームリセットパネルを開きます
	 * @param {mc.Player} player プレイヤー
	 */
	async gameResetPanel(player) {
		runCommands(player, `playsound random.pop @s`);

		const response = await new ui.MessageFormData()
			.title(lang.system.panel.stop.title)
			.body(lang.system.panel.stop.confirmation)
			.button1(lang.words.button.continue)
			.button2(lang.words.button.cancel)
			.show(player);

		return response.selection === 1 ? resetGame() : null;
	},
	/**
	 * システムパネルを開きます。
	 * @param {mc.Player} player
	 */
	async systemPanel(player) {
		runCommands(player, `playsound random.pop @s`);

		const response = await new ui.ActionFormData()
			.title(lang.system.panel.title)
			.button(lang.system.panel.start.title)
			.button(lang.system.panel.team.title, 'textures/ui/icons/system/team')
			.button(lang.system.panel.setting.title, 'textures/ui/icons/system/slider')
			.button(lang.system.panel.inbox.title, reportData.find().map(id => reportData.find(id).read).includes(false) ? 'textures/ui/icons/system/exclamation' : 'textures/ui/icons/system/comment')
			.show(player);

		switch (response.selection) {
			case 0:
				return new ui.MessageFormData()
					.title(lang.system.panel.start.title)
					.body(`${lang.system.panel.start.confirmation}\n\nINFO.\n-Map: ${worldData.game.getMap()}\n-Time: ${worldData.setting.timer}`)
					.button1(lang.words.button.continue)
					.button2(lang.words.button.cancel)
					.show(player)
					.then(response => response.selection === 1 ? runGame() : this.systemPanel(player));
			case 1: return this.teamPanel(player);
			case 2: return this.settingPanel(player);
			case 3: return this.inboxPanel(player);
		}
	},
	/**
	 * チームパネルを開きます。
	 * @param {mc.Player} player
	 */
	async teamPanel(player) {
		const response = await new ui.ActionFormData()
			.title(lang.system.panel.team.title)
			.button(worldData.system.room_open ? lang.system.panel.team.room_open : lang.system.panel.team.room_close)
			.button(lang.system.panel.team.decide)
			.button(lang.system.panel.team.reset)
			.show(player);

		if (response.canceled) return this.systemPanel(player);

		if (response.selection === 0) {
			worldData.system.room_open = !worldData.system.room_open;

			return this.teamPanel(player);
		}
	},
	/**
	 * 設定パネルを開きます。
	 * @param {mc.Player} player
	 */
	async settingPanel(player) {
		runCommands(player, `playsound random.pop @s`);

		const response = await new ui.ModalFormData()
			.title(lang.system.panel.title)
			.slider(lang.system.panel.setting.timer + "\n" + lang.system.panel.setting.timer_seconds, 120, 300, 30, worldData.setting.timer)
			.dropdown(lang.system.panel.setting.map, ["The gray bridge", "The white trap"], worldData.setting.map)
			.dropdown(lang.system.panel.setting.quality, [lang.words.grade.high, lang.words.grade.default, lang.words.grade.low], worldData.setting.quality)
			.show(player);

		if (response.canceled) return this.systemPanel(player);

		worldData.setting.timer = response.formValues[0];
		worldData.setting.map = response.formValues[1];
		worldData.setting.quality = response.formValues[2];
	},
	/**
	 * 受信ボックスを開きます。
	 * @param {mc.Player} player
	 */
	async inboxPanel(player) {
		runCommands(player, `playsound random.pop @s`);

		const inboxPanelData = new ui.ActionFormData().title(lang.system.panel.inbox.title);

		reportData.find().length ? reportData.find().map(id => inboxPanelData.button(reportData.find(id).category)) : inboxPanelData.button(lang.system.panel.inbox.empty);

		const response = await inboxPanelData.show(player);

		if (response.canceled) return this.systemPanel(player);

		return this.inboxContentsPanel(player, reportData.find(reportData.find()[response.selection]), reportData.find()[response.selection]);
	},
	/**
	 * 報告の内容を開きます。
	 * @param {mc.Player} player プレイヤー
	 * @param {new RDStack} reportContents 報告の内容
	 * @param {uuid.v4} uuid
	 */
	async inboxContentsPanel (player, reportContents, id) {
		runCommands(player, `playsound random.pop @s`);

		reportData.manager(new RDMhs().read, id);

		const response = await new ui.MessageFormData()
			.title(lang.system.panel.inbox.title)
			.body(`player: ${reportContents.player}\ncategory: ${reportContents.category}\n\ndetail: ${reportContents.detail}`)
			.button1(lang.words.button.delete)
			.button2(lang.words.button.back)
			.show(player);

		if (response.selection === 1) {
			const response = await new ui.MessageFormData()
				.title(lang.system.panel.inbox.title)
				.body(lang.system.panel.inbox.delete_confirmation)
				.button1(lang.words.button.delete)
				.button2(lang.words.button.cancel)
				.show(player);

				if (response.selection === 0 || response.canceled) return this.inboxContentsPanel(player, reportContents, id);

				reportData.manager(new RDMhs().delete, id);
				return this.inboxPanel(player);
			}

		return this.inboxPanel(player);
	}
};
/**
 * メインパネル
 */
export const Main = {
	/**
 * メインパネルを開きます。
 * @param {mc.Player} player
 */
	async mainPanel(player) {
		runCommands(player, `playsound random.pop @s`);

		const response = await new ui.ActionFormData()
			.title(lang.main.panel.title)
			.button(lang.main.panel.kit.title)
			.button(lang.main.panel.report.title)
			.button(lang.main.panel.credit.title)
			.show(player);

		switch (response.selection) {
			// kit
			case 0: this.kitSelectPanel(player); break;
			// help
			case 1: this.reportSelectPanel(player); break;
			// credit
			case 2: this.creditPanel(player); break;
		}
	},
	/**
	 * キットの選択パネルを開きます。
	 * @param {mc.Player} player
	 */
	async kitSelectPanel(player) {
		runCommands(player, `playsound random.pop @s`);

		const kitSelectPanelData = new ui.ActionFormData()
			.title(lang.main.panel.kit.title)
			.button(lang.words.button.back);

		playerData.find(playerData.queryOptions.haveKits, player).map(kit => kitSelectPanelData.button("§l" + lang.main.panel.kit[kit].name, 'textures/ui/icons/kit/' + kit));

		const response = await kitSelectPanelData.show(player);

		response.selection >= 1 ? this.kitContentsPanel(player, playerData.find(playerData.queryOptions.haveKits, player)[response.selection - 1]) : this.mainPanel(player);
	},
	/**
	 * キットの情報パネルを開きます。
	 * @param {mc.Plyaer} player
	 * @param {number} kitSelection
	 */
	async kitContentsPanel(player, kitSelection) {
		runCommands(player, `playsound ${lang.main.panel.kit[kitSelection].sound}`);

		const response = await new ui.MessageFormData()
			.title(lang.main.panel.kit[kitSelection].name)
			.body(`${lang.main.panel.kit[kitSelection].info}\n\nPassive:\n\nSkill:\n`)
			.button1(lang.words.button.close)
			.button2(lang.words.button.back)
			.show(player);

		if (response.selection === 0 || response.canceled) return this.kitSelectPanel(player);
	},
	/**
	 * クレジットパネルを開きます。
	 * @param {mc.Player} player
	 */
	async creditPanel(player) {
		runCommands(player, `playsound random.pop @s`);

		const response = await new ui.MessageFormData()
			.title(lang.main.panel.credit.title)
			.body(`§l製作:§r \n@田舎のタケノコ\n\n§lスペシャルサンクス:§r \n-建築 / オキナ.\n-技術 / ham.\n-構想 / ふられみん.\n\n§lLICENCE:§r \nCC BY-ND 4.0\n\n© 2022 セロリ鯖`)
			.button1(lang.words.button.back)
			.button2(lang.words.button.close)
			.show(player);

		if (response.selection === 1 || response.canceled) return this.mainPanel(player);
	},
	/**
	 * レポートの選択パネルを開きます。
	 * @param {mc.Player} player 対象
	 * @param {boolean?} isClosed 閉じる
	 */
	async reportSelectPanel(player, isClosed) {
		runCommands(player, `playsound random.pop @s`);

		const reportSelectPanelData = new ui.ActionFormData()
			.title(lang.main.panel.report.title)
			.body(`\n${lang.main.panel.report.category}`);

		Object.values(reportOptions).map(e => reportSelectPanelData.button(e));

		const response = await reportSelectPanelData.show(player);

		if (response.canceled) return isClosed ? null : this.mainPanel(player);

		this.reportSendPanel(player, Object.values(reportOptions)[response.selection]);
	},
	/**
	 * レポートの送信パネルを開きます。
	 * @param {mc.Player} player 対象
	 * @param {string} category カテゴリ
	 * @param {boolean?} isClosed 閉じる
	 */
	async reportSendPanel(player, category, isClosed) {
		runCommands(player, `playsound random.pop @s`);

		const response = await new ui.ModalFormData()
			.title(lang.main.panel.report.title)
			.textField(`${lang.main.panel.report.category}: ${category}\n\n詳細`, "詳細をお書きください")
			.show(player);

		if (response.canceled) return isClosed ? null : this.reportSelectPanel(player);

		reportData.manager(new RDMhs().add, new uuid().v4(), new RDStack(player, category, response.formValues[0]));
	}
};
/**
 * エラーパネルを開きます。
 * @param {mc.Player} player 対象
 * @param {string} reason 理由
 * @param {number?} code エラーコード
 */
export const errorPanel = async (player, reason, code) => {
	player.runCommandAsync(`playersound random.pop @s`);

	const response = await new ui.MessageFormData()
		.title(lang.system.panel.title_error)
		.body(`§l§fcode: ${code}\n\n§c${reason}`)
		.button1(lang.words.button.report)
		.button2(lang.words.button.close)
		.show(player);

	if (response.selection === 1) return Main.reportSendPanel(player, lang.words.report.system, true);
};

errorPanel(a, a, "");
