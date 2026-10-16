# PageFlip

React / TypeScriptのページめくりコンポーネントです。ワークスペース内のソースパッケージとして使います。

```tsx
import { PageFlip } from "@book-effects/page-flip";
import "@book-effects/page-flip/style.css";

<PageFlip
  pageWidth={516}
  canvasPadding={30}
  isSE={true}
  pageRatio={5 / 7}
  mobileBreakpoint={700}
  onPageChange={(page) => console.log(page)}
>
  <div>表紙</div>
  <div>表紙の内側</div>
  <article>本文・表</article>
  <article>本文・裏</article>
  <div>裏表紙の内側</div>
  <div>裏表紙</div>
</PageFlip>
```

## childrenの契約

- 直下の子要素1個が1面です。2面ずつ1枚の紙に組み合わせます。
- 最初が表紙、最後が裏表紙です。2面以上の偶数で渡してください。空白面も明示的に`<div />`で渡します。
- 配列は利用できます。Fragmentの中身やカスタムコンポーネントの出力は分割せず、1面として扱います。
- 内容の余白・文字サイズ・背景色は利用側のCSSで指定します。パッケージはbodyや見出しのスタイルを変更しません。
- `pageWidth`はデスクトップでの基準幅、モバイルでの最大幅です。狭い画面ではコンテナに収めます。
- 先頭・末尾は片面、途中は見開きです。コンテナが`mobileBreakpoint`以下なら全て片面で順に表示します。
- 幅:高さは`pageRatio`（既定5:7）で固定します。ただし画面幅458px以下の片面表示は、`pageWidth`・`pageRatio`の制限を外し、左右12pxの余白を除いた幅と高さ90dvhで表示します。モバイルで長い内容は面の中を縦スクロールできます。

## Props

| Prop | 型 | 既定値 | 用途 |
| --- | --- | --- | --- |
| `pageWidth` | `number` | `516` | 1面の基準幅（px） |
| `canvasPadding` | `number` | `30` | 見開きCanvasの外側余白（px） |
| `children` | `ReactNode` | 必須 | 読む順に並べた面 |
| `pageRatio` | `number` | `5 / 7` | 幅÷高さ |
| `mobileBreakpoint` | `number` | `700` | 片面表示に切り替えるコンテナ幅（px） |
| `isSE` | `boolean` | `false` | ページめくりSEの有効化 |
| `initialPage` | `number` | `0` | 初期表示する面。0始まり、マウント時のみ適用 |
| `onPageChange` | `(page: number) => void` | — | めくり確定後の面番号。見開きは左側の面番号 |
| `className`, `style` | React標準型 | — | 外側コンテナの調整 |
| `aria-label` | `string` | `ページをめくる本` | 本のアクセシブル名 |

同じ画面に複数配置できます。デスクトップのコンテナ高は既定で100dvhです。埋め込み時は`style={{ height: 700 }}`等で指定してください。
現在ページは内部管理します。親の再描画やサイズprops変更では可能な限り位置を維持します。別の本として初期化する場合はReactの`key`を変更してください。

## 描画の制約

めくり中とデスクトップの裏面は、DOMの計算済みスタイルをSVG foreignObject経由でCanvasへ転写します。
HTMLテキストとCSS中心の静的ページ向けです。外部画像・Webフォント・動画・子Canvas・擬似要素の完全な転写は保証しません。
画像を使う場合は埋め込みdata URLなどで実際のブラウザ表示を検証してください。Canvas上の裏面はリンクやフォームとして操作できません。
Reactのchildrenを更新すると描画を再初期化しますが、子コンポーネント内部だけの更新は裏面へ自動同期しません。

ライフサイクルでは[ReactのEffectのクリーンアップ](https://react.dev/reference/react/useEffect)に合わせてイベント・タイマー・Observer・進行中アニメーションを破棄します。

今後必要になった時に追加する候補は、`page`（制御コンポーネント化）、`onError`（画像転写エラー通知）、`animationDuration`（速度）、`direction`（右綴じ／左綴じ）です。

## ページめくりSE

`isSE={true}`で、めくりが確定する指・マウスのリリース時に短い紙の音を鳴らします。Web Audioで合成するため音声ファイルは不要です。短いドラッグやキャンセルでは鳴りません。表示中にfalseにすると再生中の音も停止し、現在のページは保持します。操作時にAudioContextを初期化し、無効化・アンマウント時に解放します。ブラウザ側で音声が許可されない場合もページ操作は継続します。
