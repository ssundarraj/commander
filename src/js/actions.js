chromePromise = new ChromePromise();
function triggerSearch(queryTriggerString) {
  return function() {
    document.getElementById('command').value = queryTriggerString + ' ';
  };
};
function switchToTab(tabId) {
  return async function () {
    await chromePromise.tabs.update(tabId, {'active': true});
    window.close();
  };
};

var defaultSugestions = [
  {
    text: 'Open Commander Options',
    action: async function() {
      await chromePromise.tabs.create({url: `chrome-extension://${chromePromise.runtime.id}/options.html`});
    },
  },
  {
    text: 'New Tab',
    action: async function() {
      await chromePromise.tabs.create({});
    },
  },
  {
    text: 'New Window',
    action: async function() {
      await chromePromise.windows.create({});
    },
  },
  {
    text: 'Show History',
    action: async function() {
      await chromePromise.tabs.create({url: 'chrome://history'});
    },
  },
  {
    text: 'Show Downloads',
    action: async function() {
      await chromePromise.tabs.create({url: 'chrome://downloads'});
    },
  },
  {
    text: 'Show Extensions',
    action: async function() {
      await chromePromise.tabs.create({url: 'chrome://extensions'});
    },
  },
  {
    text: 'Show Bookmarks',
    action: async function(){
      await chromePromise.tabs.create({url: 'chrome://bookmarks'});
    },
  },
  {
    text: 'Show Settings',
    action: async function() {
      await chromePromise.tabs.create({url: 'chrome://settings'});
    },
  },
  {
    text: 'Close Current Tab',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query({active: true, windowId});
      await chromePromise.tabs.remove(currentTab.id);
    },
  },
  {
    text: 'Reload Tab',
    action: async function() {
      await chromePromise.tabs.reload();
      window.close();
    },
  },
  {
    text: 'Reload All Tabs',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const allTabs = await chromePromise.tabs.query({windowId})
      for(tab of allTabs){
        await chromePromise.tabs.reload(tab.id);
      }
      window.close();
    },
  },
  {
    text: 'Clear Cache and Reload Tab',
    action: async function() {
      await chromePromise.tabs.reload({bypassCache:true});
      window.close();
    },
  },
  {
    text: 'Toggle Pin',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query({active: true, windowId});
      await chromePromise.tabs.update({pinned: !currentTab.pinned});
      window.close();
    },
  },
  {
    text: 'Duplicate Tab',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query({active: true, windowId});
      await chromePromise.tabs.duplicate(currentTab.id);
    },
  },
  {
    text: 'New Incognito Window',
    action: async function() {
      await chromePromise.windows.create({incognito: true});
    },

  },
  {
    text: 'Close Other Tabs',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const otherTabs = await chromePromise.tabs.query({active: false, windowId});
      const otherTabIds = otherTabs.map(({id}) => id);
      await chromePromise.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    text: 'Close Tabs To Right',
    keyword: 'right',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query({active: true, windowId});
      const otherTabs = await chromePromise.tabs.query({active: false, windowId});
      const otherTabIds = otherTabs.filter((tab) =>
          tab.index > currentTab.index
        ).map(({id}) => id);
      await chromePromise.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    text: 'Close Tabs To Left',
    keyword: 'left',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query({active: true, windowId});
      const otherTabs = await chromePromise.tabs.query({active: false, windowId});
      const otherTabIds = otherTabs.filter((tab) =>
          tab.index < currentTab.index
        ).map(({id}) => id);
      await chromePromise.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    text: 'Mute/Unmute Tab',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query(queryInfo = {active: true, windowId});
      const isMuted = currentTab.mutedInfo.muted;
      await chromePromise.tabs.update({muted: !isMuted});
      window.close();
    },
  },
  {
    text: 'Define in Dictionary.com',
    action: triggerSearch('def'),
    triggers: ['def', 'define', 'dictionary'],
    queryToUrl: (q) => `http://dictionary.reference.com/browse/${q}`,
  },
  {
    text: 'Search YouTube',
    action: triggerSearch('yt'),
    triggers: ['yt', 'youtube'],
    queryToUrl: (q) => `https://www.youtube.com/results?search_query=${q}`,

  },
  {
    text: 'Search Wikipedia',
    action: triggerSearch('wiki'),
    triggers: ['wiki', 'wikipedia'],
    queryToUrl: (q) => `http://en.wikipedia.org/wiki/${q}`,
  },
  {
    text: 'Search IMDB',
    action: triggerSearch('imdb'),
    triggers: ['imdb'],
    queryToUrl: (q) => `http://www.imdb.com/find?s=all&q=${q}`,
  },
  {
    text: 'Move Tab To Start',
    keyword: 'move start',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query({active: true, windowId});
      await chromePromise.tabs.move(currentTab.id, {index: 0});
      window.close();
    },
  },
  {
    text: 'Move Tab To End',
    keyword: 'move end',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query({active: true, windowId});
      await chromePromise.tabs.move(currentTab.id, {index: -1});
      window.close();
    },
  },
  {
    text: 'Move Tab Left',
    keyword: 'move left',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query({active: true, windowId});
      await chromePromise.tabs.move(currentTab.id, {index: currentTab.index - 1});
      window.close();
    },
  },
  {
    text: 'Move Tab Right',
    keyword: 'move right',
    action: async function(){
      const windowId = chromePromise.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await chromePromise.tabs.query({active: true, windowId});
      await chromePromise.tabs.move(currentTab.id, {index: currentTab.index + 1});
      window.close();
    },
  },
  {
    text: 'Reopen Closed Tab',
    keyword: 'reopen unclose',
    action: async function(){
      return await chromePromise.sessions.restore();
    },
  },
  {
    text: 'Deattach Tab (Move to New Window)',
    keyword: 'move new window deattach',
    action: async function() {
      const tab = await chromePromise.tabs.getSelected();
      await chromePromise.windows.create({ tabId: tab.id });
    },
  },
  {
    text: 'Reattach Tab (Move Tab to Previous Window)',
    keyword: 'move Previous window reattach',
    action: async function() {
      const currentTab = await chromePromise.tabs.getSelected();
      const currentWindow = await chromePromise.windows.getCurrent({ windowTypes: ['normal'] });
      const allWindows = await chromePromise.windows.getAll({ windowTypes: ['normal'] });
      const otherWindows = allWindows.filter(win => (win.id !== currentWindow.id))
      const prevWindow = otherWindows[0];
      await chromePromise.windows.update(prevWindow.id, { focused: true })
      await chromePromise.tabs.move(currentTab.id, { windowId: prevWindow.id, index: -1 })
      await chromePromise.tabs.update(currentTab.id, { highlighted: true })
    },
  },
];
