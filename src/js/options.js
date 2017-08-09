async function addCommand(e){
    var text = document.getElementById('addCommandName').value;
    var action = document.getElementById('addCommandCode').innerHTML;
    const items = await chromePromise.storage.local.get('userCommandJSON');
    var existingUserCommands = items.userCommandJSON || [];
    const commandJson = (
`{
  text: ${JSON.stringify(text)},
  action: ${action.replace(/\n/g, '\n\t')}
}`
    );
    try {
      eval(`(${commandJson})`)
    } catch (e) {
      document.getElementById('commandError').innerHTML = `${e.message}\n[Open DevTools for stacktrace]`;
      throw e;
    }
    existingUserCommands.push(commandJson);
    await chromePromise.storage.local.set({'userCommandJSON': existingUserCommands});
    location.reload();
}

async function deleteCommand(e){
    var index = e.srcElement.name;
    console.log(index);
    const items = await chromePromise.storage.local.get('userCommandJSON');
    const {userCommandJSON} = items;
    userCommandJSON.splice(index, 1);
    await chromePromise.storage.local.set({userCommandJSON});
    location.reload();
}

async function initSettings(){
  await initEnabledActions();
  await initCustomCommands();
}

async function initEnabledActions(){
  let {disabledActions} = await chromePromise.storage.local.get('disabledActions');
  disabledActions = disabledActions || {};
  var container = document.getElementById('enabledActions');
  defaultSugestions.forEach(function({text}){
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.checked = !disabledActions[text];
    checkbox.addEventListener('change', async function(e){
      disabledActions[text] = !checkbox.checked;
      await chromePromise.storage.local.set({ disabledActions });
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(text));
    label.appendChild(document.createElement('br'));
    container.appendChild(label);

  });
}

async function initCustomCommands(){
    var addCommandSubmit = document.getElementById('addCommandSubmit');
    addCommandSubmit.onclick = addCommand;
    const items = await chromePromise.storage.local.get('userCommandJSON');
    existingUserCommands = items.userCommandJSON || [];
    var existingCommandDiv = document.getElementById('existingActions');
    existingCommandDiv.innerHTML = '';
    for(var i = 0; i < existingUserCommands.length; i++){
        userCommand = existingUserCommands[i];
        commandDiv = document.createElement('div');
        commandDiv.className = 'userCommand';
        commandDiv.innerHTML = `<h3> Command #${i}</h3>`;
        commandDivCode = document.createElement('code');
        commandDivCodePre = document.createElement('pre')
        commandDivCodePre.className='prettyprint lang-js';
        commandDivCodePre.innerHTML = userCommand;
        commandDivCode.appendChild(commandDivCodePre);
        commandDiv.appendChild(commandDivCode);
        delButton = document.createElement('button');
        delButton.name = i;
        delButton.innerHTML = 'Delete Command';
        delButton.onclick = deleteCommand;
        commandDiv.appendChild(delButton);
        existingCommandDiv.appendChild(commandDiv);
      }
    PR.prettyPrint();
}

document.addEventListener('DOMContentLoaded', initSettings, false);
