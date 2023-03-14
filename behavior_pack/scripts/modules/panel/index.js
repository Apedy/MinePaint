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
import * as mcui from '@minecraft/server-ui';

import * as system from './system';
import * as main from './main';
import { lang } from '../../@minepaint/lang';


/**
 * Only admin can use it.
 */
export class SystemPanel {
	/**
	 * Show the System panel.
	 * @param {mc.Player} player
	 */
	static show(player) {
		player.runCommandAsync("playsound random.pop @s");
		system.systemPanel(player);
	}
	/**
	 * Show the Startup panel.
	 * @param {mc.Player} player
	 */
	static startup(player) {
		player.runCommandAsync("playsound random.pop @s");
		system.startup(player);
	}
	/**
	 * Show the Reset Game panel.
	 * @param {mc.Player} player
	 */
	static resetGame(player) {
		player.runCommandAsync("playsound random.pop @s");
		system.resetGame(player);
	}
	/**
	 * Show the Team panel.
	 * @param {mc.Player} player
	 */
	static team(player) {
		player.runCommandAsync("playsound random.pop @s");
		system.team(player);
	}
	/**
	 * Show the Setting panel.
	 * @param {mc.Player} player
	 */
	static setting(player) {
		player.runCommandAsync("playsound random.pop @s");
		system.setting(player);
	}
	/**
	 * Show the Inbox panel.
	 * @param {mc.Player} player
	 */
	static inbox(player) {
		player.runCommandAsync("playsound random.pop @s");
		system.inboxSelect(player);
	}
}

/**
 * All players can use it.
 */
export class MainPanel {
	/**
	 * Show the Main panel.
	 * @param {mc.Player} player
	 */
	static show(player) {
		player.runCommandAsync("playsound random.pop @s");
		main.mainPanel(player);
	}
	/**
	 * Show the Kit panel.
	 * @param {mc.Player} player
	 */
	static kit(player) {
		player.runCommandAsync("playsound random.pop @s");
		main.kitSelect(player);
	}
	/**
	 * show the Status panel.
	 * @param {mc.Player} player プレイヤー
	 */
	static status(player) {
		player.runCommandAsync("playsound random.pop @s");
		main.status(player);
	}
	/**
	 * show the Report panel.
	 * @param {mc.Player} player
	 * @param {boolean?} isClosed
	 */
	static report(player, isClosed) {
		player.runCommandAsync("playsound random.pop @s");
		main.reportSelect(player, isClosed);
	}
	static credit(player) {
		player.runCommandAsync("playsound random.pop @s");
		main.credit(player, isClosed);
	}
}

export class Error {
	/**
	 * show the Error panel.
	 * @param {mc.Player} player
	 * @param {string} content
	 * @param {number?} majErrorCode
	 * @param {number?} minErrorCode
	 */
	static async show (player, content, majErrorCode, minErrorCode) {
		player.runCommandAsync("playersound random.pop @s");

		const response = await new mcui.MessageFormData()
			.title(lang.system.panel.title_error)
			.body(`§l§fError Code: §c${majErrorCode}.${minErrorCode}\n\n§r§f${content}`)
			.button1(lang.words.button.report)
			.button2(lang.words.button.close)
			.show(player);

		if (response.selection === 1) Main.report(player, true);
	}
}
