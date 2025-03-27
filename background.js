import * as time from "./time"

// Function to update the badge with the current time
function updateBadge() {
    let timeString = time.getCurrentTimeString();
    chrome.action.setBadgeText({ text: timeString });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
}

// Initial update and set interval to refresh every minute
updateBadge();
setInterval(updateBadge, 60000);
