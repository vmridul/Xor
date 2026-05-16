import { createRoot } from "react-dom/client";
import { SaveButtonRoot } from "./components/SaveButtonRoot";
import styleText from "../styles/main.css?inline";

const processedTweets = new WeakSet<HTMLElement>();
let globalPortalContainer: HTMLDivElement | null = null;

function getGlobalPortalContainer() {
  if (globalPortalContainer) return globalPortalContainer;

  const host = document.createElement("div");
  host.id = "xor-global-portal-host";
  // Ensure the host doesn't interfere with page layout
  host.style.position = "absolute";
  host.style.top = "0";
  host.style.left = "0";
  host.style.width = "100%";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = styleText;
  shadowRoot.appendChild(style);

  globalPortalContainer = document.createElement("div");
  globalPortalContainer.className = "xor-global-portal-root";
  globalPortalContainer.style.pointerEvents = "auto";
  shadowRoot.appendChild(globalPortalContainer);

  return globalPortalContainer;
}

function inject(article: HTMLElement) {
  if (processedTweets.has(article)) return;
  const actionBar = article.querySelector('[role="group"]');
  if (!actionBar || actionBar.querySelector(".xor-root-container")) return;

  processedTweets.add(article);

  const isDetail =
    window.location.pathname.includes("/status/") &&
    !article.querySelector('time a[href*="/status/"]');

  const container = document.createElement("div");
  container.className = `xor-root-container ${isDetail ? "is-detail" : ""}`;

  // Insert before the last button (usually the Share button)
  const buttons = actionBar.querySelectorAll(":scope > div");
  if (buttons.length > 0) {
    actionBar.insertBefore(container, buttons[buttons.length - 1]);
  } else {
    actionBar.appendChild(container);
  }

  const shadowRoot = container.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = styleText;
  shadowRoot.appendChild(style);

  const rootContainer = document.createElement("div");
  rootContainer.className = "xor-inner-root";
  shadowRoot.appendChild(rootContainer);

  const root = createRoot(rootContainer);
  root.render(
    <SaveButtonRoot
      article={article}
      portalContainer={getGlobalPortalContainer()}
      isDetail={isDetail}
    />,
  );
}
function init() {
  const observer = new MutationObserver(() => {
    document.querySelectorAll("article").forEach((a) => {
      if (a.querySelector('[role="group"]')) inject(a as HTMLElement);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
