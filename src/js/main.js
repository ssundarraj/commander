var highlightedSuggestion;
var suggestionList;
const BOLD_START = '___start-bold___';
const BOLD_END = '___end-bold___';
const BOLD_START_REGEX = new RegExp(BOLD_START, 'g');
const BOLD_END_REGEX = new RegExp(BOLD_END, 'g');

async function getEnabluedSugestions() {
  let { disabledActions } = await chromeP.storage.local.get('disabledActions');
  disabledActions = disabledActions || {};
  return defaultSugestions.filter(({ text }) => !disabledActions[text]);
}

async function populateSuggestionList() {
    const allTabs = await chromeP.tabs.query({'windowId': chromeP.windows.WINDOW_ID_CURRENT});
    suggestionList = await getEnabluedSugestions();

    for(tab of allTabs){
        var tabAction = {
            text: `Switch to: ${tab.title}`,
            action: switchToTab(tab.id)
        };
        suggestionList.push(tabAction);
    }

    const items = await chromeP.storage.local.get('userCommandJSON');
    var existingUserCommands = items.userCommandJSON || [];
    for(userCommand of existingUserCommands){
        suggestionList.push(eval(`(${userCommand})`));
    }
    populateSuggestionsBox(suggestionList);
}

function escapeHtml(unsafe) {
    return unsafe
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;')
       .replace(BOLD_START_REGEX, '<b>')
       .replace(BOLD_END_REGEX, '</b>');
}

function populateSearchSuggestions(query) {
    const queryList = query.split(' ');
    const domain = queryList[0].toLowerCase();
    const searchQuery = queryList.slice(1).join(' ');
    const q = encodeURI(searchQuery);

    let searchDomain;
    let url;
    if (['wiki', 'wikipedia'].includes(domain)) {
      url = `http://en.wikipedia.org/wiki/${q}`;
      searchDomain = 'Wikipedia';
    } else if(['yt', 'youtube'].includes(domain)) {
      url = `https://www.youtube.com/results?search_query=${q}`;
      searchDomain = 'YouTube';
    } else if (['imdb'].includes(domain)) {
      url = `http://www.imdb.com/find?s=all&q=${q}`;
      searchDomain = 'IMDB';
    } else if (['def', 'define', 'dictionary'].includes(domain)) {
      url = `http://dictionary.reference.com/browse/${q}`;
      searchDomain = 'Dictionary';
    } else {
      return;
    }
    // remove all previous domain searches
    suggestionList = suggestionList.filter(({searchDomain}) => searchDomain);
    suggestionList.unshift({
        searchDomain,
        text: `${searchDomain} Search: ${searchQuery}`,
        action: async function() {
          await chromeP.tabs.create({url});
        },
    });
}

function reScroll(){
    try{
        scrollElement = highlightedSuggestion.previousSibling.previousSibling;
        scrollElement.scrollIntoView(/*alignToTop=*/true);
    }
    catch(err){}
}

function changeHighlighted(newHighlighted){
    highlightedSuggestion.id = '';
    highlightedSuggestion = newHighlighted;
    highlightedSuggestion.id = 'highlighted';
}

function handleKeydown(e){
    var keynum = e.which;
    if (keynum == 40){
        // down
        e.preventDefault();
        var newSuggestion = highlightedSuggestion.nextSibling;
        if (!newSuggestion){
            var allSuggestions = document.getElementsByClassName('suggestion');
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
            newSuggestion = document.getElementsByClassName('suggestion')[0];
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
    suggestionDiv.innerHTML = '';

    for (const suggestion of suggestionList) {
        var suggestionTag = document.createElement('li');
        suggestionTag.className = 'suggestion';
        suggestionTag.innerHTML = escapeHtml(suggestion.text);
        suggestionTag.onclick = async function() {
          try {
            await suggestion.action();
          } catch (e) {
            document.body.innerHTML = (
`Error executing action [${escapeHtml(suggestion.text)}]:
<pre style="color: red">
  ${escapeHtml(e.message)}
</pre>
Right click here and select [Inspect] to open DevTools in the action's context.
`
            );
            console.error(suggestion.action.toString());
            console.error(e.message);
          }
        }
        suggestionTag.onmouseover = handleMouseover;
        suggestionDiv.appendChild(suggestionTag);
    }
    highlightedSuggestion = document.getElementsByClassName('suggestion')[0];
    if (highlightedSuggestion){
        highlightedSuggestion.id = 'highlighted';
    }
}

function fuzzySearch(){
    var options = {
        includeMatches: true,
        shouldSort: true,
        keys: ['text', 'keyword'],
    }
    var searchString = document.getElementById('command').value;
    if (!searchString){
        populateSuggestionList();
    }else{
        populateSearchSuggestions(searchString);
        var fuzz = new Fuse(suggestionList, options);
        var fuzzResult = fuzz.search(searchString);
        const highlightedResult = fuzzResult.map(function({item, matches}){
            const highlightedItem = Object.assign({}, item);
            matches.forEach(function({key, indices}){
                original = item[key]
                highlighted = '';
                let from = 0;
                indices.forEach(function([start, end]){
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
  const {offsetWidth} = document.body;
  const docStyle = document.documentElement.style;
  docStyle.width = offsetWidth - 1;
  setTimeout(function(){ docStyle.width = offsetWidth; }, 100);
}

function initCommander() {
    fixChromeBug();
    populateSuggestionList();
    document.getElementById('command').oninput = fuzzySearch;
    document.onkeydown = handleKeydown;
}

document.addEventListener('DOMContentLoaded', initCommander, false);
