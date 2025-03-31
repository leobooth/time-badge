let gbl_is24HourFormat = false
let gbl_isAMPMVisible = true;

function getCurrentTimeString(is24HourFormat, isAMPMVisible, displayFullLengthTime) {
    let now = new Date();
    let hours = "";
    let minutes = "";
    let ampm = "";
    let currentTimeString = "";
    let hours24 = 0;

    if (is24HourFormat) {
        hours = now.getHours().toString();
        ampm = "";

        hours = hours.padStart(2, '0');
        minutes = now.getMinutes().toString().padStart(2, '0');

        currentTimeString = `${hours}:${minutes}`;
    }

    if (!is24HourFormat) {
        hours24 = now.getHours();

        // could be 12:00 or 00:00
        if (hours24 % 12 === 0) {
            hours = "12"
        } else {
            hours = (hours24 % 12).toString();
        }

        minutes = now.getMinutes().toString().padStart(2, '0');
    }

    if(isAMPMVisible) {
        if (displayFullLengthTime) {
            ampm = hours24 < 12 ? "am" : "pm";
            currentTimeString = `${hours}:${minutes}${ampm}`;
        } else {
            // due to display space restrictions,
            // don't show 'a' or 'p' after double-digit hours
            if (hours24 % 12 < 10) {
                ampm = hours24 < 12 ? "a" : "p";
            } else {
                ampm = "";
            }
            currentTimeString = `${hours}:${minutes}${ampm}`;
        }
    }

    return currentTimeString;
}

// get user preference for 12 or 24-hour time format
async function getTimeFormatFromStorage() {
    const data = await chrome.storage.sync.get("options");
    return data.options.is24HourFormat;
}

// set user preference for 12 or 24-hour time format
async function setTimeFormatToStorage(is24HourFormat) {
    const options = {}
    options.is24HourFormat = is24HourFormat;
    chrome.storage.sync.set({options});
}

// Toggle between 12-hour and 24-hour time format when the user clicks the extension icon
//https://developer.chrome.com/docs/extensions/reference/api/storage
chrome.action.onClicked.addListener(async () => {
    let formatFromStorage = await getTimeFormatFromStorage();
    if (formatFromStorage === undefined) {
        formatFromStorage = gbl_is24HourFormat;
    }

    gbl_is24HourFormat = !formatFromStorage;
    gbl_isAMPMVisible = !gbl_isAMPMVisible;
    await setTimeFormatToStorage(gbl_is24HourFormat);
    updateTime();
});

// update the badge with the current time
// https://developer.chrome.com/docs/extensions/reference/api/action
function updateBadge(is24HourFormat, isAMPMVisible) {
    let badgeTime = getCurrentTimeString(is24HourFormat, isAMPMVisible, false);
    chrome.action.setBadgeText({ text: badgeTime });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
}

// update the on-hover title with the current time
function updateTitle(is24HourFormat, isAMPMVisible) {
    let titleTime = getCurrentTimeString(is24HourFormat, isAMPMVisible, true);
    chrome.action.setTitle({title: titleTime})
}

// if the badge shows 12-hour time, the title will show 24-hour time
// and vice versa when the badge is toggled
function updateTime() {
    updateBadge(gbl_is24HourFormat, gbl_isAMPMVisible);
    updateTitle(!gbl_is24HourFormat, !gbl_isAMPMVisible);
}

// Perform an initial update and set interval to refresh every second
updateTime();
let badgeIntervalId = setInterval(updateTime, 1000);

// Detect when the user becomes active after being idle
chrome.idle.setDetectionInterval(15);
chrome.idle.onStateChanged.addListener(function(newSystemState) {
    if (newSystemState === "active") {
        badgeIntervalId = setInterval(updateTime, 1000);
    } else if (newSystemState === "locked") {
        clearInterval(badgeIntervalId);
    } else if (newSystemState === "idle") {
        // do nothing
    }
});

// Ensure time badge updates when Chrome starts
chrome.runtime.onStartup.addListener(() => {
   updateTime();
});
