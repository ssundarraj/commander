var highlightedSuggestion;
var suggestionList;
const BOLD_START = '___start-bold___';
const BOLD_END = '___end-bold___';
const BOLD_START_REGEX = new RegExp(BOLD_START, 'g');
const BOLD_END_REGEX = new RegExp(BOLD_END, 'g');

function populateSuggestionList() {
    chrome.tabs.query({'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (allTabs){
        suggestionList = defaultSugestions;

        for(tab of allTabs){
            var tabAction = {
                "text": "Switch to: " + tab.title,
                "action": switchToTab(tab.id)
            };
            suggestionList.push(tabAction);
        }

        chrome.storage.local.get('userCommandJSON', function(items){
            var existingUserCommands = items.userCommandJSON;
            if(existingUserCommands != undefined && existingUserCommands != []){
                for(userCommand of existingUserCommands){
                    userCommand = eval('(' + userCommand + ')');
                    suggestionList.push(userCommand);
                }
            }
        });
        populateSuggestionsBox(suggestionList);
    });
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
         .replace(BOLD_START_REGEX, '<b>')
         .replace(BOLD_END_REGEX, '</b>');
}

function processSearchQuery(queryList, searchDomain, searchFunction){
    var searchQuery = "";
    var queryListLength = queryList.length;
    for(var i = 1; i < queryList.length; i++) {
        searchQuery += queryList[i];
        if(queryListLength > 2) searchQuery += " ";
    }

    var tabAction = {
        "searchDomain": searchDomain,
        "text": searchDomain + " Search Query: " + searchQuery,
        "action" : searchFunction(searchQuery)
    };

    // For removing previous search queries
    for(var i = 0; i < suggestionList.length; i++) {
        if(suggestionList[i].searchDomain == searchDomain) {
            suggestionList.splice(i, 1);
        }
    }
    suggestionList.unshift(tabAction);
}

function populateSearchSuggestions(query) {
    var queryList = query.split(" ");
    if(queryList[0].toLowerCase() == "wiki" || queryList[0].toLowerCase() == "wikipedia") {
        processSearchQuery(queryList, "Wikipedia", searchWiki);
    }
    else if(queryList[0].toLowerCase() == "youtube" || queryList[0].toLowerCase() == "yt") {
        processSearchQuery(queryList, "YouTube", searchYoutube);
    }
    else if(queryList[0].toLowerCase() == "imdb") {
        processSearchQuery(queryList, "IMDB", searchImdb);
    }
    else if(queryList[0].toLowerCase() == "def" || queryList[0].toLowerCase() == "define" || queryList[0].toLowerCase() == "dictionary") {
        processSearchQuery(queryList, "Define in Dictionary.com", searchDictionary);
    }
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

function handleMouseover(e){
    changeHighlighted(e.srcElement);
}

function populateSuggestionsBox(suggestionList){
    var suggestionDiv = document.getElementById('suggestions');
    suggestionDiv.innerHTML = "";

    for (suggestion of suggestionList) {
        var suggestionTag = document.createElement("li");
        suggestionTag.className = "suggestion";
        suggestionTag.innerHTML = escapeHtml(suggestion.text);
        suggestionTag.onclick = suggestion.action;
        suggestionTag.onmouseover = handleMouseover;
        suggestionDiv.appendChild(suggestionTag);
    }
    highlightedSuggestion = document.getElementsByClassName("suggestion")[0];
    if (highlightedSuggestion){
        highlightedSuggestion.id = "highlighted";
    }
}

function fuzzySearch(){
    var options = {
        includeMatches: true,
        shouldSort: true,
        keys: ['text', 'keyword'],
    }
    var searchString = document.getElementById("command").value;
    if (searchString == ""){
        populateSuggestionList();
    }
    else{
        populateSearchSuggestions(searchString);
        var fuzz = new Fuse(suggestionList, options);
        var fuzzResult = fuzz.search(searchString);
        const highlightedResult = fuzzResult.map(({ item, matches }) => {
            const highlightedItem = Object.assign({}, item);
            matches.forEach(({ key, indices }) => {
                original = item[key]
                highlighted = '';
                let from = 0;
                indices.forEach(([start, end]) => {
                    highlighted += original.slice(from, start) +
                        BOLD_START +
                        original.slice(start, end + 1) +
                        BOLD_END;
                    from = end + 1;
                });
                highlighted += original.slice(from);
                highlightedItem[key] = highlighted;
            });
            return highlightedItem;
        });
        populateSuggestionsBox(highlightedResult);
        delete fuzz;
    }
}

function fixChromeBug() {
  // 20% of the time the popup animation breaks and it stays tiny
  // this seems to fix it
  // looks like an ancient issue...
  // https://productforums.google.com/forum/#!topic/chrome/4ofdh8EYL6Y
  document.documentElement.style.width = document.body.offsetWidth - 1;
  setTimeout(() => {
    document.documentElement.style.width = document.body.offsetWidth;
  }, 100);
}

function initCommander() {
    fixChromeBug();
    populateSuggestionList();
    document.getElementById("command").oninput = fuzzySearch;
    document.onkeydown = handleKeydown;
}

document.addEventListener('DOMContentLoaded', initCommander, false);
