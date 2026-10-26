import { nextTick, ref, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';
import { toast } from 'vue3-toastify';

import { useGiveawayStore } from '@/stores/giveaway';
import useGames, { type GameTrick } from './games/useGames';

type InputMode = 'mouse' | 'touch' | 'pen' | 'unknown';

function shuffleGames<T>(games: T[]) {
	const shuffledGames = [...games];

	for (let index = shuffledGames.length - 1; index > 0; index--) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[shuffledGames[index], shuffledGames[swapIndex]] = [shuffledGames[swapIndex], shuffledGames[index]];
	}

	return shuffledGames;
}

export function useHalloweenGame() {
	const giveawayStore = useGiveawayStore();
	const { addLetter, newGame, fetchActiveGiveaway } = giveawayStore;
	const { isGameComplete, isGameActive } = storeToRefs(giveawayStore);
	const showGhost = shallowRef(false);
	const showBlackout = ref(false);
	const hideTreatButton = ref(false);
	const ghostMessage = ref('');
	const receivedTreat = ref(false);
	const isResolvingTrickGame = ref(false);
	const ghostTimer = ref<ReturnType<typeof setTimeout> | null>(null);
	const inputMode = ref<InputMode>('mouse');
	const { allGames } = useGames({
		setGhostMessage: (message: string) => {
			ghostMessage.value = message;
		},
		appendGhost: (ghostDuration?: number) => {
			appendGhost(ghostDuration);
		},
		setShowBlackout: (value: boolean) => {
			showBlackout.value = value;
		},
		setHideTreatButton: (value: boolean) => {
			hideTreatButton.value = value;
		},
		getInputMode: () => inputMode.value,
	});
	let availableTricks: GameTrick[] = shuffleGames(allGames);

	function appendGhost(ghostDuration = 4000) {
		showGhost.value = true;
		nextTick();
		ghostTimer.value = setTimeout(() => {
			showGhost.value = false;
		}, ghostDuration);
	}

	function reset() {
		if (ghostTimer.value) {
			clearTimeout(ghostTimer.value);
		}
		showGhost.value = false;
		ghostMessage.value = '';
	}

	function dismissGhost() {
		showGhost.value = false;
	}

	function setInputMode(pointerType: string) {
		if (pointerType === 'mouse' || pointerType === 'touch' || pointerType === 'pen') {
			inputMode.value = pointerType;
			return;
		}

		inputMode.value = 'unknown';
	}

	function onGameButtonPointerDown(event: PointerEvent) {
		setInputMode(event.pointerType);
	}

	function getNextTrick() {
		if (availableTricks.length === 0) {
			availableTricks = shuffleGames(allGames);
		}

		return availableTricks.pop();
	}

	function trick() {
		isResolvingTrickGame.value = true;
		reset();
		const nextTrick = getNextTrick();
		if (!nextTrick) {
			isResolvingTrickGame.value = false;
			return;
		}
		nextTrick?.();
	}

	function treat() {
		const startedFromTrick = isResolvingTrickGame.value;
		isResolvingTrickGame.value = false;
		reset();

		if (isGameComplete.value) {
			ghostMessage.value = `You've collected all the letters! Head to the Giveaway page to enter the giveaway.`;
			appendGhost(3500);
			return;
		}

		if (receivedTreat.value) {
			if (startedFromTrick) {
				return;
			}

			ghostMessage.value = `Save some for the other kids!  \nHere's a trick instead!`;
			appendGhost(1500);
			setTimeout(() => {
				trick();
			}, 1700);
			return;
		}

		const nextLetter = addLetter();

		if (!nextLetter) {
			console.error('Unable to get next letter');
			toast.error('There seems to be an issue. Please contact support@dangerlettuce.com if this issue persists');
			return;
		}

		if (isGameComplete.value) {
			ghostMessage.value = `${ghostMessage.value}Congratulations, you found all the letters!  Head to the Giveaway page to enter!`;
			appendGhost(30000);
		} else {
			ghostMessage.value = `I added a '${nextLetter.toUpperCase()}' to your trick-or-treat bucket.`;
			appendGhost(6000);
		}

		receivedTreat.value = true;
	}

	async function initializeGame() {
		await fetchActiveGiveaway();
		if (!isGameActive.value && !isGameComplete.value) {
			newGame();
		}
	}

	return {
		showGhost,
		showBlackout,
		hideTreatButton,
		ghostMessage,
		trick,
		treat,
		onGameButtonPointerDown,
		dismissGhost,
		initializeGame,
	};
}
