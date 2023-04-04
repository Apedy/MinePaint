const state = {
	popup: null,
}

/**
 * @param {HTMLElement?} popup
 */
function switchPopup(popup = state.popup) {
	state.popup = popup
	const getOverlay = () => document.getElementById('popup_overlay');

	popup.style.display === "block" ? popup.style.display = "none" : popup.style.display = "block"
	getOverlay().style.display === "block" ? getOverlay().style.display = "none" : getOverlay().style.display = "block"
}

const Warrior = {
	item: document.getElementById('Warrior.item'),
	popup: document.getElementById('Warrior.popup'),
	click() {
		console.log("Warrior!")
		switchPopup(Warrior.popup)
	}
}
const Archer = {
	item: document.getElementById('Archer.item'),
	popup: document.getElementById('Archer.popup'),
	click() {
		console.log("Archer!")
		switchPopup(Archer.popup)
	}
}
const Berserker = {
	item: document.getElementById('Berserker.item'),
	popup: document.getElementById('Berserker.popup'),
	click() {
		console.log("Berserker!")
		switchPopup(Berserker.popup)
	}
}

Warrior.item.addEventListener('click', Warrior.click);
Archer.item.addEventListener('click', Archer.click);
Berserker.item.addEventListener('click', Berserker.click);
document.getElementById('popup_X').addEventListener('click', () => switchPopup())
