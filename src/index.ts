/// <reference types="vite/client" />

import { applyBookLayout, fitBookToViewport, BOOK_HEIGHT, BOOK_WIDTH, CANVAS_PADDING, PAGE_HEIGHT, PAGE_WIDTH, PAGE_Y } from "./layout";
import { drawFlip } from "./renderer";

type Flip = {
	element: HTMLElement;
	progress: number;
	target: number;
};

const FPS = 60;
const EASING = 0.2;
const SETTLE_THRESHOLD = 0.003;

function initializeBook(book: HTMLElement, canvas: HTMLCanvasElement, viewport: HTMLElement) {
	const canvasContext = canvas.getContext("2d");
	if (!canvasContext) throw new Error("Canvas 2D is not available.");
	const context = canvasContext;

	applyBookLayout(book);
	const disposeLayout = fitBookToViewport(book, viewport);
	canvas.width = BOOK_WIDTH + CANVAS_PADDING * 2;
	canvas.height = BOOK_HEIGHT + CANVAS_PADDING * 2;

	const pages = Array.from(book.querySelectorAll<HTMLElement>("#pages section"));
	const flips: Flip[] = pages.map((element, index) => {
		element.style.zIndex = String(pages.length - index);
		return { element, progress: 1, target: 1 };
	});

	let currentPage = 0;
	let activeFlip: number | null = null;
	let activePointer: number | null = null;
	let mouseX = 0;

	function getPosition(event: PointerEvent) {
		const bounds = book.getBoundingClientRect();
		const scale = bounds.width / BOOK_WIDTH || 1;
		return {
			x: (event.clientX - bounds.left) / scale - BOOK_WIDTH / 2,
			y: (event.clientY - bounds.top) / scale - PAGE_Y,
		};
	}

	function handlePointerMove(event: PointerEvent) {
		if (event.pointerId !== activePointer) return;
		mouseX = getPosition(event).x;
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0 || activeFlip !== null) return;
		const { x, y } = getPosition(event);
		if (Math.abs(x) >= PAGE_WIDTH || y < 0 || y > PAGE_HEIGHT) return;

		if (x < 0 && currentPage > 0) {
			activeFlip = currentPage - 1;
		} else if (x > 0 && currentPage < flips.length - 1) {
			activeFlip = currentPage;
		}
		if (activeFlip === null) return;
		activePointer = event.pointerId;
		book.setPointerCapture(event.pointerId);
		mouseX = x;
		event.preventDefault();
	}

	function handlePointerUp(event: PointerEvent) {
		if (activeFlip === null || event.pointerId !== activePointer) return;
		mouseX = getPosition(event).x;
		const turned = mouseX < 0;
		flips[activeFlip].target = turned ? -1 : 1;
		currentPage = activeFlip + (turned ? 1 : 0);
		activeFlip = null;
		activePointer = null;
		book.releasePointerCapture(event.pointerId);
	}

	function handlePointerCancel(event: PointerEvent) {
		if (activeFlip === null || event.pointerId !== activePointer) return;
		flips[activeFlip].target = activeFlip < currentPage ? -1 : 1;
		activeFlip = null;
		activePointer = null;
		if (book.hasPointerCapture(event.pointerId)) {
			book.releasePointerCapture(event.pointerId);
		}
	}

	function render() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		flips.forEach((flip, index) => {
			const dragging = activeFlip === index;
			if (dragging) {
				flip.target = Math.max(-1, Math.min(mouseX / PAGE_WIDTH, 1));
			}

			flip.progress += (flip.target - flip.progress) * EASING;
			if (!dragging && Math.abs(flip.target - flip.progress) < SETTLE_THRESHOLD) {
				flip.progress = flip.target;
			}
			const visibleWidth = PAGE_WIDTH * (1 + flip.progress) / 2;
			flip.element.style.width = `${visibleWidth}px`;
			if (dragging || Math.abs(flip.progress) < 1) {
				drawFlip(context, flip.progress);
			}
		});
	}

	const timer = window.setInterval(render, 1000 / FPS);
	book.addEventListener("pointermove", handlePointerMove);
	book.addEventListener("pointerdown", handlePointerDown);
	book.addEventListener("pointerup", handlePointerUp);
	book.addEventListener("pointercancel", handlePointerCancel);
	book.addEventListener("lostpointercapture", handlePointerCancel);

	return () => {
		window.clearInterval(timer);
		disposeLayout();
		book.removeEventListener("pointermove", handlePointerMove);
		book.removeEventListener("pointerdown", handlePointerDown);
		book.removeEventListener("pointerup", handlePointerUp);
		book.removeEventListener("pointercancel", handlePointerCancel);
		book.removeEventListener("lostpointercapture", handlePointerCancel);
	};
}

const book = document.getElementById("book");
const canvas = document.getElementById("pageflip-canvas");
const viewport = document.getElementById("book-viewport");
if (!(book instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement) || !(viewport instanceof HTMLElement)) {
	throw new Error("Book or page flip canvas is missing.");
}
const dispose = initializeBook(book, canvas, viewport);
if (import.meta.hot) import.meta.hot.dispose(dispose);
