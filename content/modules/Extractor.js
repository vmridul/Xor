/**
 * XOR — Tweet Data Extractor Module
 */
window.XOR_EXTRACTOR = (() => {
  function extract(article) {
    try {
      let tweetUrl = "";
      const statusLink = article.querySelector('a[href*="/status/"]');
      if (statusLink) {
        tweetUrl = statusLink.getAttribute("href") || "";
      }

      const tweetId =
        tweetUrl.split("/status/")[1]?.split(/[?/]/)[0] ||
        article.getAttribute("data-tweet-id") ||
        Date.now().toString();

      const userLinks = article.querySelectorAll('a[role="link"]');
      let authorName = "",
        authorHandle = "",
        authorAvatar = "";

      for (const link of userLinks) {
        const href = link.getAttribute("href") || "";
        if (
          href.startsWith("/") &&
          !href.includes("/status/") &&
          href.length > 1
        ) {
          if (!authorHandle) authorHandle = "@" + href.substring(1);
          const nameEl = link.querySelector("span");
          if (nameEl && !authorName) authorName = nameEl.textContent || "";
          if (authorHandle && authorName) break;
        }
      }

      const avatarImg = article.querySelector('img[src*="profile_images"]');
      if (avatarImg) authorAvatar = avatarImg.src;

      const tweetTextEl = article.querySelector('[data-testid="tweetText"]');
      const text = tweetTextEl ? tweetTextEl.textContent : "";

      const timeEl = article.querySelector("time");
      const timestamp = timeEl
        ? timeEl.getAttribute("datetime")
        : new Date().toISOString();

      const media = [];
      article
        .querySelectorAll('[data-testid="tweetPhoto"] img')
        .forEach((img) => {
          if (img.src && !img.src.includes("emoji"))
            media.push({ type: "image", url: img.src });
        });

      const stats = { likes: 0, retweets: 0, replies: 0 };
      const groups = article.querySelectorAll('[role="group"] button');
      if (groups.length >= 3) {
        stats.replies =
          parseInt(groups[0]?.getAttribute("aria-label")?.match(/\d+/)?.[0]) ||
          0;
        stats.retweets =
          parseInt(groups[1]?.getAttribute("aria-label")?.match(/\d+/)?.[0]) ||
          0;
        stats.likes =
          parseInt(
            groups[groups.length >= 4 ? 3 : 2]
              ?.getAttribute("aria-label")
              ?.match(/\d+/)?.[0],
          ) || 0;
      }

      return {
        id: tweetId,
        text,
        authorName,
        authorHandle,
        authorAvatar,
        timestamp,
        url: tweetUrl.startsWith("/") ? `https://x.com${tweetUrl}` : tweetUrl,
        media,
        stats,
      };
    } catch (e) {
      console.error("[XOR] Extraction error:", e);
      return null;
    }
  }

  return { extract };
})();
