function addCommand(e){
    var text = document.getElementById("addCommandName").value;
    var action = document.getElementById("addCommandCode").innerHTML;
    const items = chromeP.storage.local.get('userCommandJSON');
    var existingUserCommands = items.userCommandJSON;
    if(existingUserCommands == undefined){
        existingUserCommands = [];
    }
    const commandJson = JSON.stringify({ text, action });
    existingUserCommands.push(commandJson);
    chrome.storage.local.set({'userCommandJSON': existingUserCommands});
    location.reload();
}

async function deleteCommand(e){
    var index = e.srcElement.name;
    console.log(index);
    const items = await chromeP.storage.local.get('userCommandJSON');
    var existingUserCommands = items.userCommandJSON;
    existingUserCommands.splice(index, 1);
    chrome.storage.local.set({'userCommandJSON': existingUserCommands});
    location.reload();
}

async function initSettings(){
  await initEnabledActions();
  await initCustomCommands();
}

async function initEnabledActions(){
  let { disabledActions } = await chromeP.storage.local.get('disabledActions');
  disabledActions = disabledActions || {};
  var container = document.getElementById('enabledActions');
  defaultSugestions.forEach(({ text }) => {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.checked = !disabledActions[text];
    checkbox.addEventListener('change', (e) => {
      disabledActions[text] = !checkbox.checked;
      chromeP.storage.local.set({ disabledActions });
    });
    container.appendChild(checkbox);
    container.appendChild(document.createTextNode(text));
    container.appendChild(document.createElement('br'));

  });
  // <input type="checkbox" id="myCheck">
}
async function initCustomCommands(){
    var addCommandSubmit = document.getElementById('addCommandSubmit');
    addCommandSubmit.onclick = addCommand;
    const items = await chromeP.storage.local.get('userCommandJSON');
    existingUserCommands = items.userCommandJSON;
    if(existingUserCommands){
        var existingCommandDiv = document.getElementById("existingActions");
        existingCommandDiv.innerHTML = "";
        for(var i = 0; i < existingUserCommands.length; i++){
            userCommand = existingUserCommands[i];
            commandDiv = document.createElement("div");
            commandDiv.className = "userCommand";
            commandDiv.innerHTML = "<h3> Command #" + i + "</h3>";
            commandDivCode = document.createElement("code");
            commandDivCodePre = document.createElement("pre")
            commandDivCodePre.className="prettyprint lang-js";
            const { text, action } = JSON.parse(userCommand);
            commandDivCodePre.innerHTML =
`/* ${text} */

${action}
`;
            commandDivCode.appendChild(commandDivCodePre);
            commandDiv.appendChild(commandDivCode);
            delButton = document.createElement("button");
            delButton.name = i;
            delButton.innerHTML = "Delete Command";
            delButton.onclick = deleteCommand;
            commandDiv.appendChild(delButton);
            existingCommandDiv.appendChild(commandDiv);
        }
    }
    PR.prettyPrint();
}

document.addEventListener('DOMContentLoaded', initSettings, false);
