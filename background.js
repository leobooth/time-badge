function getCurrentTimeString() {
    let now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// update the badge with the current time
// https://developer.chrome.com/docs/extensions/reference/api/action
function updateBadge() {
    let timeString = getCurrentTimeString();
    chrome.action.setBadgeText({ text: timeString });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
}

// Initial update and set interval to refresh every second
updateBadge();
let badgeInterval = setInterval(updateBadge, 1000);