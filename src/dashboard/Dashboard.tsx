import React, { useState } from "react";
import { Menu } from "lucide-react";
import { useStorage } from "../hooks/useStorage";
import { XOR_STORAGE } from "../shared/storage";
import { Sidebar } from "./components/Sidebar";
import { TweetGrid } from "./components/TweetGrid";
import { SettingsView } from "./components/SettingsView";
import { NewFolderModal } from "./components/NewFolderModal";

export const Dashboard: React.FC = () => {
  const { folders, tweets, loading } = useStorage();
  const [currentView, setCurrentView] = useState<"folder" | "settings">(
    "folder",
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set default folder on load
  React.useEffect(() => {
    if (!loading && folders.length > 0 && !selectedFolderId) {
      const savedTweetsFolder = folders.find((f) => f.name === "Saved Posts");
      if (savedTweetsFolder) {
        setSelectedFolderId(savedTweetsFolder.id);
      } else {
        setSelectedFolderId(folders[0].id);
      }
    }
  }, [loading, folders, selectedFolderId]);

  if (
    loading ||
    (folders.length > 0 && !selectedFolderId && currentView === "folder")
  )
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="animate-pulse text-2xl font-bold">Loading posts...</div>
      </div>
    );

  const folder = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)
    : null;
  const tweetList = Object.values(tweets);
  const displayTweets = selectedFolderId
    ? tweetList.filter((t) => t.folderIds.includes(selectedFolderId))
    : [];

  const handleAddFolder = async (name: string) => {
    await XOR_STORAGE.createFolder(name);
  };

  const handleDeleteFolder = async () => {
    if (selectedFolderId) {
      await XOR_STORAGE.deleteFolder(selectedFolderId);
      // Reset to first folder
      if (folders.length > 1) {
        const remaining = folders.filter((f) => f.id !== selectedFolderId);
        setSelectedFolderId(remaining[0].id);
      } else {
        setSelectedFolderId(null);
      }
    }
  };

  return (
    <div className="flex justify-center h-screen overflow-hidden bg-black text-[#e7e9ea]">
      <div className="flex w-full max-w-[1265px] relative">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-4 bg-black/80 p-4 backdrop-blur-md md:hidden border-b border-[rgb(47,51,54)]">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-full p-2 hover:bg-white/10 transition-colors"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold">𝕏𝕠𝕣</h1>
        </div>

        {/* Left Sidebar */}
        <Sidebar
          folders={folders}
          currentView={currentView}
          selectedFolderId={selectedFolderId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSetView={(view, id) => {
            setCurrentView(view);
            setSelectedFolderId(id || null);
            setIsSidebarOpen(false);
          }}
          onAddFolder={() => {
            setIsModalOpen(true);
            setIsSidebarOpen(false);
          }}
        />

        {/* Main Feed */}
        <main className="flex-1 w-full md:max-w-[600px] md:border-r md:border-l md:border-[rgb(47,51,54)] h-screen overflow-y-auto scrollbar-thin pt-[64px] md:pt-0">
          <div className="max-w-[600px] mx-auto w-full">
            {currentView === "folder" ? (
              <TweetGrid
                title={folder?.name || "Folder"}
                subtitle={`${displayTweets.length} posts`}
                tweets={displayTweets}
                selectedFolderId={selectedFolderId}
                onDeleteFolder={
                  selectedFolderId ? handleDeleteFolder : undefined
                }
              />
            ) : (
              <div className="p-4">
                <SettingsView />
              </div>
            )}
          </div>
        </main>
      </div>

      <NewFolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddFolder}
      />
    </div>
  );
};
