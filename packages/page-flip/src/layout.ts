export const createLayout = (
	pageWidth: number,
	canvasPadding: number,
	pageRatio: number,
) => {
	const PAGE_WIDTH = pageWidth;
	const PAGE_HEIGHT = pageWidth / pageRatio;
	const BOOK_WIDTH = PAGE_WIDTH * 2 + 30;
	const BOOK_HEIGHT = PAGE_HEIGHT + 10;
	return {
		PAGE_WIDTH,
		PAGE_HEIGHT,
		BOOK_WIDTH,
		BOOK_HEIGHT,
		PAGE_Y: 5,
		CANVAS_PADDING: canvasPadding,
	};
};
export type BookLayout = ReturnType<typeof createLayout>;
const VIEWPORT_GAP = 16;

export const fitBookToViewport = (
	book: HTMLElement,
	viewport: HTMLElement,
	layout: BookLayout,
) => {
	const { BOOK_WIDTH, BOOK_HEIGHT, CANVAS_PADDING } = layout;
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
};

export const applyBookLayout = (book: HTMLElement, layout: BookLayout) => {
	const {
		PAGE_WIDTH,
		PAGE_HEIGHT,
		BOOK_WIDTH,
		BOOK_HEIGHT,
		PAGE_Y,
		CANVAS_PADDING,
	} = layout;
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
};
