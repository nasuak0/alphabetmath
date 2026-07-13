/* Zmath entry point — shared by BOTH readers:
   • portable: loaded by the in-browser import-graph loader in index.html
   • Vite app: imported by zmath-app/src/main.jsx
   Keep this thin; all logic lives in app.jsx and its imports. */
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.jsx";

// The brain owns shell chrome: title is set here so neither index.html needs it.
document.title = "AlphabetMath — Home Menu";

// Graceful render boundary — shows the real error instead of a blank screen.
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      return React.createElement("pre",
        { style: { padding: "24px", color: "#bf3535", font: "12px/1.5 ui-monospace,monospace", whiteSpace: "pre-wrap" } },
        "AlphabetMath render error:\n" + (this.state.err.stack || this.state.err.message));
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  React.createElement(ErrorBoundary, null, React.createElement(App))
);
