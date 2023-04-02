function popupSwitch(element) {
	if (element.style.display === "block") element.style.display = "none"
	else element.style.display = "block"
}

const Warrior = {
	item: document.getElementById('Warrior.item'),
	popup: document.getElementById('Warrior.popup'),
	click() {
		console.log("Warrior!")
		popupSwitch(Warrior.popup)
	}
}
const Archer = {
	item: document.getElementById('Archer.item'),
	popup: document.getElementById('Archer.popup'),
	click() {
		console.log("Archer!")
		popupSwitch(Archer.popup)
	}
}
const Berserker = {
	item: document.getElementById('Berserker.item'),
	popup: document.getElementById('Berserker.popup'),
	click() {
		console.log("Berserker!")
		popupSwitch(Berserker.popup)
	}
}

Warrior.item.addEventListener('click', Warrior.click);
Archer.item.addEventListener('click', Archer.click);
Berserker.item.addEventListener('click', Berserker.click);
