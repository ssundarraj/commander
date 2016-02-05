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
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTabIds) {
        var currentTabArray = [], currentTabId;
        for (currentTabId of currentTabIds) {
            currentTabArray.push(currentTabId.id);
        }
        chrome.tabs.remove(currentTabArray);
    });
}

function reloadTab() {
    chrome.tabs.reload();
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
}

function newIncognitoWindow() {
    chrome.windows.create({'incognito': true});
}

function togglePin(){
    var isPinned;
    chrome.tabs.query(queryInfo = {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(currentTab){
        isPinned = currentTab[0].pinned;
        console.log(!isPinned);
        chrome.tabs.update(updateProperties = {'pinned': !isPinned});
    });

}

function switchToTab(tabId) {
    return function () {
        chrome.tabs.update(tabId, {'active': true});
    };
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
        "text": "New Incognito Window",
        "action": newIncognitoWindow
    }
];
