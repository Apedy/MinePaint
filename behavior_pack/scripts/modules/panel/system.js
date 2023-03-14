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

import * as mcui from '@minecraft/server-ui';
import { World } from '../../lib/minecraft';

import * as admin from '../admin/index';
import { lang } from '../../@minepaint/lang';

const mcLib = new World("overworld");


export const systemPanel = async player => {
	const response = await new mcui.ActionFormData()
		.title(lang.system.panel.title)
		.button(lang.system.panel.start.title)
		.button(lang.system.panel.team.title, 'textures/ui/icons/system/team')
		.button(lang.system.panel.setting.title, 'textures/ui/icons/system/slider')
		.button(lang.system.panel.inbox.title, admin.WorldReport.filter(false, admin.WorldReport.queryOptions.read).length ? 'textures/ui/icons/system/exclamation' : 'textures/ui/icons/system/comment')
		.show(player);

	switch (response.selection) {
		case 0:
			return new mcui.MessageFormData()
				.title(lang.system.panel.start.title)
				.body(`${lang.system.panel.start.confirmation}\n\nINFO.\n-Map: ${admin.worldData.game.getMap()}\n-Time: ${admin.worldData.setting.timer}`)
				.button1(lang.words.button.continue)
				.button2(lang.words.button.cancel)
				.show(player)
				.then(response => response.selection ? admin.runGame() : systemPanel(player));
		case 1: return team(player);
		case 2: return setting(player);
		case 3: return inboxSelect(player);
	}
};

export const startup = async player => {
	const response = await new mcui.ModalFormData()
		.title(lang.system.panel.title)
		.slider(lang.system.panel.startUp_confirmation + "\n" + lang.system.panel.startUp_note + "\n\n§r§lNULL", 0, 5, 1)
		.toggle("§lABEND")
		.show(player);

	if (response.formValues[1]) {
		admin.worldData.system.startUp = true;
		admin.resetGame();
		admin.resetSystem();

		mcLib.getPlayerList().forEach(player => admin.loginProcess(player));
	}
	else {
		admin.worldData.system.startUp = true;
		admin.resetSystem();

		mcLib.getPlayerList().forEach(player => admin.loginProcess(player));
	}
};

export const resetGame = async player => {
	mcLib.runCommands(player, `playsound random.pop @s`);

	const response = await new mcui.MessageFormData()
		.title(lang.system.panel.stop.title)
		.body(lang.system.panel.stop.confirmation)
		.button1(lang.words.button.continue)
		.button2(lang.words.button.cancel)
		.show(player);

	return response.selection === 1 ? admin.resetGame() : null;
};

export const team = async player => {
	const response = await new mcui.ActionFormData()
		.title(lang.system.panel.team.title)
		.button(admin.worldData.system.room_open ? lang.system.panel.team.room_close : lang.system.panel.team.room_open)
		.button(lang.system.panel.team.decide)
		.button(lang.system.panel.team.reset)
		.show(player);

	if (response.canceled) return systemPanel(player);

	if (response.selection === 0) {
		mcLib.runCommands(mcLib.dimension, `fill 4 -60 -12 4 -58 -12 ${admin.worldData.system.room_open ? "cobblestone_wall" : "air"} 0 destroy`);
		mcLib.runCommands(mcLib.dimension, `fill 5 -60 -11 5 -58 -11 ${admin.worldData.system.room_open ? "cobblestone_wall" : "air"} 0 destroy`);

		if (admin.worldData.system.room_open) mcLib.getPlayerList().forEach(player => mcLib.runCommands(player, "execute as @s at @s if block ~~-4 ~ white_glazed_terracotta run tp @s 0 -60 0 0 0"));

		admin.worldData.system.room_open = !admin.worldData.system.room_open;


		return team(player);
	}
	else if (response.selection === 2) {
		admin.PlayerStatus.get().forEach(content => admin.PlayerStatus.set(admin.PlayerStatus.queryOptions.inTeam, content.player, null, true));
	}
};

export const setting = async player => {
	const response = await new mcui.ModalFormData()
		.title(lang.system.panel.title)
		.slider(lang.system.panel.setting.timer + "\n" + lang.system.panel.setting.timer_seconds, 120, 300, 30, admin.worldData.setting.timer)
		.dropdown(lang.system.panel.setting.map, ["The gray bridge", "The white trap"], admin.worldData.setting.map)
		.dropdown(lang.system.panel.setting.quality, [lang.words.grade.high, lang.words.grade.default, lang.words.grade.low], admin.worldData.setting.quality)
		.show(player);

	if (response.canceled) return systemPanel(player);

	admin.worldData.setting.timer = response.formValues[0];
	admin.worldData.setting.map = response.formValues[1];
	admin.worldData.setting.quality = response.formValues[2];
};

export const inboxSelect = async player => {
	const inboxPanelData = new mcui.ActionFormData().title(lang.system.panel.inbox.title);

	admin.WorldReport.get().length ? admin.WorldReport.get().map(content => inboxPanelData.button(admin.WorldReport.find(content.id).category)) : inboxPanelData.button(lang.system.panel.inbox.empty);

	const response = await inboxPanelData.show(player);

	if (response.canceled) return systemPanel(player);

	inboxContents(player, admin.WorldReport.get()[response.selection]);
	return inboxContents(player, admin.WorldReport.find(admin.WorldReport.find()[response.selection]), admin.WorldReport.find()[response.selection]);
};
export const inboxContents = async (player, content) => {
	mcLib.runCommands(player, "playsound random.pop @s");

	admin.WorldReport.makeRead(content.id);

	const response = await new mcui.MessageFormData()
		.title(lang.system.panel.inbox.title)
		.body(`player: ${content.player}\ncategory: ${content.category}\n\ndetail: ${content.detail}`)
		.button1(lang.words.button.delete)
		.button2(lang.words.button.back)
		.show(player);

	if (response.selection === 1) {
		const response = await new mcui.MessageFormData()
			.title(lang.system.panel.inbox.title)
			.body(lang.system.panel.inbox.delete_confirmation)
			.button1(lang.words.button.delete)
			.button2(lang.words.button.cancel)
			.show(player);

		if (response.selection === 0 || response.canceled) return inboxContents(player, content);

		admin.WorldReport.delete(content.id);
		return inboxSelect(player);
	}

	return inboxSelect(player);
};
