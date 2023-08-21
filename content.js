let intervalId

if (document.location.href.includes("youtube")){
    hide_youtube_videos()
    clearInterval(intervalId)
    intervalId = setInterval(hide_youtube_videos, 1000);
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.message === "hide_youtube_videos"){ 
        hide_youtube_videos()
        clearInterval(intervalId)
        intervalId = setInterval(hide_youtube_videos, 1000);
    }

    else if (message.message === "show_youtube_videos"){ 
        clearInterval(intervalId)
        show_youtube_videos()
    }
});




function hide_youtube_videos(){
    const images = document.querySelectorAll('img');
    images.forEach(image => {
        image.style.visibility = 'hidden';  // Set the image source to an empty string to prevent loading
    })

    const titles = document.querySelectorAll('#details');
    titles.forEach(title => {
        title.style.visibility = 'hidden';  // Set the image source to an empty string to prevent loading
    })
}

function show_youtube_videos(){
    const images = document.querySelectorAll('img');
    images.forEach(image => {
        image.style.visibility = 'visible';  // Set the image source to an empty string to prevent loading
    })

    const titles = document.querySelectorAll('#details');
    titles.forEach(title => {
        title.style.visibility = 'visible';  // Set the image source to an empty string to prevent loading
    })
}