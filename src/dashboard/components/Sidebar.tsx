import React from "react";
import { X } from "lucide-react";
import type { Folder } from "../../shared/storage";

interface SidebarProps {
  folders: Folder[];
  currentView: string;
  selectedFolderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSetView: (view: any, id?: string) => void;
  onAddFolder: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  currentView,
  selectedFolderId,
  isOpen,
  onClose,
  onSetView,
  onAddFolder,
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed md:relative top-0 left-0 z-50 h-screen flex flex-col md:pl-4 lg:pl-16 px-2 py-8 w-[260px] lg:w-[350px] border-r border-[rgb(47,51,54)] bg-black transition-transform duration-300 ease-in-out md:translate-x-0 md:border-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-8 px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">𝕏𝕠𝕣</h1>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto scrollbar-hide">
          {[...folders]
            .sort((a, b) => a.order - b.order)
            .map((f) => {
              const isSelected =
                selectedFolderId === f.id && currentView === "folder";
              return (
                <button
                  key={f.id}
                  onClick={() => onSetView("folder", f.id)}
                  className={`flex items-center rounded-full px-4 py-3 transition-colors hover:bg-[#181818] w-max text-[20px] text-left ${
                    isSelected ? "text-white/90" : "text-white/60"
                  }`}
                >
                  <div
                    className="mr-3 h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: f.color }}
                  />
                  <div className="inline-grid">
                    <span
                      className="invisible truncate max-w-[200px] row-start-1 col-start-1 font-bold"
                      aria-hidden="true"
                    >
                      {f.name}
                    </span>
                    <span
                      className={`row-start-1 truncate max-w-[200px] col-start-1 ${
                        isSelected ? "" : ""
                      }`}
                    >
                      {f.name}
                    </span>
                  </div>
                </button>
              );
            })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 max-w-[240px] w-full px-2">
          <button
            onClick={onAddFolder}
            className="flex items-center cursor-pointer hover:bg-gray-200 rounded-full font-bold px-8 py-3 transition-colors bg-white w-full text-[17px] text-black justify-center shadow-sm"
          >
            New Folder
          </button>

          <button
            onClick={() => onSetView("settings")}
            className={`flex items-center cursor-pointer bg-white/10 rounded-full font-bold px-8 py-3 transition-colors w-full text-[17px] justify-center shadow-sm`}
          >
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};
