import { blackholeGame } from './Blackhole/blackhole';
import { runaway } from './Runaway/runaway';
import { createFlashlight, destroyFlashlight } from './Flashlight/flashlight';

type SetBoolean = (value: boolean) => void;

type TrickUiContext = {
	setGhostMessage: (message: string) => void;
	appendGhost: (ghostDuration?: number) => void;
	setShowBlackout: SetBoolean;
	setHideTreatButton: SetBoolean;
	getInputMode: () => 'mouse' | 'touch' | 'pen' | 'unknown';
};

export type GameTrick = () => void;

export function appendClassToBody(className: string, timeout = 2000) {
	const bodyElement = document.body;
	bodyElement.classList.add(className);
	setTimeout(() => {
		bodyElement.classList.remove(className);
	}, timeout);
}

function shuffleGames<T>(games: T[]) {
	const shuffledGames = [...games];

	for (let index = shuffledGames.length - 1; index > 0; index--) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[shuffledGames[index], shuffledGames[swapIndex]] = [shuffledGames[swapIndex], shuffledGames[index]];
	}

	return shuffledGames;
}

export default function useGames({ setGhostMessage, appendGhost, setShowBlackout, setHideTreatButton, getInputMode }: TrickUiContext) {
	function createRunawayGame() {
		let stopRunaway: (() => void) | null = null;

		function stop() {
			if (!stopRunaway) {
				return;
			}

			stopRunaway();
			stopRunaway = null;
		}

		function play() {
			const treatButton = document.querySelector('.treat') as HTMLElement | null;
			if (!treatButton) {
				return;
			}

			stop();

			setGhostMessage("Tag, you're it!");
			appendGhost(2500);

			const inputMode = getInputMode();
			const interactionMode = inputMode === 'touch' || inputMode === 'pen' ? 'click' : 'hover';

			stopRunaway = runaway(treatButton, 25, {
				minimumAttempts: 3,
				interactionMode,
				zIndex: '100000',
				onCaught: () => {
					stopRunaway = null;
				},
			});
		}

		return { play, stop };
	}

	function createHideNSeekGame() {
		let stopHideNSeek: (() => void) | null = null;
		let hideNSeekStartTimer: ReturnType<typeof setTimeout> | null = null;
		const blackoutRevealDelay = 700;

		function stop() {
			if (hideNSeekStartTimer) {
				clearTimeout(hideNSeekStartTimer);
				hideNSeekStartTimer = null;
			}

			if (stopHideNSeek) {
				stopHideNSeek();
				stopHideNSeek = null;
			}

			setShowBlackout(false);
			destroyFlashlight();
			document.body.classList.remove('hide-overflow');
		}

		function play() {
			const treatButton = document.querySelector('.treat') as HTMLElement | null;
			if (!treatButton) {
				return;
			}

			stop();

			setGhostMessage(`Count to ten, I'll hide!`);
			appendGhost(1500);
			setShowBlackout(true);
			createFlashlight();
			document.body.classList.add('hide-overflow');

			const inputMode = getInputMode();
			const interactionMode = inputMode === 'touch' || inputMode === 'pen' ? 'click' : 'hover';

			hideNSeekStartTimer = setTimeout(() => {
				hideNSeekStartTimer = null;
				stopHideNSeek = runaway(treatButton, 100, {
					minimumAttempts: 0,
					interactionMode,
					zIndex: '9000',
					onCaught: () => {
						stopHideNSeek = null;
						setShowBlackout(false);
						destroyFlashlight();
						document.body.classList.remove('hide-overflow');
					},
				});
			}, blackoutRevealDelay);
		}

		return { play, stop };
	}

	const runawayGameController = createRunawayGame();
	const hideNSeekGameController = createHideNSeekGame();

	function stopActiveGameEffects() {
		runawayGameController.stop();
		hideNSeekGameController.stop();
	}

	function runawayGame() {
		stopActiveGameEffects();
		runawayGameController.play();
	}

	function hideNSeek() {
		stopActiveGameEffects();
		hideNSeekGameController.play();
	}

	function upsideDownScreen() {
		stopActiveGameEffects();
		setGhostMessage(`I'm so dizzy!`);
		appendGhost(6000);
		appendClassToBody('flip-upside-down', 4000);
	}

	function doAFlip() {
		stopActiveGameEffects();
		setGhostMessage('Weeeeeeeeeeeeeeeeeeee');
		appendGhost(4500);
		appendClassToBody('hide-overflow', 4000);
		appendClassToBody('barrel-roll', 4000);
	}

	function rickRoll() {
		stopActiveGameEffects();
		setGhostMessage('Never gonna GIVE YOU UP.....');
		appendGhost(7000);
		setTimeout(() => {
			window.open('https://www.youtube.com/watch?v=2qBlE2-WL60', '_blank')?.focus();
		}, 400);
	}

	function hideTreat() {
		stopActiveGameEffects();
		setGhostMessage(`You didn't need that anyway, did you?`);
		appendGhost(5000);
		appendClassToBody('hide-overflow', 5000);
		setHideTreatButton(true);
		setTimeout(() => {
			setHideTreatButton(false);
		}, 5000);
	}


	const allGames: GameTrick[] = shuffleGames([
		runawayGame,
		hideNSeek,
		upsideDownScreen,
		doAFlip,
		// rickRoll,
		// hideTreat,
		blackholeGame,
	]);

	return { allGames };
}