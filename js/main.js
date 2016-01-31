var highlightedSuggestion;

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

document.onkeydown = function(e){
    var keynum;
    if(window.event){ // IE                 
        keynum = e.keyCode;
    }
    else if(e.which){ // Netscape/Firefox/Opera                  
        keynum = e.which;
    }
    if (keynum == 40){
        //down
        highlightedSuggestion.id = "";
        highlightedSuggestion = highlightedSuggestion.nextSibling;
        if(!highlightedSuggestion){
            var allSuggestions = document.getElementsByClassName("suggestion");
            highlightedSuggestion = allSuggestions[allSuggestions.length - 1]
        }
        highlightedSuggestion.id = "highlighted";
    }
    else if (keynum == 38){
        // slice(-1)[0] 
        highlightedSuggestion.id = "";
        highlightedSuggestion = highlightedSuggestion.previousSibling;
        if(!highlightedSuggestion){
            highlightedSuggestion = document.getElementsByClassName("suggestion")[0];
        }
        highlightedSuggestion.id = "highlighted";
    }
    else if (keynum == 13){
        highlightedSuggestion.click();
    }
    // console.log(keynum);
}

function populateDefaultSuggestions() {
    for (suggestion of defaultSugestions) {
        var suggestionTag = document.createElement("li");
        suggestionTag.className = "suggestion";
        suggestionTag.innerHTML = suggestion.text;
        suggestionTag.onclick = suggestion.action;
        document.getElementById('suggestions').appendChild(suggestionTag);
    }
    highlightedSuggestion = document.getElementsByClassName("suggestion")[0];
    highlightedSuggestion.id = "highlighted";
}
populateDefaultSuggestions();
