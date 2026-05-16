export interface ExtractedTweet {
  id: string;
  text: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  isVerified: boolean;
  timestamp: string;
  url: string;
  media: { type: string; url: string }[];
  stats: { likes: number; retweets: number; replies: number };
}

export const XOR_EXTRACTOR = {
  extract: (article: HTMLElement): ExtractedTweet | null => {
    try {
      let tweetUrl = "";
      // Try to find the link that points to the status (timestamp link)
      const statusLinks = Array.from(
        article.querySelectorAll('a[href*="/status/"]'),
      );
      // Prefer links that contain a <time> element
      const timestampLink =
        statusLinks.find((link) => link.querySelector("time")) ||
        statusLinks[0];

      if (timestampLink) {
        tweetUrl = timestampLink.getAttribute("href") || "";
      }

      let tweetId = tweetUrl.split("/status/")[1]?.split(/[?/]/)[0];

      // Fallback: If no status link found, and we're on a status page, use the URL ID
      if (!tweetId && window.location.pathname.includes("/status/")) {
        tweetId = window.location.pathname
          .split("/status/")[1]
          ?.split(/[?/]/)[0];
        tweetUrl = window.location.pathname;
      }

      // Final fallback for ID
      if (!tweetId) {
        tweetId =
          article.getAttribute("data-tweet-id") || Date.now().toString();
      }

      // Helper to extract timestamp from Snowflake ID (X's ID format)
      const getTimestampFromId = (id: string): string | null => {
        try {
          const snowflake = BigInt(id);
          const timestamp = (snowflake >> 22n) + 1288834974657n;
          return new Date(Number(timestamp)).toISOString();
        } catch (e) {
          return null;
        }
      };

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

      const avatarImg = article.querySelector(
        'img[src*="profile_images"]',
      ) as HTMLImageElement;
      if (avatarImg) authorAvatar = avatarImg.src;

      const isVerified = !!article.querySelector(
        '[data-testid="icon-verified"]',
      );

      const tweetTextEl = article.querySelector('[data-testid="tweetText"]');
      const text = tweetTextEl ? tweetTextEl.textContent || "" : "";

      // Prefer time element from the timestamp link we identified earlier
      const timeEl =
        timestampLink?.querySelector("time") || article.querySelector("time");
      let timestamp = timeEl?.getAttribute("datetime");

      // If timestamp is not found in DOM, try to derive it from the tweet ID
      if (!timestamp && tweetId && tweetId.length > 10) {
        timestamp = getTimestampFromId(tweetId) || new Date().toISOString();
      } else if (!timestamp) {
        timestamp = new Date().toISOString();
      }

      const media: { type: string; url: string }[] = [];

      // Extract images
      article
        .querySelectorAll('[data-testid="tweetPhoto"] img')
        .forEach((img) => {
          const imgSrc = (img as HTMLImageElement).src;
          if (
            imgSrc &&
            !imgSrc.includes("emoji") &&
            !media.find((m) => m.url === imgSrc)
          ) {
            media.push({ type: "image", url: imgSrc });
          }
        });

      // Extract video thumbnails
      article
        .querySelectorAll('[data-testid="videoPlayer"] video')
        .forEach((video) => {
          const poster = (video as HTMLVideoElement).poster;
          if (poster && !media.find((m) => m.url === poster)) {
            media.push({ type: "video", url: poster });
          }
        });

      // Fallback for videos/other media
      if (media.length === 0) {
        article
          .querySelectorAll('img[src*="tweet_video_thumb"]')
          .forEach((img) => {
            const imgSrc = (img as HTMLImageElement).src;
            if (imgSrc && !media.find((m) => m.url === imgSrc)) {
              media.push({ type: "video", url: imgSrc });
            }
          });
      }

      const stats = { likes: 0, retweets: 0, replies: 0 };
      const groups = article.querySelectorAll('[role="group"] button');
      if (groups.length >= 3) {
        stats.replies =
          parseInt(
            groups[0]?.getAttribute("aria-label")?.match(/\d+/)?.[0] || "0",
          ) || 0;
        stats.retweets =
          parseInt(
            groups[1]?.getAttribute("aria-label")?.match(/\d+/)?.[0] || "0",
          ) || 0;
        stats.likes =
          parseInt(
            groups[groups.length >= 4 ? 3 : 2]
              ?.getAttribute("aria-label")
              ?.match(/\d+/)?.[0] || "0",
          ) || 0;
      }

      return {
        id: tweetId,
        text,
        authorName,
        authorHandle,
        authorAvatar,
        isVerified,
        timestamp,
        url: tweetUrl.startsWith("/") ? `https://x.com${tweetUrl}` : tweetUrl,
        media,
        stats,
      };
    } catch (e) {
      console.error("[XOR] Extraction error:", e);
      return null;
    }
  },
};
