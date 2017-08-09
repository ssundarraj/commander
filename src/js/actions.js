function openNewTab() {
    chrome.tabs.create({});
}

function openNewWindow() {
    chrome.windows.create({});
}

function openHistory() {
    chrome.tabs.create({url: "chrome://history"});
}

function openDownloads() {
    chrome.tabs.create({url: "chrome://downloads"});
}

function openExtensions() {
    chrome.tabs.create({url: "chrome://extensions"});
}

function openSettings() {
    chrome.tabs.create({url: "chrome://settings"});
}

function openBookmarks(){
    chrome.tabs.create({url: "chrome://bookmarks"});
}

function closeCurrentTab() {
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTab) {
        currentTab = currentTab[0];
        chrome.tabs.remove(currentTab.id);
    });
}

function reopenClosedTab() {
  chrome.sessions.getRecentlyClosed( undefined, function([ lastClosed ]) {
    console.log("lastSessionId", lastClosed.tab.sessionId)
    chrome.sessions.restore(lastClosed.tab.sessionId);
  });
}

function moveTabToNewWindow() {
  chrome.tabs.getSelected(tab => {
    chrome.windows.create({ tabId: tab.id });
  });
}
function moveTabToPrevWindow() {
  chrome.tabs.getSelected(currentTab => {
    chrome.windows.getCurrent({ windowTypes: ['normal'] }, (currentWindow) => {
      chrome.windows.getAll({ windowTypes: ['normal'] }, (allWindows) => {
        allWindows.some(win => {
          if (win.id !== currentWindow.id) {
            chrome.windows.update(win.id, { focused: true })
            chrome.tabs.move(currentTab.id, {
              windowId: win.id,
              index: -1,
            }, () => {
              chrome.tabs.update(currentTab.id, { highlighted: true })
            });
            return true;
          }
        })
      });
    });
  });
}

function reloadTab() {
    chrome.tabs.reload();
    window.close();
}

function reloadAllTabs(){
    chrome.tabs.query({'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (allTabs){
        for(tab of allTabs){
            chrome.tabs.reload(tab.id);
        }
        populateSuggestionsBox(suggestionList);
    });
}

function reloadWithoutCache() {
    chrome.tabs.reload(reloadProperties={'bypassCache':true});
    window.close();
}

function newIncognitoWindow() {
    chrome.windows.create({'incognito': true});
}

function togglePin(){
    var isPinned;
    chrome.tabs.query(queryInfo = {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(currentTab){
        isPinned = currentTab[0].pinned;
        chrome.tabs.update(updateProperties = {'pinned': !isPinned});
        window.close();
    });

}

function searchWiki(query) {
    return function() {
        query = encodeURI(query);
        chrome.tabs.create({url: "http://en.wikipedia.org/wiki/" + query});
    }
}

function searchYoutube(query) {
    return function() {
        query = encodeURI(query);
        chrome.tabs.create({url: "https://www.youtube.com/results?search_query=" + query});
    }
}

function searchImdb(query) {
    return function() {
        query = encodeURI(query);
        chrome.tabs.create({url: "http://www.imdb.com/find?s=all&q=" + query});
    }
}

function searchDictionary(query) {
    return function() {
        query = encodeURI(query);
        chrome.tabs.create({url: "http://dictionary.reference.com/browse/" + query});
    }
}

function triggerSearch(queryTriggerString) {
    return function() {
        document.getElementById("command").value = queryTriggerString + " ";
    }
}

function switchToTab(tabId) {
    return function () {
        chrome.tabs.update(tabId, {'active': true});
        window.close();
    };
}

function toggleMute(){
    var isMuted;
    chrome.tabs.query(queryInfo = {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(currentTab){
        isMuted = currentTab[0].mutedInfo.muted;
        chrome.tabs.update(updateProperties = {'muted': !isMuted});
        window.close();
    });
}

function duplicateTab(){
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTab) {
        currentTab = currentTab[0];
        chrome.tabs.duplicate(currentTab.id);
    });
}

function closeOtherTabs(){
    chrome.tabs.query({'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (otherTabs) {
        var otherTabIds = [];
        for (tab of otherTabs) {
            otherTabIds.push(tab.id);
        }
        chrome.tabs.remove(otherTabIds);
        window.close();
    });
}

