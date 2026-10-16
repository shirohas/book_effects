import {
	Children,
	type CSSProperties,
	Fragment,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { initializeBook } from "./engine";
import { createLayout } from "./layout";
import { createPageTurnSound } from "./page-turn-sound";

export interface PageFlipProps {
	children: ReactNode;
	pageWidth?: number;
	canvasPadding?: number;
	/** Width divided by height. Default: 5 / 7. */
	pageRatio?: number;
	/** Container width threshold for single-page mode, in pixels. */
	mobileBreakpoint?: number;
	/** Zero-based face index, read on mount. */
	initialPage?: number;
	/** Enable the page-turn sound. Default: false. */
	isSE?: boolean;
	onPageChange?: (page: number) => void;
	className?: string;
	style?: CSSProperties;
	"aria-label"?: string;
}

export const PageFlip = ({
	children,
	pageWidth = 516,
	canvasPadding = 30,
	pageRatio = 5 / 7,
	mobileBreakpoint = 700,
	initialPage = 0,
	isSE = false,
	onPageChange,
	className,
	style,
	"aria-label": label = "ページをめくる本",
}: PageFlipProps) => {
	const faces = useMemo(
		() =>
			Children.map(Children.toArray(children), (child) => (
				<Fragment>{child}</Fragment>
			)),
		[children],
	);
	if (faces.length < 2 || faces.length % 2 !== 0) {
		throw new Error(
			"PageFlip requires an even number of faces (at least two). Each direct child is one face.",
		);
	}
	for (const [name, value] of Object.entries({ pageWidth, pageRatio })) {
		if (!Number.isFinite(value) || value <= 0)
			throw new Error(`${name} must be a positive finite number.`);
	}
	for (const [name, value] of Object.entries({
		canvasPadding,
		mobileBreakpoint,
	})) {
		if (!Number.isFinite(value) || value < 0)
			throw new Error(`${name} must be a nonnegative finite number.`);
	}
	if (
		!Number.isInteger(initialPage) ||
		initialPage < 0 ||
		initialPage >= faces.length
	) {
		throw new Error("initialPage must be a valid zero-based face index.");
	}
	const viewport = useRef<HTMLElement>(null);
	const book = useRef<HTMLDivElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	const selected = useRef(initialPage);
	const callback = useRef(onPageChange);
	const sound = useRef<ReturnType<typeof createPageTurnSound> | null>(null);
	useEffect(() => {
		if (!isSE) return;
		const instance = createPageTurnSound();
		sound.current = instance;
		return () => {
			sound.current = null;
			instance.dispose();
		};
	}, [isSE]);
	useEffect(() => {
		callback.current = onPageChange;
	}, [onPageChange]);
	const layout = useMemo(
		() => createLayout(pageWidth, canvasPadding, pageRatio),
		[pageWidth, canvasPadding, pageRatio],
	);
	useEffect(() => {
		if (!book.current || !canvas.current || !viewport.current) return;
		selected.current = Math.min(selected.current, faces.length - 1);
		return initializeBook(
			book.current,
			canvas.current,
			viewport.current,
			layout,
			{
				mobileBreakpoint,
				pageRatio,
				initialPage: selected.current,
				prepareSound: () => sound.current?.prepare(),
				playSound: () => sound.current?.play(),
				onPageChange: (page) => {
					selected.current = page;
					callback.current?.(page);
				},
			},
		);
	}, [layout, mobileBreakpoint, pageRatio, faces]);
	const variables = {
		"--page-width": `${layout.PAGE_WIDTH}px`,
		"--page-height": `${layout.PAGE_HEIGHT}px`,
		"--book-width": `${layout.BOOK_WIDTH}px`,
		"--book-height": `${layout.BOOK_HEIGHT}px`,
		"--page-top": `${layout.PAGE_Y}px`,
		"--canvas-padding": `${canvasPadding}px`,
		"--page-ratio": pageRatio,
	} as CSSProperties;
	return (
		<section
			ref={viewport}
			className={["bf-viewport", className].filter(Boolean).join(" ")}
			style={{ ...variables, ...style }}
			aria-label={label}
		>
			<div ref={book} className="bf-book">
				<canvas
					ref={canvas}
					className="bf-canvas"
					aria-hidden="true"
					tabIndex={-1}
				/>
				<div className="bf-pages">
					{Array.from({ length: faces.length / 2 }, (_, index) => ({
						front: faces[index * 2],
						back: faces[index * 2 + 1],
					})).map(({ front, back }) => (
						<section className="bf-sheet" key={front.key}>
							<div className="bf-face bf-front">{front}</div>
							<div className="bf-face bf-back">{back}</div>
						</section>
					))}
				</div>
			</div>
		</section>
	);
};
