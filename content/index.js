/**
 * XOR — Content Entry Point
 */
(() => {
  const processedTweets = new WeakSet();
  let hoveredTweet = null;

  const ICONS = {
    plus: `<svg viewBox="0 0 24 24"><path d="M19.75 11.25h-6.5V4.75a1.25 1.25 0 0 0-2.5 0v6.5H4.25a1.25 1.25 0 0 0 0 2.5h6.5v6.5a1.25 1.25 0 0 0 2.5 0v-6.5h6.5a1.25 1.25 0 0 0 0-2.5z"/></svg>`,
  };

  async function updateButton(btn, id) {
    const folders = await XOR_STORAGE.getTweetFolders(id);
    btn.classList.toggle("xor-saved", folders.length > 0);
    btn.querySelector(".xor-tooltip").textContent =
      folders.length > 0
        ? `Saved in ${folders.length} folder${folders.length > 1 ? "s" : ""}`
        : "Save tweet";
  }

  function inject(article) {
    if (processedTweets.has(article)) return;
    const actionBar = article.querySelector('[role="group"]');
    if (!actionBar || actionBar.querySelector(".xor-save-btn")) return;

    processedTweets.add(article);
    const btn = document.createElement("button");
    btn.className = "xor-save-btn";

    // Create Icon
    const svgWrapper = document.createElement("div");
    svgWrapper.style.display = "flex";
    svgWrapper.innerHTML = ICONS.plus;
    const svg = svgWrapper.firstChild;
    btn.appendChild(svg);

    const tooltip = document.createElement("span");
    tooltip.className = "xor-tooltip";
    tooltip.textContent = "Save tweet";
    btn.appendChild(tooltip);

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const data = XOR_EXTRACTOR.extract(article);
      if (data)
        XOR_POPOVER.show(btn, data, () => {
          btn.classList.add("xor-animate");
          setTimeout(() => btn.classList.remove("xor-animate"), 400);
          updateButton(btn, data.id);
        });
    };

    const data = XOR_EXTRACTOR.extract(article);
    if (data) updateButton(btn, data.id);

    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "display: inline-flex; align-items: center; align-self: center;";
    wrapper.appendChild(btn);
    actionBar.appendChild(wrapper);
  }

  function init() {
    const theme = () => {
      const bg = getComputedStyle(document.body).backgroundColor;
      const match = bg.match(/\d+/g);
      if (!match) return "dark";
      const lum = 0.299 * match[0] + 0.587 * match[1] + 0.114 * match[2];
      if (lum > 200) return "light";
      if (lum > 40) return "dim";
      return "dark";
    };

    const apply = () =>
      document.documentElement.setAttribute("data-xor-theme", theme());
    apply();

    const observer = new MutationObserver(() => {
      document.querySelectorAll("article").forEach((a) => {
        if (a.querySelector('[role="group"]')) inject(a);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("mouseover", (e) => {
      hoveredTweet = e.target.closest("article");
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "xor_trigger_save" && hoveredTweet) {
        const btn = hoveredTweet.querySelector(".xor-save-btn");
        if (btn) btn.click();
      }
      if (msg.action === "xor_data_changed") {
        document.querySelectorAll(".xor-save-btn").forEach((b) => {
          const art = b.closest("article");
          if (art) {
            const d = XOR_EXTRACTOR.extract(art);
            if (d) updateButton(b, d.id);
          }
        });
      }
    });

    new MutationObserver(apply).observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
