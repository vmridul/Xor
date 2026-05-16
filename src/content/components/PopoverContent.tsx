import React, { useState, useEffect } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { X, Check, Plus } from "lucide-react";
import { XOR_STORAGE } from "../../shared/storage";
import type { Folder } from "../../shared/storage";
import type { ExtractedTweet } from "../modules/Extractor";

interface PopoverContentProps {
  tweetData: ExtractedTweet;
  onSaved: () => void;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({
  tweetData,
  onSaved,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [savedFolderIds, setSavedFolderIds] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [f, existing] = await Promise.all([
        XOR_STORAGE.getFolders(),
        XOR_STORAGE.getTweetFolders(tweetData.id),
      ]);
      setFolders(f.sort((a, b) => a.order - b.order));
      setSavedFolderIds(existing.map((ex) => ex.id));
    };
    load();

    const storageListener = (changes: any, areaName: string) => {
      if (
        areaName === "local" &&
        Object.keys(changes).some((k) => k.startsWith("xor_"))
      ) {
        load();
      }
    };
    chrome.storage.onChanged.addListener(storageListener);
    return () => chrome.storage.onChanged.removeListener(storageListener);
  }, [tweetData.id]);

  const toggleFolder = async (folderId: string) => {
    const isChecked = savedFolderIds.includes(folderId);
    if (isChecked) {
      await XOR_STORAGE.removeTweetFromFolder(tweetData.id, folderId);
    } else {
      await XOR_STORAGE.saveTweet(tweetData, folderId);
    }
    onSaved();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const folder = await XOR_STORAGE.createFolder(newFolderName);
    await XOR_STORAGE.saveTweet(tweetData, folder.id);
    onSaved();
    setIsCreating(false);
    setNewFolderName("");
  };

  return (
    <div
      className="flex flex-col"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h3 className="text-[15px] font-bold text-white">Save to folder</h3>
        <PopoverPrimitive.Close className="rounded-full p-1 text-gray-500 hover:bg-gray-800 hover:text-white outline-none">
          <X size={18} />
        </PopoverPrimitive.Close>
      </div>

      <div className="max-h-60 overflow-y-auto py-1.5 scrollbar-thin scrollbar-thumb-gray-800">
        {folders.length === 0 && (
          <div className="px-4 py-3 text-center text-sm text-gray-500">
            No folders yet
          </div>
        )}
        {folders.map((f) => {
          const isChecked = savedFolderIds.includes(f.id);
          return (
            <button
              key={f.id}
              onClick={() => toggleFolder(f.id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-900 outline-none focus:bg-gray-900"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: f.color }}
              />
              <span className="flex-1 truncate text-left text-sm text-white font-medium">
                {f.name}
              </span>
              <div
                className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-all ${isChecked ? "bg-blue-500 border-blue-500" : "border-gray-700"}`}
              >
                {isChecked && <Check size={10} className="text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-800 p-3">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-700 px-3 py-2 text-sm text-gray-500 transition-colors hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-500 outline-none"
          >
            <Plus size={16} />
            <span>New Folder</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Name..."
              className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <button
              onClick={handleCreateFolder}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 outline-none"
            >
              <Check size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
