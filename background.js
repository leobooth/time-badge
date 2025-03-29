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
        const hours24 = now.getHours();

        // could be 12:00 or 00:00
        if (hours24 % 12 === 0) {
            hours = "12"
        } else {
            hours = (hours24 % 12).toString();
        }

        ampm = hours24 < 12 ? "am" : "pm";
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
    chrome.action.setBadgeText({ text: badgeTime });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
}

function updateTitle() {
    let titleTime = getCurrentTimeString(false, true);
    chrome.action.setTitle({title: titleTime})
}

function updateTime() {
    updateBadge();
    updateTitle();
}

// Initial update and set interval to refresh every second
updateTime()
let badgeInterval = setInterval(updateTime, 1000);