import React, { useState, useMemo } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { MoreHorizontal, Trash2 } from "lucide-react";
import type { Tweet } from "../../shared/storage";
import { TweetCard } from "./TweetCard";

interface TweetGridProps {
  title: string;
  subtitle: string;
  tweets: Tweet[];
  selectedFolderId: string | null;
  onDeleteFolder?: () => void;
}

export const TweetGrid: React.FC<TweetGridProps> = ({
  title,
  subtitle,
  tweets,
  selectedFolderId,
  onDeleteFolder,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTweets = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return tweets;

    return tweets.filter((tweet) => {
      return (
        tweet.text.toLowerCase().includes(query) ||
        tweet.authorName.toLowerCase().includes(query) ||
        tweet.authorHandle.toLowerCase().includes(query)
      );
    });
  }, [tweets, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen pb-8">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-3 sm:px-5 py-4 sm:py-3 border-b border-[rgb(47,51,54)] flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex flex-col min-w-0 flex-shrink">
          <span className="text-base sm:text-lg font-bold text-white truncate">
            {title}
          </span>
          <span className="text-[11px] sm:text-[13px] text-gray-500 whitespace-nowrap">
            {subtitle}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-0 border border-[rgb(47,51,54)] rounded-full text-[13px] sm:text-[14px] px-3 sm:px-4 py-3 sm:py-3 outline-0 focus:outline-none text-gray-300 bg-black/20"
          />

          {onDeleteFolder && (
            <PopoverPrimitive.Root>
              <PopoverPrimitive.Trigger asChild>
                <button className="rounded-full p-2.5 text-[#71767b] hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                  <MoreHorizontal size={20} />
                </button>
              </PopoverPrimitive.Trigger>

              <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                  side="bottom"
                  align="end"
                  sideOffset={5}
                  className="z-50 min-w-[180px] overflow-hidden rounded-xl border border-[rgb(47,51,54)] bg-black shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete "${title}"? This will not delete the posts, but will remove them from this folder.`,
                        )
                      ) {
                        onDeleteFolder();
                      }
                    }}
                    className="flex w-full items-center gap-2 cursor-pointer px-3 py-2 text-[14px] font-medium text-red-200 hover:bg-white/10 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Delete folder</span>
                  </button>
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
          )}
        </div>
      </div>
      {filteredTweets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#71767b]">
          <h3 className="text-[19px] font-bold text-[#e7e9ea] mb-1">
            {searchQuery ? "No results found" : "No posts here yet"}
          </h3>
          <p className="max-w-[300px] text-center text-[15px]">
            {searchQuery
              ? `We couldn't find any matches for "${searchQuery}"`
              : "Save posts by clicking the + button on any post"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {[...filteredTweets]
            .sort(
              (a, b) =>
                new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
            )
            .map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                selectedFolderId={selectedFolderId}
              />
            ))}
        </div>
      )}
    </div>
  );
};
