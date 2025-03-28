function getCurrentTimeString(is24Hour, isAMPMVisible) {
    let now = new Date();
    let hours = "";
    let minutes = "";
    let ampm = "";
    let currentTimeString = "";

    if (is24Hour) {
        hours = now.getHours().toString();
        ampm = "";
    } else {
        hours = (now.getHours() % 12).toString();
        ampm = now.getHours() < 12 ? "am" : "pm";
    }

    hours = hours.padStart(2, '0');
    minutes = now.getMinutes().toString().padStart(2, '0');

    if(isAMPMVisible) {
        currentTimeString = `${hours}:${minutes}${ampm}`;
    } else {
        currentTimeString = `${hours}:${minutes}`;
    }

    return currentTimeString;
}

// TODO: toggle is24Hour based on click of extension icon/badge

// update the badge with the current time
// https://developer.chrome.com/docs/extensions/reference/api/action
function updateBadge() {
    let badgeTime = getCurrentTimeString(true, false);
    let titleTime = getCurrentTimeString(false, true);
    chrome.action.setBadgeText({ text: badgeTime });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
    chrome.action.setTitle({title: titleTime})
}

// Initial update and set interval to refresh every second
updateBadge();
let badgeInterval = setInterval(updateBadge, 1000);