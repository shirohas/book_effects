export const PAGE_WIDTH = 400;
export const PAGE_HEIGHT = (PAGE_WIDTH * 7) / 5;
export const BOOK_WIDTH = PAGE_WIDTH * 2 + 30;
export const BOOK_HEIGHT = PAGE_HEIGHT + 10;
export const PAGE_Y = (BOOK_HEIGHT - PAGE_HEIGHT) / 2;
export const CANVAS_PADDING = 60;
const VIEWPORT_GAP = 16;

export function fitBookToViewport(book: HTMLElement, viewport: HTMLElement) {
	const updateScale = () => {
		const width = Math.max(0, viewport.clientWidth - VIEWPORT_GAP * 2);
		const height = Math.max(0, viewport.clientHeight - VIEWPORT_GAP * 2);
		const scale = Math.min(
			1,
			width / (BOOK_WIDTH + CANVAS_PADDING * 2),
			height / (BOOK_HEIGHT + CANVAS_PADDING * 2),
		);
		book.style.setProperty("--book-scale", String(scale));
	};
	const observer = new ResizeObserver(updateScale);
	observer.observe(viewport);
	updateScale();
	return () => observer.disconnect();
}

export function applyBookLayout(book: HTMLElement) {
	const dimensions = {
		"page-width": PAGE_WIDTH,
		"page-height": PAGE_HEIGHT,
		"book-width": BOOK_WIDTH,
		"book-height": BOOK_HEIGHT,
		"page-top": PAGE_Y,
		"canvas-padding": CANVAS_PADDING,
	};

	for (const [name, value] of Object.entries(dimensions)) {
		book.style.setProperty(`--${name}`, `${value}px`);
	}
}