function closeTabsToRight(){
    chrome.tabs.query({'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (otherTabs) {
        chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTab) {
            currentTab = currentTab[0];
            var otherTabIds = [];
            for (tab of otherTabs) {
                if (tab.index > currentTab.index){
                    otherTabIds.push(tab.id);
                }
            }
            chrome.tabs.remove(otherTabIds);
            window.close();
        });
    });
}

function closeTabsToLeft(){
    chrome.tabs.query({'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (otherTabs) {
        chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTab) {
            currentTab = currentTab[0];
            var otherTabIds = [];
            for (tab of otherTabs) {
                if (tab.index < currentTab.index){
                    otherTabIds.push(tab.id);
                }
            }
            chrome.tabs.remove(otherTabIds);
            window.close();
        });
    });
}

function moveTabToStart(){
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTab) {
      currentTab = currentTab[0];
      chrome.tabs.move(currentTab.id, { index: 0 });
      window.close();
  });
}

function moveTabToEnd(){
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTab) {
      currentTab = currentTab[0];
      chrome.tabs.move(currentTab.id, { index: -1 });
      window.close();
  });
}

function moveTabLeft(){
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTab) {
      currentTab = currentTab[0];
      chrome.tabs.move(currentTab.id, { index: currentTab.index - 1 });
      window.close();
  });
}

function moveTabRight(){
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTab) {
      currentTab = currentTab[0];
      chrome.tabs.move(currentTab.id, { index: currentTab.index + 1 });
      window.close();
  });
}

var defaultSugestions = [
    {
        "text": "New Tab",
        "action": openNewTab
    },
    {
        "text": "New Window",
        "action": openNewWindow
    },
    {
        "text": "Show History",
        "action": openHistory
    },
    {
        "text": "Show Downloads",
        "action": openDownloads
    },
    {
        "text": "Show Extensions",
        "action": openExtensions
    },
    {
        "text": "Show Bookmarks",
        "action": openBookmarks
    },
    {
        "text": "Show Settings",
        "action": openSettings
    },
    {
        "text": "Close Current Tab",
        "action": closeCurrentTab
    },
    {
        "text": "Reload Tab",
        "action": reloadTab
    },
    {
        "text": "Reload All Tabs",
        "action": reloadAllTabs
    },
    {
        "text": "Clear Cache and Reload Tab",
        "action": reloadWithoutCache
    },
    {
        "text": "Toggle Pin",
        "action": togglePin
    },
    {
        "text": "Duplicate Tab",
        "action": duplicateTab
    },
    {
        "text": "New Incognito Window",
        "action": newIncognitoWindow
    },
    {
        "text": "Close Other Tabs",
        "action": closeOtherTabs
    },
    {
        "text": "Close Tabs To Right",
        "action": closeTabsToRight,
        "keyword": "right"
    },
    {
        "text": "Close Tabs To Left",
        "action": closeTabsToLeft,
        "keyword": "left"
    },
    {
        "text": "Mute/Unmute Tab",
        "action": toggleMute
    },
    {
        "text": "Define in Dictionary.com",
        "action": triggerSearch("def")
    },
    {
        "text": "Search YouTube",
        "action": triggerSearch("yt")
    },
    {
        "text": "Search Wikipedia",
        "action": triggerSearch("wiki")
    },
    {
        "text": "Search IMDB",
        "action": triggerSearch("imdb")
    },
    {
        "text": "Move Tab To Start",
        "action": moveTabToStart,
        "keyword": "move start"
    },
    {
        "text": "Move Tab To End",
        "action": moveTabToEnd,
        "keyword": 'move end'
    },
    {
        "text": "Move Tab Left",
        "action": moveTabLeft,
        "keyword": 'move left'
    },
    {
        "text": "Move Tab Right",
        "action": moveTabRight,
        "keyword": 'move right'
    },
    {
        "text": "Reopen Closed Tab",
        "action": reopenClosedTab,
        "keyword": 'reopen'
    },
    {
        "text": "Deattach Tab (Move to New Window)",
        "action": moveTabToNewWindow,
        "keyword": 'move new window deattach'
     },
     {
        "text": "Reattach Tab (Move Tab to Previous Window)",
         "action": moveTabToPrevWindow,
        "keyword": 'move Previous window reattach'
     }
];
