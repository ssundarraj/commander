document.addEventListener('DOMContentLoaded', populateDefaultSuggestions, false);

function openNewTab() {
    chrome.tabs.create({});
}

function openNewWindow() {
    chrome.windows.create({});
}

function openHistory() {
    chrome.tabs.create({url:"chrome://history"});
}

function openDownloads() {
    chrome.tabs.create({url:"chrome://downloads"});
}

function openExtensions() {
    chrome.tabs.create({url:"chrome://extensions"});
}

function openSettings() {
    chrome.tabs.create({url:"chrome://settings"});
}

function closeCurrentTab() {
    chrome.tabs.query({'active': true, 'windowId':chrome.windows.WINDOW_ID_CURRENT}, function (currentTabIds) {
        var currentTabArray = [];
        for (currentTabId of currentTabIds) {
            currentTabArray.push(currentTabId.id);
        }
        chrome.tabs.remove(currentTabArray);
    });
}

function reloadTab() {
    chrome.tabs.reload();
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
    }
];

function populateDefaultSuggestions() {
    for (suggestion of defaultSugestions) {
        console.log(suggestion.text);
        var suggestionTag = document.createElement("li");
        suggestionTag.innerHTML = suggestion.text;
        suggestionTag.onclick = suggestion.action;
        document.getElementById('suggestions').appendChild(suggestionTag);
    }
}
console.log(defaultSugestions);
populateDefaultSuggestions();