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

function openExtensions(){
    chrome.tabs.create({url: "chrome://extensions"});
}

function openSettings(){
    chrome.tabs.create({url: "chrome://settings"});
}

function closeCurrentTab(){
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (currentTabIds) {
        var currentTabArray = [], currentTabId;
        for (currentTabId of currentTabIds) {
            currentTabArray.push(currentTabId.id);
        }
        chrome.tabs.remove(currentTabArray);
    });
}

function reloadTab(){
    chrome.tabs.reload();
}

function newIncognitoWindow(){
    chrome.windows.create({'incognito': true});
}

function switchToTab(tabId){
    return function(){
        chrome.tabs.update(tabId, {'active': true});
    }
}

function populateSuggestionList(){
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
    chrome.tabs.query({}, function(allTabs){
        console.log(allTabs);
        for(tab of allTabs){
            console.log(tab);
            var tabAction = {
                "text": "Switch to: " + tab.title,
                "action": switchToTab(tab.id)
            };
            defaultSugestions.push(tabAction);
        }
        suggestionList = defaultSugestions;
        populateSuggestions(suggestionList);
    });
}

document.onkeydown = function(e){
    var keynum;
    if(window.event){ // IE                 
        keynum = e.keyCode;
    }
    else if(e.which){ // Netscape/Firefox/Opera                  
        keynum = e.which;
    }
    if (keynum == 40){
        // down
        highlightedSuggestion.id = "";
        highlightedSuggestion = highlightedSuggestion.nextSibling;
        if(!highlightedSuggestion){
            var allSuggestions = document.getElementsByClassName("suggestion");
            highlightedSuggestion = allSuggestions[allSuggestions.length - 1]
        }
        highlightedSuggestion.id = "highlighted";
        highlightedSuggestion.scrollIntoView(alignToTop=true);
    }
    else if (keynum == 38){
        // up
        highlightedSuggestion.id = "";
        highlightedSuggestion = highlightedSuggestion.previousSibling;
        if(!highlightedSuggestion){
            highlightedSuggestion = document.getElementsByClassName("suggestion")[0];
        }
        highlightedSuggestion.id = "highlighted";
        highlightedSuggestion.scrollIntoView(alignToTop=true);
    }
    else if (keynum == 13){
        // enter
        highlightedSuggestion.click();
    }
}

function populateSuggestions(suggestionList){
    document.getElementById('suggestions').innerHTML = "";
    for (suggestion of suggestionList) {
        var suggestionTag = document.createElement("li");
        suggestionTag.className = "suggestion";
        suggestionTag.innerHTML = suggestion.text;
        suggestionTag.onclick = suggestion.action;
        document.getElementById('suggestions').appendChild(suggestionTag);
    }
    highlightedSuggestion = document.getElementsByClassName("suggestion")[0];
    highlightedSuggestion.id = "highlighted";
}

function initCommander() {
    populateSuggestionList();

    options = {
        keys: ['text']
    }

    document.getElementById("command").oninput = function(){
        var searchString = document.getElementById("command").value;
        if(searchString == ""){
            populateSuggestionList();
        }
        else{
            var f = new Fuse(suggestionList, options);
            var fuzzResult = f.search(searchString);
            populateSuggestions(fuzzResult);
        }
    }
}

document.addEventListener('DOMContentLoaded', initCommander, false);

