import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

import "@book-effects/page-flip/style.css";
import "./style.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element is missing.");
createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
