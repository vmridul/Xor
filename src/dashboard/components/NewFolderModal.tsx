import React, { useState } from "react";

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      setName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-full max-w-md rounded-2xl bg-black p-6 border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">Create New Folder</h2>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-[14px] bg-[#16181c] border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/40 focus:outline-none transition-colors mb-6"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-[14px] rounded-full cursor-pointer text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-3 text-[14px] rounded-full cursor-pointer bg-white disabled:opacity-50 text-black  hover:bg-gray-100 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
