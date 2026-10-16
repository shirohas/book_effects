# React PageFlip

`packages/page-flip`にReact / TypeScriptコンポーネント、`src`に利用例を配置しています。

```sh
bun install
bun run start
bun run build
```

[Propsと利用方法](packages/page-flip/README.md) / [サンプル](src/App.tsx)

[図解付き実装ドキュメント（Vivliostyle）](docs/README.md)も用意しています。`bun run docs:build`でPDF、`bun run docs:preview`でプレビューを生成できます。

`bun run build`はTypeScriptの型チェックとデモのビルドを実行します。パッケージはワークスペース内のソース参照用で、npm公開用ビルドはまだ含みません。

ブラウザ回帰テストはChromeのCDPとNode.jsのWebSocketを利用します。別々のターミナルで以下を起動してください。

```sh
google-chrome --headless --remote-debugging-port=9229 --user-data-dir=/tmp/pageflip-test about:blank
bun run start --port 5174 --strictPort
node tests/browser.mjs
```

`CDP_URL`（既定`http://127.0.0.1:9229`）と`TEST_URL`（既定`http://127.0.0.1:5174`）で接続先を変更できます。
モバイルの実タッチイベント、デスクトップのドラッグ、複数配置、props変更、StrictModeでの再マウントを確認します。

元のページめくり表現の参考: https://web.dev/case-studies/20things-pageflip?hl=ja

