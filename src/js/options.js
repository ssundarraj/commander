function addCommand(e){
    var commandJson = document.forms.addCommandForm.addCommandContainer.addCommandJson.value
    chrome.storage.local.get('userCommandJSON', function(items){
        var existingUserCommands = items.userCommandJSON;
        if(existingUserCommands == undefined){
            existingUserCommands = [];
        }
        existingUserCommands.push(commandJson);
        console.log(existingUserCommands);
        chrome.storage.local.set({'userCommandJSON': existingUserCommands});
    });
    location.reload();
}

function deleteCommand(e){
    var index = e.srcElement.name;
    console.log(index);
    chrome.storage.local.get('userCommandJSON', function(items){
        var existingUserCommands = items.userCommandJSON;
        existingUserCommands.splice(index, 1);
        chrome.storage.local.set({'userCommandJSON': existingUserCommands});
        location.reload();
    });
}

function initSettings(){
    var addCommandSubmit = document.getElementById('addCommandSubmit');
    addCommandSubmit.onclick = addCommand;
    chrome.storage.local.get('userCommandJSON', function(items){
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
                commandDivCodePre.innerHTML = userCommand;
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
    });
}

document.addEventListener('DOMContentLoaded', initSettings, false);
 