import { BOOK_WIDTH, CANVAS_PADDING, PAGE_HEIGHT, PAGE_WIDTH, PAGE_Y } from "./layout";

export function drawFlip(context: CanvasRenderingContext2D, progress: number, texture?: HTMLImageElement) {
	const strength = 1 - Math.abs(progress);
	const foldWidth = PAGE_WIDTH * 0.5 * (1 - progress);

	const foldX = PAGE_WIDTH * progress + foldWidth;
	const verticalOutdent = 20 * strength;

	const paperShadowWidth =
		PAGE_WIDTH * 0.5 * Math.max(Math.min(1 - progress, 0.5), 0);
	const rightShadowWidth =
		PAGE_WIDTH * 0.5 * Math.max(Math.min(strength, 0.5), 0);
	const leftShadowWidth = rightShadowWidth;

	context.save();
	// translateでページめくりを描画
	context.translate(CANVAS_PADDING + BOOK_WIDTH / 2, PAGE_Y + CANVAS_PADDING);

	// Draw a sharp shadow on the left side of the page
	context.strokeStyle = `rgba(0, 0, 0, ${0.05 * strength})`;
	context.lineWidth = 30 * strength;
	context.beginPath();
	context.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
	context.lineTo(foldX - foldWidth, PAGE_HEIGHT + verticalOutdent * 0.5);
	context.stroke();

	// Right side drop shadow
	const rightShadowGradient = context.createLinearGradient(
		foldX,
		0,
		foldX + rightShadowWidth,
		0,
	);
	rightShadowGradient.addColorStop(0, `rgba(0, 0, 0, ${strength * 0.2})`);
	rightShadowGradient.addColorStop(0.8, "rgba(0,0,0,0.0)");

	context.fillStyle = rightShadowGradient;
	context.beginPath();
	context.moveTo(foldX, 0);
	context.lineTo(foldX + rightShadowWidth, 0);
	context.lineTo(foldX + rightShadowWidth, PAGE_HEIGHT);
	context.lineTo(foldX, PAGE_HEIGHT);
	context.fill();

	// Left side drop shadow
	const leftShadowGradient = context.createLinearGradient(
		foldX - foldWidth - leftShadowWidth,
		0,
		foldX - foldWidth,
		0,
	);
	leftShadowGradient.addColorStop(0, "rgba(0,0,0,0.0)");
	leftShadowGradient.addColorStop(1, `rgba(0, 0, 0, ${strength * 0.15})`);

	context.fillStyle = leftShadowGradient;
	context.beginPath();
	context.moveTo(foldX - foldWidth - leftShadowWidth, 0);
	context.lineTo(foldX - foldWidth, 0);
	context.lineTo(foldX - foldWidth, PAGE_HEIGHT);
	context.lineTo(foldX - foldWidth - leftShadowWidth, PAGE_HEIGHT);
	context.fill();

	// Gradient applied to the folded paper (highlights & shadows)
	const foldGradient = context.createLinearGradient(
		foldX - paperShadowWidth,
		0,
		foldX,
		0,
	);
	foldGradient.addColorStop(0.35, "#fafafa");
	foldGradient.addColorStop(0.73, "#eeeeee");
	foldGradient.addColorStop(0.9, "#fafafa");
	foldGradient.addColorStop(1.0, "#e2e2e2");

	context.fillStyle = foldGradient;
	context.strokeStyle = "rgba(0,0,0,0.06)";
	context.lineWidth = 0.5;

	// Draw the folded piece of paper
	context.beginPath();
	context.moveTo(foldX, 0);
	context.lineTo(foldX, PAGE_HEIGHT);
	context.quadraticCurveTo(
		foldX,
		PAGE_HEIGHT + verticalOutdent * 2,
		foldX - foldWidth,
		PAGE_HEIGHT + verticalOutdent,
	);
	context.lineTo(foldX - foldWidth, -verticalOutdent);
	context.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);

	context.fill();
	if (texture && foldWidth > 0) {
		context.save();
		context.clip();
		// The readable reverse face follows the curved top and bottom edges.
		for (let x = 0; x < foldWidth; x += 1) {
			const width = Math.min(1, foldWidth - x);
			const t = 1 - Math.sqrt(Math.max(0, 1 - x / foldWidth));
			const outdent = verticalOutdent * (1 + 2 * t - 3 * t * t);
			context.drawImage(texture, x * texture.naturalWidth / foldWidth, 0,
				width * texture.naturalWidth / foldWidth, texture.naturalHeight,
				foldX - foldWidth + x, -outdent, width, PAGE_HEIGHT + outdent * 2);
		}
		context.globalAlpha = 0.16 * strength;
		context.fillStyle = foldGradient;
		context.fill();
		context.restore();
	}
	context.stroke();

	context.restore();
}
