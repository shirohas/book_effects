# PageFlip 実装ドキュメント

React / TypeScript / Canvasの実装を、図とコードの対応から読む日本語ドキュメントです。Vivliostyle CLIでPDFに組版します。

## 生成と閲覧

リポジトリのルートから実行します。

```sh
bun install
bun run docs:assets    # SVG図版の再生成（通常は不要）
bun run docs:preview   # ブラウザで原稿をプレビュー
bun run docs:build     # PDF生成
```

- PDF：`docs/output/page-flip-implementation.pdf`
- 図版：`docs/assets/*.svg`
- 中間ファイル：`docs/.vivliostyle/`

システムのChromeを使う場合は、次のようにパスを指定できます。

```sh
bun run docs:build --executable-browser /usr/bin/google-chrome
```

Vivliostyle CLI 11.3.3を開発依存に追加しています。PDFの日本語表示にはNoto Sans CJK JPなどの日本語フォントを利用します。フォントやブラウザの違いにより改ページが多少変わる場合があります。

## 章構成

| 原稿 | 内容 | 主な図 |
| --- | --- | --- |
| [01-overview.md](01-overview.md) | 構成・責務・読む順序 | architecture.svg |
| [02-api.md](02-api.md) | props・children・表裏の組み合わせ | faces.svg |
| [03-react.md](03-react.md) | ref・Effect・再初期化・cleanup | lifecycle.svg |
| [04-layout.md](04-layout.md) | 寸法・拡大率・座標変換 | coordinates.svg |
| [05-desktop.md](05-desktop.md) | 見開きの状態・補間・ベジェ曲線・裏面描画 | fold.svg |
| [06-mobile.md](06-mobile.md) | タッチ判定・非同期転写・確定と中断 | mobile-state.svg |
| [07-texture.md](07-texture.md) | DOM→SVG→Image・DPR | texture.svg |
| [08-styles.md](08-styles.md) | モード判定・5:7・92%幅・CSSの責務 | responsive.svg / layers.svg |
| [09-limits.md](09-limits.md) | スクロール転写・更新・性能の制約 | scroll.svg |
| [10-development.md](10-development.md) | 検証・改修先・資料の更新方法 | — |

## 編集方針

- 図は全て`assets`以下に置きます。`scripts/generate-assets.mjs`がSVGの生成元です。
- 図は説明用に簡略化し、本文の式・定数・ファイル名を実装と対応させています。
- 実装していない機能を実装済みとして説明しません。既知の制約と今後の案は明示します。
- 記述基準は2026年10月16日に確認したワークスペースです。寸法・props・閾値・CSSを変更した場合は該当章と図も更新してください。
- `output`と`.vivliostyle`は生成物としてGitから除外しています。共有時はPDFを別途添付してください。

設定方法の根拠：[Vivliostyle公式設定リファレンス](https://github.com/vivliostyle/vivliostyle-cli/blob/main/docs/config.md)。
