import React from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { XOR_STORAGE } from "../../shared/storage";

export const SettingsView: React.FC = () => {
  const handleExport = async () => {
    const data = await XOR_STORAGE.getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xor-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (re) => {
          try {
            const data = JSON.parse(re.target?.result as string);
            await XOR_STORAGE.importData(data);
            alert("Data imported successfully!");
          } catch (err) {
            alert("Failed to import data. Please check the file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = async () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone.",
      )
    ) {
      await XOR_STORAGE.clearAllData();
      alert("All data cleared.");
    }
  };

  return (
    <div className="max-w-2xl p-8">
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-white">
        Settings
      </h1>
      <div className="space-y-2">
        <button
          onClick={handleExport}
          className="flex w-full items-center justify-between rounded-xl hover:bg-white/10 px-5 py-3 transition-colors "
        >
          <div className="flex items-center gap-4">
            <Download className="" size={20} />
            <div className="text-left">
              <div className="text-sm font-bold text-white">Export Data</div>
              <div className="text-xs text-white/70">
                Download all your data as a JSON file
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={handleImport}
          className="flex w-full items-center justify-between rounded-xl hover:bg-white/10 px-5 py-3 transition-colors "
        >
          <div className="flex items-center gap-4">
            <Upload className="" size={20} />
            <div className="text-left">
              <div className="text-sm font-bold text-white">Import Data</div>
              <div className="text-xs text-white/70">
                Restore data from a JSON file
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={handleClear}
          className="flex w-full items-center justify-between rounded-xl hover:bg-white/10 px-5 py-3 transition-colors "
        >
          <div className="flex items-center gap-4">
            <Trash2 className="" size={20} />
            <div className="text-left">
              <div className="text-sm font-bold text-white">Clear All Data</div>
              <div className="text-xs text-white/70">
                You can't undo this action.
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
