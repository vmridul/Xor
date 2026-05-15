import { state } from '../services/State.js';

export class SettingsView {
  constructor(el) {
    this.el = el;
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('exportBtn').onclick = async () => {
      const data = await XOR_STORAGE.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `xor-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    };
  }

  render() {
    // Basic settings render logic if needed
  }
}
