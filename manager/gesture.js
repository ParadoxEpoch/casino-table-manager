import { map, zip, fromEvent, pipe, withLatestFrom } from "./Observable.js";

function offsetEl(el) {
	var rect = el.getBoundingClientRect(),
		scrollLeft = window.scrollX || document.documentElement.scrollLeft,
		scrollTop = window.scrollY || document.documentElement.scrollTop;
	return {
		top: rect.top + scrollTop,
		left: rect.left + scrollLeft,
		width: rect.width,
		height: rect.height,
	};
}

function isInRadiusEl(el, x, y) {
	const o = offsetEl(el);
	const cx = o.left + o.width / 2;
	const cy = o.top + o.height / 2;
	const dx = x - cx;
	const dy = y - cy;
	const r = o.width / 2;
	return Math.pow(dx, 2) + Math.pow(dy, 2) <= Math.pow(r, 2);
}

const documentEvent = (eventName) =>
	pipe(
		fromEvent(document, eventName),
		map((e) =>
			e.type == "touchstart" || e.type == "touchmove"
				? { x: e.touches[0].clientX, y: e.touches[0].clientY }
				: { x: e.clientX, y: e.clientY }
		)
	);

export function onWheelSpinGesture(callback) {

	if (typeof callback !== "function") {
		console.error("Callback must be a function");
		return;
	}

	const tryRotate = ([p0, p1]) => {
		const w = document.querySelector(".layer-2.wheel");
		if (isInRadiusEl(w, p0.x, p0.y)) {
			const d = Math.round(Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2)) / 4);
	
			if (Math.abs(d) > 3) {
				callback(d);
			}
		}
	};
	
	zip(documentEvent("mousedown"))(documentEvent("mouseup")).subscribe({
		next: tryRotate,
	});
	
	zip(documentEvent("touchstart"))(
	  pipe(
		withLatestFrom(documentEvent("touchmove"))(fromEvent(document, "touchend")),
		map(([_, r]) => r)
	  )
	).subscribe({
	  next: tryRotate,
	});
	
	pipe(
	  withLatestFrom(documentEvent("touchmove"))(fromEvent(document, "touchend")),
	  map(([_, r]) => r)
	).subscribe({
	  next: (e) => console.log(e),
	});
	
	document.querySelector(".roulette-wheel").addEventListener(
	  "touchmove",
	  (e) => {
		e.preventDefault();
	  },
	  { passive: false }
	);
}