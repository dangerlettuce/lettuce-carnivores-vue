type RunawayOptions = {
	onCaught?: () => void;
	interactionMode?: 'hover' | 'click';
	minimumAttempts?: number;
	zIndex?: string;
};

export function runaway(element: HTMLElement, successRate: number, options: RunawayOptions = {}) {
	let interactionCount = 0;
	let wasCaught = false;
	let isCatchable = false;
	let isStopped = false;
	const interactionMode = options.interactionMode ?? 'hover';
	const minimumAttempts = Math.max(0, Math.floor(options.minimumAttempts ?? 3));
	const normalizedSuccessRate = normalizeSuccessRate(successRate);
	const originalStyles = {
		opacity: element.style.opacity,
		pointerEvents: element.style.pointerEvents,
		zIndex: element.style.zIndex,
	};
	const hadInert = element.hasAttribute("inert");
	const originalAriaHidden = element.getAttribute("aria-hidden");

	const initialRect = element.getBoundingClientRect();
	const runawayElement = element.cloneNode(true) as HTMLElement;
	runawayElement.style.position = "fixed";
	runawayElement.style.top = `${initialRect.top}px`;
	runawayElement.style.left = `${initialRect.left}px`;
	runawayElement.style.width = `${initialRect.width}px`;
	runawayElement.style.height = `${initialRect.height}px`;
	runawayElement.style.margin = "0";
	if (options.zIndex) {
		runawayElement.style.zIndex = options.zIndex;
	}

	runawayElement.removeAttribute("inert");
	runawayElement.removeAttribute("aria-hidden");
	runawayElement.setAttribute("data-runaway-clone", "true");

	element.parentElement?.appendChild(runawayElement);

	element.style.opacity = "0";
	element.style.pointerEvents = "none";
	element.style.zIndex = "0";
	element.setAttribute("inert", "");
	element.setAttribute("aria-hidden", "true");

	function animateMove(target: HTMLElement, top: number, left: number) {
		const currentRect = target.getBoundingClientRect();
		const currentTop = currentRect.top;
		const currentLeft = currentRect.left;

		target.animate(
			[
				{ top: `${currentTop}px`, left: `${currentLeft}px` },
				{ top: `${top}px`, left: `${left}px` },
			],
			{
				duration: 350,
				easing: "cubic-bezier(0.075, 0.82, 0.165, 1)",
				fill: "forwards",
			},
		);

		target.style.top = `${top}px`;
		target.style.left = `${left}px`;
	}

	function moveToRandomPosition(target: HTMLElement, options?: { requireLargeStep?: boolean; allowSmallStep?: boolean }) {
		const currentRect = target.getBoundingClientRect();
		const maxTop = Math.max(0, window.innerHeight - target.offsetHeight);
		const maxLeft = Math.max(0, window.innerWidth - target.offsetWidth);

		const requireLargeStep = options?.requireLargeStep ?? false;
		const allowSmallStep = options?.allowSmallStep ?? false;
		const largeStepThreshold = Math.max(180, Math.min(window.innerWidth, window.innerHeight) * 0.35);
		const useSmallStep = allowSmallStep && Math.random() < 0.45;

		let top = 0;
		let left = 0;

		if (useSmallStep) {
			const maxDelta = 220;
			const minDelta = 70;
			const deltaTop = getSignedRandomNumber(minDelta, maxDelta);
			const deltaLeft = getSignedRandomNumber(minDelta, maxDelta);
			top = clamp(currentRect.top + deltaTop, 0, maxTop);
			left = clamp(currentRect.left + deltaLeft, 0, maxLeft);
		} else {
			top = getRandomNumber(maxTop);
			left = getRandomNumber(maxLeft);
		}

		if (requireLargeStep) {
			let attempts = 0;
			while (attempts < 20 && getDistance(currentRect.top, currentRect.left, top, left) < largeStepThreshold) {
				top = getRandomNumber(maxTop);
				left = getRandomNumber(maxLeft);
				attempts += 1;
			}
		}

		animateMove(target, top, left);
	}

	const onMouseOver = () => {
		if (wasCaught || isStopped) {
			return;
		}

		if (interactionMode !== 'hover') {
			return;
		}

		interactionCount += 1;
		const move = shouldMove(interactionCount, normalizedSuccessRate);
		isCatchable = !move;

		if (!move) {
			return;
		}

		moveToRandomPosition(runawayElement, { allowSmallStep: true });
	};

	const onClick = (event: MouseEvent) => {
		if (wasCaught || isStopped) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (interactionMode === 'click') {
			interactionCount += 1;
			const move = shouldMove(interactionCount, normalizedSuccessRate);
			if (move) {
				isCatchable = false;
				moveToRandomPosition(runawayElement, { allowSmallStep: true });
				return;
			}

			isCatchable = true;
		}

		if (isCatchable) {
			wasCaught = true;
			isCatchable = false;
			stopRunaway();
			options.onCaught?.();
			queueMicrotask(() => {
				element.click();
			});
			return;
		}
	};

	runawayElement.addEventListener("mouseover", onMouseOver);
	runawayElement.addEventListener("click", onClick);

	// Intro move so users immediately understand this is the runaway game.
	moveToRandomPosition(runawayElement, { requireLargeStep: true });

	function getRandomNumber(max: number) {
		return Math.floor(Math.random() * (max + 1));
	}

	function getSignedRandomNumber(min: number, max: number) {
		const value = Math.floor(Math.random() * (max - min + 1)) + min;
		return Math.random() < 0.5 ? -value : value;
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}

	function getDistance(fromTop: number, fromLeft: number, toTop: number, toLeft: number) {
		const deltaTop = toTop - fromTop;
		const deltaLeft = toLeft - fromLeft;
		return Math.hypot(deltaTop, deltaLeft);
	}

	function shouldMove(count: number, successRatePercent: number) {
		if (count <= minimumAttempts) {
			return true;
		}

		// After the guaranteed dodges, higher success rate means easier catches.
		return Math.random() * 100 >= successRatePercent;
	}

	function normalizeSuccessRate(rate: number) {
		const percent = rate <= 1 ? rate * 100 : rate;
		return Math.min(100, Math.max(0, percent));
	}

	function stopRunaway() {
		if (isStopped) {
			return;
		}

		isStopped = true;
		runawayElement.getAnimations().forEach((animation) => {
			animation.cancel();
		});
		runawayElement.removeEventListener("mouseover", onMouseOver);
		runawayElement.removeEventListener("click", onClick);
		runawayElement.remove();

		element.style.opacity = originalStyles.opacity;
		element.style.pointerEvents = originalStyles.pointerEvents;
		element.style.zIndex = originalStyles.zIndex;

		if (hadInert) {
			element.setAttribute("inert", "");
		} else {
			element.removeAttribute("inert");
		}

		if (originalAriaHidden === null) {
			element.removeAttribute("aria-hidden");
		} else {
			element.setAttribute("aria-hidden", originalAriaHidden);
		}
	}

	return stopRunaway;
}