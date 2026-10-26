
// @ts-nocheck
import './blackhole.css';

let blackholeState = null;

export function blackholeGame(resetDuration: number = 5000) {
	createBlackhole(resetDuration);
}

function createBlackhole(resetDuration: number = 5000) {
	resetBlackhole();

	const originalOverflowX = document.body.style['overflow-x'] || '';
	const originalBodyOverflow = document.body.style.overflow || '';
	const originalHtmlOverflow = document.documentElement.style.overflow || '';
	const originalBodyPosition = document.body.style.position || '';
	const originalBodyTop = document.body.style.top || '';
	const originalBodyTouchAction = document.body.style.touchAction || '';
	const originalHtmlTouchAction = document.documentElement.style.touchAction || '';
	const scrollY = window.scrollY;
	const timers = [];
	const clones = [];
	const affectedElements = [];
	const viewportContainer = document.createElement('div');
	const portal = document.createElement('div');

	viewportContainer.className = 'blackhole-viewport';
	viewportContainer.setAttribute('aria-hidden', 'true');
	portal.className = 'blackhole-portal';
	portal.setAttribute('aria-hidden', 'true');

	blackholeState = {
		originalOverflowX,
		originalBodyOverflow,
		originalHtmlOverflow,
		originalBodyPosition,
		originalBodyTop,
		originalBodyTouchAction,
		originalHtmlTouchAction,
		scrollY,
		timers,
		clones,
		affectedElements,
		portal,
		viewportContainer,
	};

	document.documentElement.style.overflow = 'hidden';
	document.body.style.overflow = 'hidden';
	document.body.style.position = 'fixed';
	document.body.style.top = `${-scrollY}px`;
	document.body.style.left = '0';
	document.body.style.minWidth = `${window.innerWidth}px`;
	document.body.style.width = `${window.innerWidth}px`;
	document.body.style.touchAction = 'none';
	document.documentElement.style.touchAction = 'none';
	document.body.style.overscrollBehavior = 'none';
	document.documentElement.style.overscrollBehavior = 'none';
	viewportContainer.appendChild(portal);
	document.body.appendChild(viewportContainer);
	document.body.style['overflow-x'] = 'hidden';

	//Get all the elements of the page
	const elements = document.querySelectorAll('*:not(html, head, title, link, meta, script, style, noscript, body, li, p, span, .blackhole-viewport, .blackhole-portal)');
	let all_elements = Array.from(elements);

	// Duration is a minimum; if the page has a lot of elements, keep the effect alive until
	// the absorption cycle has had enough time to process and clear every clone.
	const estimatedAbsorptionTime = Math.max(3000, all_elements.length * 220 + 2500);
	const endTimer = setTimeout(() => {
		resetBlackhole();
	}, Math.max(resetDuration, estimatedAbsorptionTime));
	timers.push(endTimer);

	//Get the viewport center for the black hole target
	const viewportCenterX = window.innerWidth / 2;
	const viewportCenterY = window.innerHeight / 2;
	const absorptionDelay = 250;

	//Start the loop
	var recursion = 0;
	absorbElement();

	function absorbElement() {
		if (!blackholeState) return;
		if (all_elements.length === 0) {
			const finishTimer = setTimeout(() => {
				resetBlackhole();
			}, 450);
			timers.push(finishTimer);
			return;
		}
		if (recursion > 20) {
			resetBlackhole();
			return;
		}

		//Select a random element
		var random = Math.floor(Math.random() * all_elements.length);
		var el = all_elements[random];

		var childs = el.querySelectorAll('*:not(.vortex-flagged)');

		//If the element is invalid or if it has too many childs retry
		if (typeof el == 'undefined' || childs.length > 100) {
			recursion++;
			const retryTimer = setTimeout(absorbElement, absorptionDelay);
			timers.push(retryTimer);
			return;
		} else {
			recursion = 0;
		}

		//Flag all the child so they can't be selected on the next iterations
		childs.forEach(function (node) {
			node.classList.add('vortex-flagged');
		});

		//Clone the element and hide the original
		var el_width = el.offsetWidth;
		var el_height = el.offsetHeight;
		var rect = el.getBoundingClientRect();
		var el_offset_x = rect.left;
		var el_offset_y = rect.top;

		var el_clone = el.cloneNode(true);
		el_clone.classList.add('vortex-attracted');
		el.classList.add('vortex-removed');
		el.classList.add('vortex-flagged');
		affectedElements.push(el);
		clones.push(el_clone);

		document.body.appendChild(el_clone);

		//Style the cloned element
		el_clone.style["position"] = "fixed";
		el_clone.style["width"] = el_width + 'px';
		el_clone.style["height"] = el_height + 'px';
		el_clone.style["top"] = el_offset_y + 'px';
		el_clone.style["left"] = el_offset_x + 'px';
		el_clone.style["transition"] = 'all 2s ease-out';
		el_clone.style["transform-origin"] = 'center';
		el_clone.style["z-index"] = 999999;

		//Start the animation
		const moveTimer = setTimeout(function () {
			el_clone.style['top'] = (viewportCenterY - (el_height / 2)) + 'px';
			el_clone.style['left'] = (viewportCenterX - (el_width / 2)) + 'px';
		}, 1);
		timers.push(moveTimer);

		//Remove the clone after it has been absorbed
		const removeTimer = setTimeout(function () {
			if (el_clone.parentNode) {
				el_clone.parentNode.removeChild(el_clone);
			}
			const cloneIndex = clones.indexOf(el_clone);
			if (cloneIndex >= 0) clones.splice(cloneIndex, 1);
		}.bind(null, el_clone), 2000);
		timers.push(removeTimer);

		//Reduce the set of available elements
		all_elements = all_elements.filter(function (node) {
			return !node.classList.contains('vortex-flagged');
		});

		const nextTimer = setTimeout(absorbElement, absorptionDelay);
		timers.push(nextTimer);
	}
}

function resetBlackhole() {
	if (!blackholeState) return;

	const currentState = blackholeState;
	blackholeState = null;

	currentState.timers.forEach(function (timer) {
		clearTimeout(timer);
	});

	currentState.clones.forEach(function (clone) {
		if (clone && clone.parentNode) {
			clone.parentNode.removeChild(clone);
		}
	});

	document.querySelectorAll('.vortex-flagged, .vortex-removed, .vortex-attracted').forEach(function (node) {
		node.classList.remove('vortex-flagged', 'vortex-removed', 'vortex-attracted');
	});

	if (currentState.portal && currentState.portal.parentNode) {
		currentState.portal.parentNode.removeChild(currentState.portal);
	}

	if (currentState.viewportContainer && currentState.viewportContainer.parentNode) {
		currentState.viewportContainer.parentNode.removeChild(currentState.viewportContainer);
	}

	document.documentElement.style.overflow = currentState.originalHtmlOverflow || '';
	document.body.style.overflow = currentState.originalBodyOverflow || '';
	document.body.style.position = currentState.originalBodyPosition || '';
	document.body.style.top = currentState.originalBodyTop || '';
	document.body.style.left = '';
	document.body.style.minWidth = '';
	document.body.style.width = '';
	document.body.style.touchAction = currentState.originalBodyTouchAction || '';
	document.documentElement.style.touchAction = currentState.originalHtmlTouchAction || '';
	document.body.style.overscrollBehavior = '';
	document.documentElement.style.overscrollBehavior = '';
	window.scrollTo(0, currentState.scrollY);
	document.body.style['overflow-x'] = currentState.originalOverflowX || '';
}
