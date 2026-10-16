// Capture the existing markup with its computed styles, including text wrapping.
export const createPageTexture = (
	source: HTMLElement,
	width: number,
	height: number,
): Promise<HTMLImageElement> => {
	const clone = source.cloneNode(true) as HTMLElement;
	const originals = [source, ...source.querySelectorAll<HTMLElement>("*")];
	const copies = [clone, ...clone.querySelectorAll<HTMLElement>("*")];

	originals.forEach((original, index) => {
		const style = getComputedStyle(original);
		for (const property of Array.from(style)) {
			copies[index].style.setProperty(
				property,
				style.getPropertyValue(property),
			);
		}
	});

	// Reverse faces are hidden in the DOM and only shown by the canvas renderer.
	clone.style.display = "block";
	clone.style.width = `${width}px`;
	clone.style.height = `${height}px`;
	clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

	const markup = new XMLSerializer().serializeToString(clone);
	const ratio = Math.min(window.devicePixelRatio || 1, 3);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * ratio}" height="${height * ratio}" viewBox="0 0 ${width} ${height}"><foreignObject width="100%" height="100%">${markup}</foreignObject></svg>`;
	const image = new Image();

	return new Promise((resolve, reject) => {
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error("Could not capture page content."));
		image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	});
};
