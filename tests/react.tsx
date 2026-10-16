import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { PageFlip } from "@book-effects/page-flip";
import "@book-effects/page-flip/style.css";

const Fixture = () => {
  const [mounted, setMounted] = useState(true);
  const [width, setWidth] = useState(300);
  const [selected, setSelected] = useState(-1);
  return <>
    <button id="toggle" onClick={() => setMounted(!mounted)}>Mount</button>
    <button id="resize" onClick={() => setWidth(340)}>Resize</button>
    <output id="selected">{selected}</output>
    {mounted && <PageFlip className="first" pageWidth={width} canvasPadding={12}
      pageRatio={0.75} mobileBreakpoint={600} onPageChange={setSelected}
      style={{ width: 380, minHeight: 0, height: 560 }}>
      <section>Cover <strong>nested section</strong></section>
      <article>Inside</article><article>Front</article><article>Back</article>
    </PageFlip>}
    <PageFlip className="second" pageWidth={210} canvasPadding={8} mobileBreakpoint={0}
      initialPage={1} style={{ width: 600, height: 400 }}>
      <div>Other cover</div><div>Other back</div>
    </PageFlip>
  </>;
};
createRoot(document.getElementById("root")!).render(<StrictMode><Fixture /></StrictMode>);
