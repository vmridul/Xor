/**
 * XOR — Shared Utilities
 * Common helper functions used across content scripts, popup, and dashboard
 */

const XOR_UTILS = (() => {
  /**
   * Generate a UUID v4
   */
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Format a date as relative time (e.g., "2h ago", "3d ago")
   */
  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
      { label: 'y', seconds: 31536000 },
      { label: 'mo', seconds: 2592000 },
      { label: 'd', seconds: 86400 },
      { label: 'h', seconds: 3600 },
      { label: 'm', seconds: 60 },
      { label: 's', seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count}${interval.label} ago`;
      }
    }
    return 'just now';
  }

  /**
   * Format date for display
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Truncate text to a max length
   */
  function truncate(text, maxLength = 280) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
  }

  /**
   * Debounce a function
   */
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Default folder colors
   */
  const FOLDER_COLORS = [
    '#1d9bf0', // Twitter Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#a855f7', // Purple
  ];

  /**
   * Default folder icons
   */
  const FOLDER_ICONS = [
    '📁', '⭐', '🔥', '💡', '📌', '🎯', '💎', '🚀',
    '📚', '🎨', '💻', '🎵', '🏆', '❤️', '🌟', '📝',
  ];

  return {
    generateId,
    timeAgo,
    formatDate,
    truncate,
    debounce,
    escapeHtml,
    FOLDER_COLORS,
    FOLDER_ICONS,
  };
})();

// Make available globally
if (typeof window !== 'undefined') {
  window.XOR_UTILS = XOR_UTILS;
}
