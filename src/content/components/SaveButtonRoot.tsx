import React, { useState, useEffect } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Plus } from "lucide-react";
import { XOR_EXTRACTOR } from "../modules/Extractor";
import type { ExtractedTweet } from "../modules/Extractor";
import { XOR_STORAGE } from "../../shared/storage";
import { PopoverContent } from "./PopoverContent";

interface SaveButtonRootProps {
  article: HTMLElement;
  portalContainer: HTMLElement;
  isDetail?: boolean;
}

export const SaveButtonRoot: React.FC<SaveButtonRootProps> = ({
  article,
  portalContainer,
  isDetail = false,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [tweetData, setTweetData] = useState<ExtractedTweet | null>(null);
  const [savedFoldersCount, setSavedFoldersCount] = useState(0);
  const [open, setOpen] = useState(false);

  const checkStatus = async () => {
    const data = XOR_EXTRACTOR.extract(article);
    if (data) {
      setTweetData(data);
      const folders = await XOR_STORAGE.getTweetFolders(data.id);
      setIsSaved(folders.length > 0);
      setSavedFoldersCount(folders.length);
    }
  };

  useEffect(() => {
    checkStatus();
    const listener = (msg: any) => {
      if (msg.action === "xor_data_changed") checkStatus();
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Re-extract data on click to ensure we get the latest state (images loaded)
            const freshData = XOR_EXTRACTOR.extract(article);
            if (freshData) setTweetData(freshData);
            setOpen(!open);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          className={`group relative flex items-center justify-center rounded-full transition-all hover:bg-blue-500/10 active:scale-90 ${
            isDetail ? "h-9 w-9" : "h-[34.75px] w-[34.75px]"
          } ${isSaved ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}`}
          title={
            isSaved ? `Saved in ${savedFoldersCount} folders` : "Save tweet"
          }
        >
          <Plus
            size={isDetail ? 22 : 18.75}
            strokeWidth={2}
            className={`${isSaved ? "fill-blue-500" : "fill-none"} cursor-pointer`}
          />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal container={portalContainer}>
        <PopoverPrimitive.Content
          side="top"
          align="center"
          sideOffset={8}
          className="w-64 overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-2xl animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 duration-200"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onInteractOutside={(e) => {
            e.stopPropagation();
          }}
        >
          {tweetData && (
            <PopoverContent
              tweetData={tweetData}
              onSaved={() => {
                checkStatus();
                setOpen(false);
              }}
            />
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
