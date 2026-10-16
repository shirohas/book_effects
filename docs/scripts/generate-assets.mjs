import { mkdir, writeFile } from "node:fs/promises";
const directory = new URL("../assets/", import.meta.url);
await mkdir(directory, { recursive: true });
const escape = (value) =>
	String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
const text = (x, y, value, size = 20, fill = "#193843") =>
	`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}">${escape(value)}</text>`;
const box = (x, y, width, height, title, lines = [], fill = "#eef5f5") =>
	`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" fill="${fill}" stroke="#8ca6ac"/>${text(x + 18, y + 32, title, 22)}${lines.map((line, i) => text(x + 18, y + 64 + i * 26, line, 17)).join("")}`;
const arrow = (x1, y1, x2, y2, label = "") =>
	`<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="#267e87" stroke-width="3" marker-end="url(#arrow)"/>${label ? text((x1 + x2) / 2 + 8, (y1 + y2) / 2 - 12, label, 16) : ""}`;
const save = async (name, title, body, height = 480) => {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${height}" viewBox="0 0 960 ${height}" role="img" aria-labelledby="title"><title id="title">${escape(title)}</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="#267e87"/></marker><linearGradient id="paper"><stop stop-color="#a9bfc1"/><stop offset=".45" stop-color="#fffdf4"/><stop offset="1" stop-color="#d7e1df"/></linearGradient></defs><rect width="960" height="${height}" rx="18" fill="#f8faf9"/><g font-family="Noto Sans CJK JP, sans-serif">${text(28, 40, title, 25)}${body}</g></svg>`;
	await writeFile(new URL(name, directory), svg);
};

await save(
	"architecture.svg",
	"実装を読むための地図",
	[
		box(
			30,
			80,
			260,
			130,
			"PageFlip.tsx",
			["props・children → DOM", "Effect → 初期化 / 破棄"],
			"#e4f2ef",
		),
		box(350, 80, 260, 130, "engine.ts", [
			"見開きの状態管理",
			"Pointer / ResizeObserver",
		]),
		box(670, 80, 260, 130, "layout.ts", ["寸法を算出", "CSS変数と拡大率"]),
		box(30, 290, 260, 130, "single-page-turn.ts", [
			"片面の操作と描画",
			"requestAnimationFrame",
		]),
		box(350, 290, 260, 130, "page-texture.ts", [
			"DOM → SVG → Image",
			"両方式から利用",
		]),
		box(670, 290, 260, 130, "renderer.ts", [
			"見開きの折れ・影",
			"裏面を細い帯で描画",
		]),
		arrow(290, 145, 350, 145),
		arrow(610, 145, 670, 145),
		arrow(390, 210, 230, 290),
		arrow(550, 210, 750, 290),
		arrow(290, 355, 350, 355),
		arrow(480, 210, 480, 290),
	].join(""),
);

await save(
	"faces.svg",
	"1つのchildが1面、2面で1枚の紙",
	[
		...[0, 1, 2, 3, 4, 5].map((n) =>
			box(
				25 + n * 155,
				80,
				140,
				110,
				`面 ${n}`,
				[n === 0 ? "表紙" : n === 5 ? "裏表紙" : `children[${n}]`],
				n % 2 ? "#f8ecdc" : "#e4f2ef",
			),
		),
		...[0, 1, 2].map(
			(n) =>
				`<path d="M${45 + n * 310} 206 V225 H${295 + n * 310} V206" fill="none" stroke="#8ca6ac" stroke-width="2"/>${text(105 + n * 310, 257, `紙 ${n}`, 20)}`,
		),
		box(35, 305, 200, 105, "最初", ["[ 0 ] 表紙のみ"]),
		arrow(240, 355, 300, 355),
		box(310, 305, 330, 105, "途中の見開き", ["[ 1 | 2 ] → [ 3 | 4 ]"]),
		arrow(650, 355, 710, 355),
		box(725, 305, 200, 105, "最後", ["[ 5 ] 裏表紙のみ"]),
	].join(""),
	450,
);

