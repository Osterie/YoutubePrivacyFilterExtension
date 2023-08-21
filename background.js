chrome.commands.onCommand.addListener((command) => {
    if (command === "hide_youtube_videos"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {message: "hide_youtube_videos"});  
        });
    }
    else if (command === "show_youtube_videos"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {message: "show_youtube_videos"});  
        });
    }
});