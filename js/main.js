document.addEventListener('DOMContentLoaded', populateDefaultSuggestions, false);
function openNewTab(){
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
        document.getElementById('suggestions').appendChild(suggestionTag);
    }
}
console.log(defaultSugestions);
populateDefaultSuggestions();