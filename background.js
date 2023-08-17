chrome.commands.onCommand.addListener((command) => {
    console.log("yay")
    console.log(`Command: ${command}`);
    console.log("sending to content")

    if (command === "hide_images"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {message: "hide_images"});  
        });
    }
    else if (command === "show_images"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {message: "show_images"});  
        });
    }
});