var highlightedSuggestion;
var suggestionList;

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

function newIncognitoWindow() {
    chrome.windows.create({'incognito': true});
}

function switchToTab(tabId) {
    return function () {
        chrome.tabs.update(tabId, {'active': true});
    };
}

function populateSuggestionList() {
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
        },
        {
            "text": "New Incognito Window",
            "action": newIncognitoWindow
        }
    ];
    chrome.tabs.query({'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (allTabs){
        suggestionList = defaultSugestions;
        for(tab of allTabs){
            var tabAction = {
                "text": "Switch to: " + tab.title,
                "action": switchToTab(tab.id)
            };
            suggestionList.push(tabAction);
        }
        populateSuggestionsBox(suggestionList);
    });
}

function reScroll(){
    try{
        scrollElement = highlightedSuggestion.previousSibling.previousSibling;
        scrollElement.scrollIntoView(alignToTop=true);
    }
    catch(err){}
}

function changeHighlighted(newHighlighted){
    highlightedSuggestion.id = "";
    highlightedSuggestion = newHighlighted;
    highlightedSuggestion.id = "highlighted";
}

function handleKeydown(e){
    var keynum = e.which;
    if (keynum == 40){
        // down
        e.preventDefault();
        var newSuggestion = highlightedSuggestion.nextSibling;
        if (!newSuggestion){
            var allSuggestions = document.getElementsByClassName("suggestion");
            newSuggestion = allSuggestions[allSuggestions.length - 1]
        }
        changeHighlighted(newSuggestion);
        reScroll();
        return false;
    }
    else if (keynum == 38){
        // up
        e.preventDefault();
        newSuggestion = highlightedSuggestion.previousSibling;
        if (!newSuggestion){
            newSuggestion = document.getElementsByClassName("suggestion")[0];
        }
        changeHighlighted(newSuggestion);
        reScroll();
        return false;
    }
    else if (keynum == 13){
        // enter
        highlightedSuggestion.click();
    }
}

function populateSuggestionsBox(suggestionList){
    document.getElementById('suggestions').innerHTML = "";
    var suggestionDiv = document.getElementById('suggestions');
    for (suggestion of suggestionList) {
        var suggestionTag = document.createElement("li");
        suggestionTag.className = "suggestion";
        suggestionTag.innerHTML = suggestion.text;
        suggestionTag.onclick = suggestion.action;
        suggestionDiv.appendChild(suggestionTag);
    }
    highlightedSuggestion = document.getElementsByClassName("suggestion")[0];
    highlightedSuggestion.id = "highlighted";
}

function fuzzySearch(){
    var options = {
        keys: ['text']
    }
    var searchString = document.getElementById("command").value;
    if (searchString == ""){
        populateSuggestionList();
    }
    else{
        var fuzz = new Fuse(suggestionList, options);
        var fuzzResult = fuzz.search(searchString);
        populateSuggestionsBox(fuzzResult);
        delete fuzz;
    }
}

function initCommander() {
    populateSuggestionList();
    document.getElementById("command").oninput = fuzzySearch;
    document.onkeydown = handleKeydown;
}

document.addEventListener('DOMContentLoaded', initCommander, false);
