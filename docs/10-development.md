# 10　変更・検証・ドキュメント更新

<p class="source">読むファイル：package.json、tests/browser.mjs、tests/react.tsx、docs/vivliostyle.config.js</p>

コードを変更したときは、型と整形の検査だけでなく、DOMとCanvasが切り替わる境目を確認します。静止した画面が正しくても、指を離す直前、画像読込中、モード変更中だけ不具合が起きることがあります。

## 基本コマンド

```sh
bun install
bun run start
bun run lint
bun run format
bun run build
```

lintとformatは`src`と`packages`を対象にします。`build`はTypeScriptの型チェック後にViteでデモをビルドします。formatで差分が出た場合は`bun run format:fix`で整形します。公開propsはlowerCamelCase、関数はアロー関数という現在の記述方針を維持します。

## ブラウザ回帰テスト

`tests/browser.mjs`はChrome DevTools ProtocolへWebSocketで接続し、タッチとマウスのイベントを送ります。単にハンドラーを呼ぶテストではなく、ブラウザのPointer変換を通して検証する点が特徴です。

```sh
# 別ターミナルでそれぞれ起動
google-chrome --headless --remote-debugging-port=9229 \
  --user-data-dir=/tmp/pageflip-test about:blank
bun run start --port 5174 --strictPort
node tests/browser.mjs
```

| 検査 | 確認すること |
| --- | --- |
| 12面のスワイプ | 表裏が抜けずに順番に表示される |
| 短いドラッグ | 未確定なら元の面へ戻る |
| 先頭・末尾 | 有効範囲を超えない |
| 複数配置 | サイズ・モード・状態が混ざらない |
| props変更 | 寸法反映と確定位置の引き継ぎ |
| StrictMode | Canvasや購読が重複しない |
| 再マウント | cleanup後も新しく操作できる |
| レスポンシブ | 比率と外側スクロールの有無 |
| デスクトップ | 表紙の開閉がドラッグで動作する |

CDP_URLとTEST_URLで接続先を変更できます。テストの成功は実機Safariや全入力デバイスへの保証ではありません。現在のテストは主に位置と状態を検査し、画像の文字欠け、陰影の品質、スクロール転写の見た目までは自動で比較しません。最新の余白やデモ内容を変えた場合も、画面高と内部スクロールを目視します。

## コードを読む順序と変更先

| 変更したいもの | 主な変更先 | 関連する確認 |
| --- | --- | --- |
| ページの大きさ・比率 | `PageFlip.tsx` / `layout.ts` / CSS | 両モード、Canvas実寸 |
| 見開きの曲がり方 | `renderer.ts` | 端点と中央、裏面画像の帯 |
| スワイプのしきい値 | `single-page-turn.ts` | 縦スクロール、短い操作 |
| ページ内容 | 利用側children / CSS | 表面DOMと裏面Image |
| 現在ページのAPI | `PageFlip.tsx` / `engine.ts` | 通知タイミング、再初期化 |
| 画像の転写 | `page-texture.ts` | フォント、スクロール、画像 |

## このドキュメントの編集と組版

原稿は`docs/01-overview.md`から`10-development.md`、表紙は`00-cover.html`です。`vivliostyle.config.js`に掲載順、目次、CSS、出力PDFを指定しています。印刷用の余白、見出し、コード、図の改ページは`docs/styles/book.css`で調整します。

図はすべて`docs/assets`のSVGです。元になる描画コードは`docs/scripts/generate-assets.mjs`にあり、外部の画像生成サービスを使わずに再生成できます。図の文言を変更したら原稿の説明とキャプションも合わせて確認します。

```sh
bun run docs:assets
bun run docs:preview
bun run docs:build
```

PDFは`docs/output/page-flip-implementation.pdf`へ出力します。中間HTMLは`docs/.vivliostyle`に生成されます。これらは再生成可能な成果物としてGitから除外します。

## 参照資料

- [React：useEffect](https://react.dev/reference/react/useEffect) — 外部処理との同期とcleanup。
- [React：Children](https://react.dev/reference/react/Children) — childrenの列挙とkeyの扱い。
- [Vivliostyle：PDFを作る](https://vivliostyle.org/tutorials/create-publications/) — 原稿からPDFを組版する基本手順。
- [Vivliostyle CLI：設定リファレンス](https://github.com/vivliostyle/vivliostyle-cli/blob/main/docs/config.md) — entry、theme、outputなどの設定。

これらはAPIや組版方法の参考資料です。本書に記載した数式、閾値、既知の制約の根拠は、このリポジトリ内の実装コードです。
