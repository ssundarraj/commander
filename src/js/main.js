let highlightedSuggestion;
const BOLD_START = '∑';
const BOLD_END = 'π';
const BOLD_START_REGEX = new RegExp(BOLD_START, 'g');
const BOLD_END_REGEX = new RegExp(BOLD_END, 'g');

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

async function getEnabledSugestions() {
  let { disabledActions } = await chromeP.storage.local.get('disabledActions');
  disabledActions = disabledActions || {};
  return defaultSugestions.filter(({ text }) => !disabledActions[text]);
}

async function getSwitchTabSugestions() {
    const allTabs = await chromeP.tabs.query({'windowId': chromeP.windows.WINDOW_ID_CURRENT});
    return allTabs.map(tab => ({
      text: `Switch to: ${tab.title}`,
      action: switchToTab(tab.id),
    }));
}

async function getUserCommandJSONSuggestions() {
    const items = await chromeP.storage.local.get('userCommandJSON');
    var existingUserCommands = items.userCommandJSON || [];
    return existingUserCommands.map(userCommand => eval(`(${userCommand})`));
}

async function getSearchSuggestions() {
    const searchString = document.getElementById('command').value;
    const queryList = searchString.split(' ');
    const domain = queryList[0].toLowerCase();
    const searchQuery = queryList.slice(1).join(' ');
    const q = encodeURI(searchQuery);

    let searchDomain;
    let url;

    const enabledSugestions = await getEnabledSugestions();
    const match = enabledSugestions.find(function({triggers}){
      return triggers && triggers.includes(domain);
    });
    if (match) {
      return [{
        text: `${match.text}: ${searchQuery}`,
        action: async function() {
          await chromeP.tabs.create({url: match.queryToUrl(q)});
        },
      }];
    }
    return [];
}

async function getAllSuggestions() {
  return [].concat(
    await getEnabledSugestions(),
    await getSwitchTabSugestions(),
    await getUserCommandJSONSuggestions(),
  );
}


function scrollTo(highlightedSuggestion){
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
  switch (e.which){
    case (40):{// down
      const allSuggestions = document.getElementsByClassName('suggestion');
      const newSuggestion = highlightedSuggestion.nextSibling ||
        allSuggestions[allSuggestions.length - 1];
      changeHighlighted(newSuggestion);
      scrollTo(newSuggestion);
      return false;
    }
    case (38):{ // up
      e.preventDefault();
      const newSuggestion =
        highlightedSuggestion.previousSibling ||
        document.getElementsByClassName('suggestion')[0];
      changeHighlighted(newSuggestion);
      scrollTo(newSuggestion);
      return false;
    }
    case (13):{ // enter
      highlightedSuggestion.click();
    }
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

async function fuzzySearch(){
    var searchString = document.getElementById('command').value;
    const allSuggestions = await getAllSuggestions();

    const options = {
      pre: BOLD_START, // before matched char
      post: BOLD_END, // after matched char
      sep: 'Ω', // between different fields
      extract: s => `${s.text}${options.sep}${s.keyword || ''}`,
    };
    const searchResults = fuzzy
      .filter(searchString, allSuggestions, options)
      .map(el => {
        // fuzzy wraps every char with <pre> and <post> so first remove contiguous ones
        const delimited = el.string.replace(new RegExp(options.post + options.pre, 'g'), '');
        const [text] = delimited.split(options.sep);
        return Object.assign({}, el.original, { text });
      });

    const withSearches = (await getSearchSuggestions()).concat(searchResults);
    populateSuggestionsBox(withSearches);
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

async function initCommander() {
    fixChromeBug();
    const withSearches = [].concat(
      await getSearchSuggestions(),
      await getAllSuggestions(),
    );
    await populateSuggestionsBox(withSearches);
    document.getElementById('command').oninput = fuzzySearch;
    document.onkeydown = handleKeydown;
}

document.addEventListener('DOMContentLoaded', initCommander, false);
