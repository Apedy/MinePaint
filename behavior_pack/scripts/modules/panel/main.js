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


export const mainPanel = async player => {
	const response = await new mcui.ActionFormData()
		.title(lang.main.panel.title)
		.button(lang.main.panel.kit.title)
		.button(lang.main.panel.status.title)
		.button(lang.main.panel.report.title)
		.button(lang.main.panel.credit.title)
		.show(player);

	switch (response.selection) {
		case 0: return kitSelect(player);
		case 1: return status(player);
		case 2: return reportSelect(player);
		case 3: return credit(player);
	}
};

export const kitSelect = async player => {
	const kitSelectPanelData = new mcui.ActionFormData()
		.title(lang.main.panel.kit.title)
		.button(lang.words.button.back);

	admin.PlayerStatus.find(player, admin.PlayerStatus.queryOptions.haveKits).forEach(kit => kitSelectPanelData.button("§l" + lang.words.kit[kit], 'textures/ui/icons/kit/' + kit));

	const response = await kitSelectPanelData.show(player);

	response.selection === 0 || response.canceled ? mainPanel(player) : kitContents(player, admin.PlayerStatus.find(player, admin.PlayerStatus.queryOptions.haveKits)[response.selection - 1]);
};
const kitContents = async (player, kitSelection) => {
	mcLib.runCommands(player, `playsound ${lang.main.panel.kit[kitSelection].sound}`);

	const response = await new mcui.MessageFormData()
		.title(lang.words.kit[kitSelection])
		.body(`${lang.main.panel.kit[kitSelection].info}\n\nPassive:\n\nSkill:\n`)
		.button1(lang.words.button.close)
		.button2(lang.words.button.back)
		.show(player);

	if (response.selection === 0 || response.canceled) return kitSelect(player);
};

export const status = async player => {
	const playerLevel = admin.PlayerStatus.find(player, admin.PlayerStatus.queryOptions.level),
				playerSp = admin.PlayerStatus.find(player, admin.PlayerStatus.queryOptions.sp);

	const response = await new mcui.MessageFormData()
		.title(lang.main.panel.status.title)
		.body(`<${lang.words.status.player}> ${player.nameTag}[Lv.${playerLevel}]\n\n<${lang.words.status.sp}> ${playerSp}`)
		.button1(lang.words.button.close)
		.button2(lang.words.button.back)
		.show(player);

	if (response.selection === 0 || response.canceled) return mainPanel(player);
};

export const reportSelect = async (player, isClosed) => {
	const reportSelectPanelData = new mcui.ActionFormData()
		.title(lang.main.panel.report.title)
		.body(`\n${lang.main.panel.report.category}`);

	Object.values(admin.worldReportOptions).map(e => reportSelectPanelData.button(e));

	const response = await reportSelectPanelData.show(player);

	if (response.canceled) return isClosed ? null : mainPanel(player);

	reportSend(player, Object.values(admin.worldReportOptions)[response.selection]);
};
const reportSend = async (player, category, isClosed) => {
	mcLib.runCommands(player, "playsound random.pop @s");

	const response = await new mcui.ModalFormData()
		.title(lang.main.panel.report.title)
		.textField(`${lang.main.panel.report.category}: ${category}\n\n詳細`, "詳細をお書きください")
		.show(player);

	if (response.canceled) return isClosed ? null : reportSelect(player);

	admin.WorldReport.create(player, category, response.formValues[0]);
};

export const credit = async player => {
	const response = await new mcui.MessageFormData()
		.title(lang.main.panel.credit.title)
		.body(`§lCreator:§r \n@Apedy_tech\n\n§lSpecial Thanks:§r \n-建築 / オキナ.\n-技術 / ham.\n-構想 / ふられみん.\n\n§lLICENCE:§r \nMIT License\nGNU General Public License v3.0\n\n© 2023 Apedy`)
		.button1(lang.words.button.back)
		.button2(lang.words.button.close)
		.show(player);

	if (response.selection === 1 || response.canceled) return mainPanel(player);
};
