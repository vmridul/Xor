/**
 * XOR — Popover UI Module (Trusted Types Safe)
 */
window.XOR_POPOVER = (() => {
  let currentPopover = null;
  let currentOverlay = null;

  const ICONS = {
    check: `<svg viewBox="0 0 24 24" width="12" height="12"><path d="M9.86 18a1 1 0 0 1-.73-.32l-4.86-5.17a1 1 0 1 1 1.46-1.37l4.12 4.39 8.41-9.2a1 1 0 1 1 1.48 1.34l-9.14 10a1 1 0 0 1-.73.33z" fill="currentColor"/></svg>`,
    close: `✕`,
    plus: `+`,
  };

  async function show(anchorBtn, tweetData, onSave) {
    hide();

    try {
      const folders = await XOR_STORAGE.getFolders();
      const existingFolders = await XOR_STORAGE.getTweetFolders(tweetData.id);
      const existingIds = existingFolders.map((f) => f.id);

      // Create Overlay
      const overlay = document.createElement("div");
      overlay.className = "xor-popover-overlay";
      overlay.onclick = hide;
      document.body.appendChild(overlay);
      currentOverlay = overlay;

      // Create Popover
      const popover = document.createElement("div");
      popover.className = "xor-popover";

      const rect = anchorBtn.getBoundingClientRect();
      let top = rect.bottom + 8;
      let left = rect.left - 120;

      if (left < 16) left = 16;
      if (rect.bottom + 380 > window.innerHeight) {
        top = rect.top - 170;
      }

      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`; // Header
      const header = document.createElement("div");
      header.className = "xor-popover-header";

      const title = document.createElement("h3");
      title.className = "xor-popover-title";
      title.textContent = "Save to folder";

      const closeBtn = document.createElement("button");
      closeBtn.className = "xor-popover-close";
      closeBtn.textContent = ICONS.close;
      closeBtn.onclick = hide;

      header.appendChild(title);
      header.appendChild(closeBtn);
      popover.appendChild(header);

      // List
      const list = document.createElement("div");
      list.className = "xor-popover-list";

      if (folders.length === 0) {
        const empty = document.createElement("div");
        empty.className = "xor-empty-popover";
        empty.textContent = "No folders yet";
        list.appendChild(empty);
      }

      folders
        .sort((a, b) => a.order - b.order)
        .forEach((f) => {
          const isChecked = existingIds.includes(f.id);
          const item = document.createElement("button");
          item.className = "xor-folder-item";
          item.dataset.id = f.id;
          item.dataset.checked = isChecked;

          const icon = document.createElement("span");
          icon.className = "xor-folder-icon";
          icon.textContent = f.icon;

          const dot = document.createElement("span");
          dot.className = "xor-folder-dot";
          dot.style.background = f.color;

          const name = document.createElement("span");
          name.className = "xor-folder-name";
          name.textContent = f.name;

          const check = document.createElement("span");
          check.className =
            "xor-folder-check" + (isChecked ? " xor-checked" : "");
          check.innerHTML = ICONS.check;

          item.appendChild(icon);
          item.appendChild(dot);
          item.appendChild(name);
          item.appendChild(check);

          item.onclick = async () => {
            if (item.classList.contains("xor-loading")) return;
            item.classList.add("xor-loading");

            if (isChecked)
              await XOR_STORAGE.removeTweetFromFolder(tweetData.id, f.id);
            else await XOR_STORAGE.saveTweet(tweetData, f.id);

            onSave(f.id, !isChecked);
            setTimeout(hide, 300);
          };

          list.appendChild(item);
        });

      popover.appendChild(list);

      // New Folder Section
      const newFolderSection = document.createElement("div");
      newFolderSection.className = "xor-new-folder";

      const newBtn = document.createElement("button");
      newBtn.className = "xor-new-folder-btn";
      newBtn.textContent = ICONS.plus + " New Folder";

      const inputWrap = document.createElement("div");
      inputWrap.className = "xor-new-folder-input-wrap";

      const input = document.createElement("input");
      input.type = "text";
      input.className = "xor-new-folder-input";
      input.placeholder = "Name...";
      input.maxLength = 30;

      const submit = document.createElement("button");
      submit.className = "xor-new-folder-submit";
      submit.textContent = "✓";

      inputWrap.appendChild(input);
      inputWrap.appendChild(submit);
      newFolderSection.appendChild(newBtn);
      newFolderSection.appendChild(inputWrap);
      popover.appendChild(newFolderSection);

      newBtn.onclick = () => {
        newBtn.style.display = "none";
        inputWrap.classList.add("xor-active");
        input.focus();
      };

      submit.onclick = async () => {
        const name = input.value.trim();
        if (!name) return;
        submit.disabled = true;
        const folder = await XOR_STORAGE.createFolder(name);
        await XOR_STORAGE.saveTweet(tweetData, folder.id);
        onSave(folder.id, true);
        hide();
      };

      document.body.appendChild(popover);
      currentPopover = popover;

      // Trigger animation
      requestAnimationFrame(() => {
        popover.classList.add("xor-popover-visible");
      });
    } catch (e) {
      console.error("[XOR] Popover Error:", e);
    }
  }

  function hide() {
    if (currentPopover) {
      currentPopover.classList.remove("xor-popover-visible");
      const p = currentPopover;
      setTimeout(() => p.remove(), 200);
      currentPopover = null;
    }
    if (currentOverlay) {
      currentOverlay.remove();
      currentOverlay = null;
    }
  }

  return { show, hide };
})();
