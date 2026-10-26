
let onMouseMove: ((e: MouseEvent) => void) | null = null;
let onTouchMove: ((e: TouchEvent) => void) | null = null;
let onPointerMove: ((e: PointerEvent) => void) | null = null;
let onScroll: ((e: Event) => void) | null = null;

export function createFlashlight() {
	const buttonRect = document.querySelector('.trick')?.getBoundingClientRect();
	let xPosition = buttonRect?.x ?? 250;
	let yPosition = buttonRect?.y ?? 900;

	const flashlight = document.querySelector('.flashlight') as HTMLElement | null;
	if (!flashlight) {
		return;
	}

	flashlight.style.setProperty('--cursor-x', `${xPosition}px`);
	flashlight.style.setProperty('--cursor-y', `${yPosition}px`);

	onMouseMove = (e: MouseEvent) => {
		const xPos = e.clientX;
		const yPos = e.clientY;
		flashlight.style.setProperty('--cursor-x', `${xPos}px`);
		flashlight.style.setProperty('--cursor-y', `${yPos}px`);
		xPosition = xPos;
		yPosition = yPos;
	};

	onTouchMove = (e: TouchEvent) => {
		if (!e.touches.length) {
			return;
		}
		const xPos = e.touches[0].clientX;
		const yPos = e.touches[0].clientY;
		flashlight.style.setProperty('--cursor-x', `${xPos}px`);
		flashlight.style.setProperty('--cursor-y', `${yPos}px`);
		xPosition = xPos;
		yPosition = yPos;
	};

	onPointerMove = (e: PointerEvent) => {
		const xPos = e.clientX;
		const yPos = e.clientY;
		flashlight.style.setProperty('--cursor-x', `${xPos}px`);
		flashlight.style.setProperty('--cursor-y', `${yPos}px`);
		xPosition = xPos;
		yPosition = yPos;
	};

	onScroll = (e: Event) => {
		e.preventDefault();
		flashlight.style.setProperty('--cursor-x', `${xPosition}px`);
		flashlight.style.setProperty('--cursor-y', `${yPosition}px`);
	};

	window.addEventListener('mousemove', onMouseMove);
	window.addEventListener('touchmove', onTouchMove, { passive: true });
	window.addEventListener('pointermove', onPointerMove);
	window.addEventListener('scroll', onScroll, { passive: false });
}



export function destroyFlashlight() {
	if (onMouseMove) {
		window.removeEventListener('mousemove', onMouseMove);
		onMouseMove = null;
	}
	if (onTouchMove) {
		window.removeEventListener('touchmove', onTouchMove);
		onTouchMove = null;
	}
	if (onPointerMove) {
		window.removeEventListener('pointermove', onPointerMove);
		onPointerMove = null;
	}
	if (onScroll) {
		window.removeEventListener('scroll', onScroll);
		onScroll = null;
	}
}
