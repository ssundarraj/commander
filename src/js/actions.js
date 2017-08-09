chromeP = new ChromePromise();
function triggerSearch(queryTriggerString) {
  return function() {
    document.getElementById('command').value = queryTriggerString + ' ';
  };
};
function switchToTab(tabId) {
  return async function () {
    await chromeP.tabs.update(tabId, {'active': true});
    window.close();
  };
};

var defaultSugestions = [
  {
    text: 'Open Commander Options',
    action: async function() {
      await chromeP.tabs.create({url: `chrome-extension://${chromeP.runtime.id}/options.html`});
    },
  },
  {
    text: 'New Tab',
    action: async function() {
      await chromeP.tabs.create({});
    },
  },
  {
    text: 'New Window',
    action: async function() {
      await chromeP.windows.create({});
    },
  },
  {
    text: 'Show History',
    action: async function() {
      await chromeP.tabs.create({url: 'chrome://history'});
    },
  },
  {
    text: 'Show Downloads',
    action: async function() {
      await chromeP.tabs.create({url: 'chrome://downloads'});
    },
  },
  {
    text: 'Show Extensions',
    action: async function() {
      await chromeP.tabs.create({url: 'chrome://extensions'});
    },
  },
  {
    text: 'Show Bookmarks',
    action: async function(){
      await chromeP.tabs.create({url: 'chrome://bookmarks'});
    },
  },
  {
    text: 'Show Settings',
    action: async function() {
      await chromeP.tabs.create({url: 'chrome://settings'});
    },
  },
  {
    text: 'Close Current Tab',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query({active: true, windowId});
      await chromeP.tabs.remove(currentTab.id);
    },
  },
  {
    text: 'Reload Tab',
    action: async function() {
      await chromeP.tabs.reload();
      window.close();
    },
  },
  {
    text: 'Reload All Tabs',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const allTabs = await chromeP.tabs.query({windowId})
      for(tab of allTabs){
        await chromeP.tabs.reload(tab.id);
      }
      populateSuggestionsBox(suggestionList);
    },
  },
  {
    text: 'Clear Cache and Reload Tab',
    action: async function() {
      await chromeP.tabs.reload({bypassCache:true});
      window.close();
    },
  },
  {
    text: 'Toggle Pin',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query({active: true, windowId});
      await chromeP.tabs.update({pinned: !currentTab.pinned});
      window.close();
    },
  },
  {
    text: 'Duplicate Tab',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query({active: true, windowId});
      await chromeP.tabs.duplicate(currentTab.id);
    },
  },
  {
    text: 'New Incognito Window',
    action: async function() {
      await chromeP.windows.create({incognito: true});
    },

  },
  {
    text: 'Close Other Tabs',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const otherTabs = await chromeP.tabs.query({active: false, windowId});
      const otherTabIds = otherTabs.map(({id}) => id);
      await chromeP.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    text: 'Close Tabs To Right',
    keyword: 'right',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query({active: true, windowId});
      const otherTabs = await chromeP.tabs.query({active: false, windowId});
      const otherTabIds = otherTabs.filter((tab) =>
          tab.index > currentTab.index
        ).map(({id}) => id);
      await chromeP.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    text: 'Close Tabs To Left',
    keyword: 'left',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query({active: true, windowId});
      const otherTabs = await chromeP.tabs.query({active: false, windowId});
      const otherTabIds = otherTabs.filter((tab) =>
          tab.index < currentTab.index
        ).map(({id}) => id);
      await chromeP.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    text: 'Mute/Unmute Tab',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query(queryInfo = {active: true, windowId});
      const isMuted = currentTab.mutedInfo.muted;
      await chromeP.tabs.update({muted: !isMuted});
      window.close();
    },
  },
  {
    text: 'Define in Dictionary.com',
    action: triggerSearch('def')
  },
  {
    text: 'Search YouTube',
    action: triggerSearch('yt')
  },
  {
    text: 'Search Wikipedia',
    action: triggerSearch('wiki')
  },
  {
    text: 'Search IMDB',
    action: triggerSearch('imdb')
  },
  {
    text: 'Move Tab To Start',
    keyword: 'move start',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query({active: true, windowId});
      await chromeP.tabs.move(currentTab.id, {index: 0});
      window.close();
    },
  },
  {
    text: 'Move Tab To End',
    keyword: 'move end',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query({active: true, windowId});
      await chromeP.tabs.move(currentTab.id, {index: -1});
      window.close();
    },
  },
  {
    text: 'Move Tab Left',
    keyword: 'move left',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query({active: true, windowId});
      await chromeP.tabs.move(currentTab.id, {index: currentTab.index - 1});
      window.close();
    },
  },
  {
    text: 'Move Tab Right',
    keyword: 'move right',
    action: async function(){
      const windowId = chromeP.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromeP.tabs.query({active: true, windowId});
      await chromeP.tabs.move(currentTab.id, {index: currentTab.index + 1});
      window.close();
    },
  },
  {
    text: 'Reopen Closed Tab',
    keyword: 'reopen',
    action: async function(){
      const [lastClosed] = await chromeP.sessions.getRecentlyClosed();
      await chromeP.sessions.restore(lastClosed.tab.sessionId);
    },
  },
  {
    text: 'Deattach Tab (Move to New Window)',
    keyword: 'move new window deattach',
    action: async function() {
      const tab = await chromeP.tabs.getSelected();
      await chromeP.windows.create({ tabId: tab.id });
    },
  },
  {
    text: 'Reattach Tab (Move Tab to Previous Window)',
    keyword: 'move Previous window reattach',
    action: async function() {
      const currentTab = await chromeP.tabs.getSelected();
      const currentWindow = await chromeP.windows.getCurrent({ windowTypes: ['normal'] });
      const allWindows = await chromeP.windows.getAll({ windowTypes: ['normal'] });
      const otherWindows = allWindows.filter(win => (win.id !== currentWindow.id))
      const prevWindow = otherWindows[0];
      await chromeP.windows.update(prevWindow.id, { focused: true })
      await chromeP.tabs.move(currentTab.id, { windowId: prevWindow.id, index: -1 })
      await chromeP.tabs.update(currentTab.id, { highlighted: true })
    },
  },
];
