function getCurrentTimeString(time12Or24) {
    let now = new Date();
    let hours = "";
    let minutes = "";


    if (time12Or24 === 12) {
        hours = (now.getHours() % 12).toString();
    } else {
        hours = now.getHours().toString();
    }

    hours = hours.padStart(2, '0');
    minutes = now.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

// TODO: set time12or24 based on click of badge (toggle between 12 or 24)

// update the badge with the current time
// https://developer.chrome.com/docs/extensions/reference/api/action
function updateBadge() {
    let timeString = getCurrentTimeString(12);
    chrome.action.setBadgeText({ text: timeString });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
}

// Initial update and set interval to refresh every second
updateBadge();
let badgeInterval = setInterval(updateBadge, 1000);