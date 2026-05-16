import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { MoreHorizontal, ExternalLink, Play, Trash2 } from "lucide-react";
import type { Tweet } from "../../shared/storage";
import { XOR_STORAGE } from "../../shared/storage";
import { XOR_UTILS } from "../../shared/utils";

interface TweetCardProps {
  tweet: Tweet;
  selectedFolderId: string | null;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  selectedFolderId,
}) => {
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedFolderId) {
      await XOR_STORAGE.removeTweetFromFolder(tweet.id, selectedFolderId);
    }
  };

  return (
    <div
      onClick={() => {
        window.open(`${tweet.url}`, "_blank");
      }}
      className="group relative flex flex-col bg-black border border-t-0 border-[rgb(47,51,54)] px-4 py-3 hover:bg-[#080808] transition-colors cursor-pointer"
    >
      <div className="flex gap-3 items-start justify-start">
        <div className="flex-shrink-0">
          <img
            src={tweet.authorAvatar}
            className="h-10 w-10 rounded-full bg-gray-800 object-cover"
            alt=""
          />
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1 min-w-0">
              <span className="truncate font-bold text-[15px] text-[#e7e9ea]">
                {tweet.authorName}
              </span>
              {tweet.isVerified && (
                <svg
                  viewBox="0 0 24 24"
                  aria-label="Verified account"
                  className="h-[18px] w-[18px] text-[#1d9bf0] fill-current flex-shrink-0"
                >
                  <g>
                    <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.97-.81-4.08s-2.47-1.49-4.08-1.03c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.61-.46-3.07.08-4.08 1.03s-1.27 2.69-.81 4.08c-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.21 2.97.8 4.08s2.47 1.49 4.08 1.03c.66 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.61.46 3.07-.08 4.08-1.03s1.27-2.69.81-4.08c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.35-6.2 6.78z"></path>
                  </g>
                </svg>
              )}
              <span className="truncate text-[15px] text-[#71767b]">
                {tweet.authorHandle}
              </span>
              <span className="text-[15px] text-[#71767b]">·</span>
              <span className="text-[15px] text-[#71767b] whitespace-nowrap">
                {XOR_UTILS.timeAgo(tweet.timestamp)}
              </span>
            </div>

            <PopoverPrimitive.Root>
              <PopoverPrimitive.Trigger asChild>
                <button
                  className="rounded-full p-1 cursor-pointer  text-[#71767b] hover:bg-white/10 hover:text-white/40 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>
              </PopoverPrimitive.Trigger>

              <PopoverPrimitive.Content
                side="bottom"
                align="end"
                sideOffset={5}
                className="z-50 min-w-[180px] overflow-hidden rounded-xl border border-[rgb(47,51,54)] bg-black shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleRemove}
                  className="flex w-full items-center gap-2 cursor-pointer px-3 py-2 text-[14px] text-white/90 hover:bg-white/10 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Remove from folder</span>
                </button>
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Root>
          </div>

          <div className="text-[15px] leading-normal text-[#e7e9ea] mb-3 whitespace-pre-wrap break-words">
            {tweet.text}
          </div>

          {tweet.media && tweet.media.length > 0 && (
            <div
              className={`mb-3 overflow-hidden rounded-2xl border border-[rgb(47,51,54)] ${
                tweet.media.length === 1
                  ? "aspect-auto max-h-[510px]"
                  : "grid grid-cols-2 gap-0.5 aspect-[1.78/1]"
              }`}
            >
              {tweet.media.slice(0, 4).map((m, i) => (
                <div key={i} className="relative h-full w-full overflow-hidden">
                  <img
                    src={m.url}
                    className="h-full w-full object-cover"
                    alt=""
                  />
                  {m.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1d9bf0] text-white shadow-xl">
                        <Play size={24} fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[13px] text-[#71767b]">
          Saved {XOR_UTILS.timeAgo(tweet.savedAt)}
        </span>
        <a
          href={tweet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[13px] text-[#71767b] hover:text-[#1d9bf0] transition-colors"
        >
          <span>View on X</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
