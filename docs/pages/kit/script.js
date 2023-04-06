const kits = [
	'Warrior',
	'Archer',
	'Berserker',
	'Attractor',
	'Assassin'
];
const state = {
	popup: null
};

/**
 * @param {HTMLElement?} popup
 */
function switchPopup(popup = state.popup) {
	const display = popup.style.display === "block" ? "none" : "block";
	const overlay = document.getElementById('popup_overlay');

	state.popup = popup;
	popup.style.display = display;
	overlay.style.display = display;
}

const items = kits.map(kit => ({
	item: document.getElementById(`${kit}.item`),
	click: () => switchPopup(document.getElementById(`${kit}.popup`))
}));

items.forEach(({ item, click }) => item.addEventListener('click', click));

document.getElementById('popup_X').addEventListener('click', () => switchPopup());

