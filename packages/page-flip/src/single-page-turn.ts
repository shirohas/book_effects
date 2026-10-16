import { createPageTexture } from "./page-texture";

// Keep readable HTML at rest and render only the moving paper on a sharp canvas.
export const createSinglePageTurn = (
	book: HTMLElement,
	options: {
		getIndex: () => number;
		setIndex: (index: number) => void;
		count: number;
		pageRatio: number;
		onCommit: (index: number) => void;
		isEnabled: () => boolean;
	},
) => {
	const canvas = document.createElement("canvas");
	canvas.className = "bf-single-canvas";
	canvas.hidden = true;
	book.append(canvas);
	const context = canvas.getContext("2d");
	if (!context) {
		canvas.remove();
		throw new Error("Canvas 2D is not available.");
	}
	let generation = 0;
	let frame = 0;
	let busy = false;
	let pointer: { id: number; x: number; y: number; direction: number } | null =
		null;
	let progress = 0;
	let target = 0;
	let released = false;
	let ready = false;
	let destination = 0;
	let width = 0;
	let height = 0;
	let front: HTMLImageElement;
	let next: HTMLImageElement;
	let direction = 1;

	const reset = () => {
		generation++;
		cancelAnimationFrame(frame);
		const pointerId = pointer?.id;
		pointer = null;
		if (pointerId !== undefined && book.hasPointerCapture(pointerId))
			book.releasePointerCapture(pointerId);
		busy = ready = false;
		canvas.hidden = true;
		book.classList.remove("is-turning");
	};

	const snapshot = () => {
		const face = book.querySelector<HTMLElement>(
			" .bf-sheet.is-current > ." +
				(options.getIndex() % 2 ? "bf-back" : "bf-front"),
		);
		if (!face) throw new Error("Current page face is missing.");
		const bounds = face.getBoundingClientRect();
		return {
			image: createPageTexture(face, bounds.width, bounds.height),
			height: bounds.height,
		};
	};

	const paint = () => {
		context.clearRect(0, 0, width, height);
		context.fillStyle = "white";
		context.fillRect(0, 0, width, height);
		context.drawImage(
			next,
			0,
			0,
			width,
			(next.naturalHeight / next.naturalWidth) * width,
		);
		const fold = width * (1 - progress);
		const curl = Math.min(fold, Math.sin(progress * Math.PI) * width * 0.32);
		const edge = direction > 0 ? fold : width - fold;
		context.save();
		context.beginPath();
		context.rect(direction > 0 ? 0 : edge, 0, fold, height);
		context.clip();
		context.fillStyle = "white";
		context.fillRect(0, 0, width, height);
		context.drawImage(
			front,
			0,
			0,
			width,
			(front.naturalHeight / front.naturalWidth) * width,
		);
		context.restore();
		if (curl < 0.1) return;
		context.save();
		if (direction < 0) {
			context.translate(width, 0);
			context.scale(-1, 1);
		}
		const lift = Math.sin(progress * Math.PI) * 24;
		const shadow = context.createLinearGradient(fold, 0, fold + curl * 0.6, 0);
		shadow.addColorStop(0, "rgba(0,0,0,.28)");
		shadow.addColorStop(1, "rgba(0,0,0,0)");
		context.fillStyle = shadow;
		context.fillRect(fold, 0, curl * 0.6, height);
		context.beginPath();
		context.moveTo(fold, 0);
		context.quadraticCurveTo(fold - curl * 0.35, lift, fold - curl, lift * 0.5);
		context.lineTo(fold - curl, height - lift * 0.5);
		context.quadraticCurveTo(fold - curl * 0.35, height - lift, fold, height);
		context.closePath();
		const paper = context.createLinearGradient(fold - curl, 0, fold, 0);
		paper.addColorStop(0, "#d4d0c8");
		paper.addColorStop(0.3, "#fffdf7");
		paper.addColorStop(0.8, "#f0ede5");
		paper.addColorStop(1, "#b9b5ad");
		context.fillStyle = paper;
		context.fill();
		context.restore();
	};

	const tick = () => {
		if (!ready) return;
		progress += (target - progress) * 0.22;
		if (released && Math.abs(progress - target) < 0.003) {
			if (target === 1) {
				options.setIndex(destination);
				options.onCommit(destination);
			}
			reset();
			return;
		}
		paint();
		frame = requestAnimationFrame(tick);
	};

	const start = async (step: number, automatic: boolean) => {
		if (busy || !options.isEnabled()) return;
		const origin = options.getIndex();
		destination = origin + step;
		if (destination < 0 || destination >= options.count) return;
		busy = true;
		direction = step;
		progress = 0;
		target = automatic ? 1 : 0;
		released = automatic;
		const token = ++generation;
		try {
			const current = snapshot();
			options.setIndex(destination);
			const upcoming = snapshot();
			options.setIndex(origin);
			const bounds = book.getBoundingClientRect();
			width = bounds.width;
			height = bounds.height;
			const textures = await Promise.all([current.image, upcoming.image]);
			if (generation !== token) return;
			[front, next] = textures;
			const ratio = Math.min(devicePixelRatio || 1, 3);
			canvas.width = Math.round(width * ratio);
			canvas.height = Math.round(height * ratio);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			context.setTransform(ratio, 0, 0, ratio, 0, 0);
			book.classList.add("is-turning");
			canvas.hidden = false;
			ready = true;
			tick();
		} catch (error) {
			if (generation !== token) return;
			options.setIndex(origin);
			reset();
			console.error("Could not render page turn", error);
		}
	};

	const down = (event: PointerEvent) => {
		if (!options.isEnabled() || busy || !event.isPrimary || event.button !== 0)
			return;
		pointer = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			direction: 0,
		};
		// Capture on the stable book before snapshots temporarily hide either face.
		book.setPointerCapture(event.pointerId);
	};
	const move = (event: PointerEvent) => {
		if (pointer?.id !== event.pointerId) return;
		const dx = event.clientX - pointer.x;
		const dy = event.clientY - pointer.y;
		if (!pointer.direction) {
			if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
				pointer = null;
				return;
			}
			if (Math.abs(dx) < 10) return;
			pointer.direction = dx < 0 ? 1 : -1;
			book.setPointerCapture(event.pointerId);
			void start(pointer.direction, false);
		}
		if (busy)
			target = Math.max(
				0,
				Math.min(1, (-dx * pointer.direction) / (width || book.clientWidth)),
			);
	};
	const up = (event: PointerEvent) => {
		if (pointer?.id !== event.pointerId) return;
		// A fast swipe may end beyond the last pointermove position.
		if (busy) {
			const distance = (pointer.x - event.clientX) * pointer.direction;
			target = distance >= Math.min(60, book.clientWidth * 0.2) ? 1 : 0;
			released = true;
		}
		pointer = null;
		if (book.hasPointerCapture(event.pointerId))
			book.releasePointerCapture(event.pointerId);
	};
	const cancel = (event: PointerEvent) => {
		if (event.type === "lostpointercapture" && event.target !== book) return;
		if (pointer?.id !== event.pointerId) return;
		pointer = null;
		if (busy) {
			target = 0;
			released = true;
		}
	};
	book.addEventListener("pointerdown", down);
	book.addEventListener("pointermove", move);
	book.addEventListener("pointerup", up);
	book.addEventListener("pointercancel", cancel);
	book.addEventListener("lostpointercapture", cancel);
	window.addEventListener("resize", reset);
	return {
		turn: (step: number) => {
			void start(step, true);
		},
		reset,
		dispose: () => {
			reset();
			canvas.remove();
			book.removeEventListener("pointerdown", down);
			book.removeEventListener("pointermove", move);
			book.removeEventListener("pointerup", up);
			book.removeEventListener("pointercancel", cancel);
			book.removeEventListener("lostpointercapture", cancel);
			window.removeEventListener("resize", reset);
		},
	};
};
