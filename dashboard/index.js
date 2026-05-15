/**
 * XOR — Dashboard Entry Point
 */
import { state } from './services/State.js';
import { Sidebar } from './components/Sidebar.js';
import { TweetGrid } from './components/TweetGrid.js';
import { StatsView } from './components/StatsView.js';
import { SettingsView } from './components/SettingsView.js';

async function init() {
  const sidebar = new Sidebar(document.getElementById('sidebar'));
  const grid = new TweetGrid(document.getElementById('viewTweets'));
  const stats = new StatsView(document.getElementById('viewStats'));
  const settings = new SettingsView(document.getElementById('viewSettings'));
  
  state.subscribe(() => {
    sidebar.render();
    grid.render();
    if (state.currentView === 'stats') stats.render();
    updateGlobalUI();
  });

  await state.load();
  bindGlobalEvents();
}

function updateGlobalUI() {
  const v = state.currentView;
  document.getElementById('viewTweets').style.display = (v === 'all' || v === 'folder') ? '' : 'none';
  document.getElementById('viewSearch').style.display = v === 'search' ? '' : 'none';
  document.getElementById('viewStats').style.display = v === 'stats' ? '' : 'none';
  document.getElementById('viewSettings').style.display = v === 'settings' ? '' : 'none';
}

function bindGlobalEvents() {
  document.getElementById('navAll').onclick = () => state.setView('all');
  document.getElementById('navSearch').onclick = () => state.setView('search');
  document.getElementById('navStats').onclick = () => state.setView('stats');
  document.getElementById('navSettings').onclick = () => state.setView('settings');
}

document.addEventListener('DOMContentLoaded', init);
