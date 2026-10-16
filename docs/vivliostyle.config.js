const path = require("node:path");

module.exports = {
	title: "PageFlip 実装解説 — React・Canvasでつくるページめくり",
	author: "book_effects project",
	language: "ja",
	size: "A4",
	entryContext: __dirname,
	workspaceDir: path.join(__dirname, ".vivliostyle"),
	theme: path.join(__dirname, "styles/book.css"),
	entry: [
		"00-cover.html",
		{ rel: "contents", title: "目次" },
		"01-overview.md",
		"02-api.md",
		"03-react.md",
		"04-layout.md",
		"05-desktop.md",
		"06-mobile.md",
		"07-texture.md",
		"08-styles.md",
		"09-limits.md",
		"10-development.md",
	],
	toc: { title: "目次", sectionDepth: 1 },
	output: path.join(__dirname, "output/page-flip-implementation.pdf"),
	copyAsset: { includes: ["assets/**", "styles/**"] },
	viteConfigFile: false,
};
