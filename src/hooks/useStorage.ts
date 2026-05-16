import { useState, useEffect, useCallback } from "react";
import { XOR_STORAGE } from "../shared/storage";
import type { Folder, Tweet, Settings } from "../shared/storage";

export function useStorage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tweets, setTweets] = useState<{ [key: string]: Tweet }>({});
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const [f, t, s] = await Promise.all([
      XOR_STORAGE.getFolders(),
      XOR_STORAGE.getTweets(),
      XOR_STORAGE.getSettings(),
    ]);
    setFolders(f);
    setTweets(t);
    setSettings(s);
    if (isInitial) setLoading(false);
  }, []);

  useEffect(() => {
    loadAll(true);

    const storageListener = (changes: any, areaName: string) => {
      if (areaName === "local") {
        const keys = Object.keys(changes);
        if (keys.some((key) => key.startsWith("xor_"))) {
          loadAll(false);
        }
      }
    };

    const messageListener = (message: any) => {
      if (message.action === "xor_data_changed") {
        loadAll(false);
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [loadAll]);

  return { folders, tweets, settings, loading, refresh: loadAll };
}
