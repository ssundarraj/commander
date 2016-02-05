var highlightedSuggestion;
var suggestionList;

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

function handleMouseover(e){
    changeHighlighted(e.srcElement);
}

function populateSuggestionsBox(suggestionList){
    document.getElementById('suggestions').innerHTML = "";
    var suggestionDiv = document.getElementById('suggestions');
    for (suggestion of suggestionList) {
        var suggestionTag = document.createElement("li");
        suggestionTag.className = "suggestion";
        suggestionTag.innerHTML = suggestion.text;
        suggestionTag.onclick = suggestion.action;
        suggestionTag.onmouseover = handleMouseover;
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
