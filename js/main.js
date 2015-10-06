document.addEventListener('DOMContentLoaded', populateDefaultSuggestions, false);
function openNewTab(){
    chrome.tabs.create({});
    console.log("TEST");
}
var defaultSugestions = [
    {
        "text": "New Tab",
        "action": openNewTab
    }
];
function populateDefaultSuggestions(){
    for(suggestion of defaultSugestions){
        console.log(suggestion.text);
        var suggestionTag = document.createElement("li");
        suggestionTag.innerHTML = suggestion.text;
        suggestionTag.onclick = suggestion.action;
        document.getElementById('suggestions').appendChild(suggestionTag);
    }
}
console.log(defaultSugestions);
populateDefaultSuggestions();