await save(
	"lifecycle.svg",
	"Reactのライフサイクルと描画エンジン",
	[
		box(25, 85, 205, 115, "React render", [
			"childrenを面に整理",
			"refでDOMを取得",
		]),
		box(270, 85, 205, 115, "Effect setup", [
			"initializeBook()",
			"寸法・監視・イベント",
		]),
		box(515, 85, 205, 115, "操作・描画", [
			"DOMの幅 / Canvas",
			"確定後にcallback",
		]),
		box(755, 85, 180, 115, "cleanup", ["timer / rAF停止", "監視と購読を解除"]),
		arrow(230, 140, 270, 140),
		arrow(475, 140, 515, 140),
		arrow(720, 140, 755, 140),
		box(110, 285, 740, 125, "再初期化が起きる条件", [
			"layout・mobileBreakpoint・pageRatio・facesの参照が変化",
			"selected refで面番号を引き継ぎ、新しいDOMから転写し直す",
		]),
		arrow(840, 210, 840, 270),
		arrow(120, 275, 310, 210),
	].join(""),
);

await save(
	"coordinates.svg",
	"見開きの座標：背表紙を x = 0 にする",
	[
		`<rect x="90" y="85" width="780" height="310" rx="10" fill="#e8f0f3" stroke="#96b1ba" stroke-dasharray="8 6"/>`,
		`<rect x="140" y="120" width="680" height="235" fill="#fffdf5" stroke="#687f84"/>`,
		`<path d="M480 105 V375" stroke="#e08048" stroke-width="3"/>`,
		text(180, 200, "左ページ", 24),
		text(595, 200, "右ページ", 24),
		text(170, 255, "−PAGE_WIDTH", 18),
		text(530, 255, "+PAGE_WIDTH", 18),
		text(490, 155, "(0, 0)", 18),
		arrow(480, 295, 770, 295, "x"),
		text(105, 72, "Canvas：周囲にcanvasPaddingを確保", 19),
		text(
			130,
			430,
			"画面座標 → bookの左上を引く → scaleで割る → 背表紙へ原点移動",
			20,
		),
	].join(""),
);

const foldPanel = (x, p, label) => {
	const w = 110,
		h = 154,
		ox = x + 135,
		oy = 150,
		fw = w * 0.5 * (1 - p),
		fx = w * p + fw,
		out = 12 * (1 - Math.abs(p));
	return `<rect x="${x + 5}" y="90" width="280" height="280" rx="12" fill="#edf3f3"/>${text(x + 20, 118, label, 19)}<rect x="${ox}" y="${oy}" width="${w}" height="${h}" fill="#fff" stroke="#cad5d6"/><path d="M${ox} ${oy} V${oy + h}" stroke="#da7840" stroke-width="2"/><rect x="${ox}" y="${oy}" width="${fx}" height="${h}" fill="#d5ebe4"/><path d="M${ox + fx} ${oy} L${ox + fx} ${oy + h} Q${ox + fx} ${oy + h + out * 2} ${ox + fx - fw} ${oy + h + out} L${ox + fx - fw} ${oy - out} Q${ox + fx} ${oy - out * 2} ${ox + fx} ${oy}Z" fill="url(#paper)" stroke="#82989c"/>${text(x + 25, 340, `progress = ${p}`, 18)}`;
};
await save(
	"fold.svg",
	"紙が曲がる形とprogressの関係",
	foldPanel(20, 0.8, "めくり始め") +
		foldPanel(335, 0, "中間：曲がりが最大") +
		foldPanel(650, -1, "左側に着地") +
		text(45, 420, "緑：DOMの表面　白〜灰：Canvasの裏面　橙：背表紙", 21),
	460,
);

await save(
	"mobile-state.svg",
	"片面表示のスワイプを状態で読む",
	[
		box(30, 80, 220, 120, "待機", ["HTMLを表示", "pointerdownで捕捉"]),
		box(370, 80, 220, 120, "方向判定", [
			"横10pxで開始",
			"縦優勢ならスクロール",
		]),
		box(710, 80, 220, 120, "ドラッグ", ["2面を画像化", "targetに指を追従"]),
		box(710, 300, 220, 120, "指を離す", [
			"距離がしきい値以上？",
			"target = 1 / 0",
		]),
		box(370, 300, 220, 120, "確定 / 巻き戻し", [
			"rAFで収束",
			"確定時だけonCommit",
		]),
		box(30, 300, 220, 120, "後始末", ["Canvasを隠す", "HTML表示へ戻す"]),
		arrow(250, 140, 370, 140),
		arrow(590, 140, 710, 140),
		arrow(820, 200, 820, 300),
		arrow(710, 360, 590, 360),
		arrow(370, 360, 250, 360),
		arrow(140, 300, 140, 200),
	].join(""),
);

