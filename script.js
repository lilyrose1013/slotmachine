const machine1Rewards = [
	"Win Car",
	"Pay Rent",
	"No Taxes",
	"College Paid For",
	"Rent Paid For",
	"Christmas Bonus"
];

const machine2OppositeOutcomes = [
	"Flat Tire",
	"Late Fee",
	"Higher Taxes",
	"Tuition Bill",
	"Rent Due",
	"No Bonus"
];

const machine2SmallWin = "Win $5 on the lottery";
let machine2SpinCount = 0;
let selectedMachineId = null;

const loadScreen = document.querySelector("#load-screen");
const machineChoiceButtons = document.querySelectorAll(".machine-choice-btn");
const gameArea = document.querySelector("#game-area");
const machinesContainer = document.querySelector(".machines");

function getRandomSymbol(pool) {
	const index = Math.floor(Math.random() * pool.length);
	return pool[index];
}

function getDifferentSymbol(symbolToAvoid, pool) {
	let next = getRandomSymbol(pool);

	while (next === symbolToAvoid) {
		next = getRandomSymbol(pool);
	}

	return next;
}

function showPopup(machineElement, didWin, message) {
	const popupElement = machineElement.querySelector(".machine-popup");

	if (!popupElement) {
		return;
	}

	if (machineElement.popupTimeoutId) {
		clearTimeout(machineElement.popupTimeoutId);
	}

	popupElement.textContent = message;
	popupElement.classList.remove("win", "lose", "show");
	popupElement.classList.add(didWin ? "win" : "lose", "show");
}

function hidePopup(machineElement) {
	const popupElement = machineElement.querySelector(".machine-popup");

	if (!popupElement) {
		return;
	}

	if (machineElement.popupTimeoutId) {
		clearTimeout(machineElement.popupTimeoutId);
	}

	popupElement.classList.remove("show", "win", "lose");
}

function spinMachine(machineElement) {
	const machineId = machineElement.dataset.machine;
	const reels = machineElement.querySelectorAll(".reel");

	if (machineId === "2") {
		machine2SpinCount += 1;
		const isWinningSpin = machine2SpinCount % 10 === 0;

		if (isWinningSpin) {
			reels.forEach((reel) => {
				reel.textContent = machine2SmallWin;
			});
			showPopup(machineElement, true, machine2SmallWin);
			return true;
		}

		const first = getRandomSymbol(machine2OppositeOutcomes);
		const second = getDifferentSymbol(first, machine2OppositeOutcomes);

		if (reels[0]) {
			reels[0].textContent = first;
		}

		if (reels[1]) {
			reels[1].textContent = second;
		}

		showPopup(machineElement, false, `${first} + ${second}`);
		return false;
	}

	const winningReward = getRandomSymbol(machine1Rewards);

	reels.forEach((reel) => {
		reel.textContent = winningReward;
	});

	showPopup(machineElement, true, winningReward);
	return true;
}

const machineBoxes = document.querySelectorAll(".machine-box");

function setMachineCoinState(machineElement, hasCoin) {
	machineElement.dataset.hasCoin = hasCoin ? "true" : "false";
	const coinButton = machineElement.querySelector(".insert-coin-btn");

	const spinButton = machineElement.querySelector(".machine-spin");
	const isSelectedMachine = machineElement.dataset.machine === selectedMachineId;
	if (coinButton) {
		coinButton.classList.toggle("coin-inserted", hasCoin);
		coinButton.disabled = !isSelectedMachine || hasCoin;
	}

	if (!spinButton) {
		return;
	}

	spinButton.disabled = !isSelectedMachine || !hasCoin;
}

function initializeMachineCounters(machineElement) {
	machineElement.dataset.insertedCoins = "0";
	machineElement.dataset.gainedCoins = "0";
	updateMachineCounters(machineElement);
}

function updateMachineCounters(machineElement) {
	const insertedElement = machineElement.querySelector(".inserted-count");
	const gainedElement = machineElement.querySelector(".gained-count");

	if (insertedElement) {
		insertedElement.textContent = machineElement.dataset.insertedCoins || "0";
	}

	if (gainedElement) {
		gainedElement.textContent = machineElement.dataset.gainedCoins || "0";
	}
}

function incrementMachineCounter(machineElement, counterKey) {
	const currentValue = Number(machineElement.dataset[counterKey] || "0");
	machineElement.dataset[counterKey] = String(currentValue + 1);
	updateMachineCounters(machineElement);
}

if (loadScreen && gameArea && machineChoiceButtons.length > 0) {
	machineChoiceButtons.forEach((choiceButton) => {
		choiceButton.addEventListener("click", () => {
			selectedMachineId = choiceButton.dataset.machineChoice;

			if (!selectedMachineId) {
				return;
			}

			loadScreen.classList.add("hidden");
			gameArea.classList.remove("game-hidden");

			machineBoxes.forEach((machineElement) => {
				const isSelected = machineElement.dataset.machine === selectedMachineId;

				machineElement.classList.toggle("machine-hidden", !isSelected);
				setMachineCoinState(machineElement, false);
			});

			if (machinesContainer) {
				machinesContainer.classList.add("single-machine");
			}
		});
	});
}

machineBoxes.forEach((machineElement) => {
	const spinButton = machineElement.querySelector(".machine-spin");
	const coinButton = machineElement.querySelector(".insert-coin-btn");
	if (!spinButton) {
		return;
	}

	initializeMachineCounters(machineElement);
	setMachineCoinState(machineElement, false);

	if (coinButton) {
		coinButton.addEventListener("click", () => {
			if (machineElement.dataset.machine !== selectedMachineId) {
				return;
			}

			if (machineElement.dataset.hasCoin === "true") {
				return;
			}

			incrementMachineCounter(machineElement, "insertedCoins");
			setMachineCoinState(machineElement, true);
		});
	}

	spinButton.addEventListener("click", () => {
		if (
			machineElement.dataset.machine !== selectedMachineId ||
			machineElement.dataset.hasCoin !== "true"
		) {
			return;
		}

		setMachineCoinState(machineElement, false);

		hidePopup(machineElement);
		setTimeout(() => {
			const isWin = spinMachine(machineElement);

			if (isWin) {
				incrementMachineCounter(machineElement, "gainedCoins");
			}
		}, 120);
	});
});