await save(
	"texture.svg",
	"DOMの見た目をCanvasへ運ぶ",
	[
		box(25, 100, 190, 145, "① DOM複製", ["cloneNode(true)", "子孫も複製"]),
		box(265, 100, 190, 145, "② CSS固定", [
			"getComputedStyle",
			"全プロパティを転写",
		]),
		box(505, 100, 190, 145, "③ SVG化", ["foreignObject", "XMLSerializer"]),
		box(745, 100, 190, 145, "④ Image", ["data URLを読込", "onload後に描画"]),
		arrow(215, 175, 265, 175),
		arrow(455, 175, 505, 175),
		arrow(695, 175, 745, 175),
		box(
			85,
			315,
			790,
			105,
			"注意：DOMの現在状態すべてが画像になるわけではない",
			["scrollTop・動画・子Canvas・擬似要素・外部リソースは別途考慮が必要"],
			"#fbefdf",
		),
	].join(""),
);

await save(
	"responsive.svg",
	"モード判定とページの実寸は別の計算",
	[
		box(30, 85, 270, 130, "外側コンテナの幅", [
			"viewport.clientWidth",
			"mobileBreakpoint = 700",
		]),
		box(380, 85, 540, 130, "700pxより広い → 見開き", [
			"元の寸法を保ったまま全体をscale",
			"幅と高さの両方から収まる倍率を選ぶ",
		]),
		box(380, 285, 540, 140, "700px以下 → 片面", [
			"幅92%・pageWidthの92%・高さ上限を比較",
			"height = width / pageRatio",
			"本文は折り返し直し、必要なら面内スクロール",
		]),
		arrow(300, 135, 380, 135, "広い"),
		arrow(250, 215, 380, 320, "狭い"),
	].join(""),
);

await save(
	"scroll.svg",
	"面内スクロールと転写のずれ（現行の制約）",
	[
		box(35, 85, 380, 300, "ユーザーが見ている面", [], "#e8f3ef"),
		`<rect x="85" y="155" width="270" height="180" fill="white" stroke="#839a9f"/>`,
		text(110, 195, "本文の途中 …", 22),
		text(110, 235, "読み進めた位置", 22),
		text(110, 290, "scrollTop = 88", 20),
		box(545, 85, 380, 300, "転写用に複製した面", [], "#fbefdf"),
		`<rect x="595" y="155" width="270" height="180" fill="white" stroke="#839a9f"/>`,
		text(620, 195, "先頭の見出し", 22),
		text(620, 235, "本文の最初 …", 22),
		text(620, 290, "scrollTop = 0", 20),
		arrow(425, 240, 535, 240, "複製"),
		text(
			40,
			435,
			"めくり始めに内容が跳ぶ。スクロールしていない面では、このずれは起きない。",
			19,
		),
	].join(""),
);

await save(
	"layers.svg",
	"描画の重なりと責務",
	[
		box(
			45,
			90,
			420,
			110,
			"Reactが管理するDOM",
			["bf-viewport / bf-book / bf-pages / 各面"],
			"#e4f2ef",
		),
		box(45, 245, 420, 145, "エンジンが変更する部分", [
			"style.width・CSS変数・data-layout",
			"is-current・is-turning",
			"イベント・タイマー・Observer",
		]),
		box(
			555,
			90,
			350,
			90,
			"上：Canvas",
			["折れた紙、影、左側の裏面"],
			"#fbefdf",
		),
		box(555, 215, 350, 90, "中：DOMの表面", ["幅を狭めて下の面を見せる"]),
		box(555, 340, 350, 90, "下：後続の紙", ["zIndex = 紙の枚数 − index"]),
		arrow(255, 200, 255, 245),
		arrow(730, 340, 730, 305),
		arrow(730, 215, 730, 180),
	].join(""),
);
console.log("Generated 10 SVG diagrams in docs/assets");
