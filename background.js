let gbl_options = {}
let badgeIntervalId = -1;

// store options, initiate clock, and start timer when extension is installed
chrome.runtime.onInstalled.addListener( () => {
    // TODO: get stored options from Chrome sync first. if there are none (how to detect?), then store initial options
    gbl_options.is24HourFormat = false;
    setOptionsToStorage(gbl_options).then();
    console.log("stored options upon install:");
    console.log(gbl_options);

    // Perform an initial update and set interval to refresh every second
    updateTime();
    badgeIntervalId = setInterval(updateTime, 1000);
});

function getCurrentTimeString(is24HourFormat, displayFullLengthTime) {
    let now = new Date();
    let hours = "";
    let minutes = "";
    let ampm = "";
    let currentTimeString = "";
    let hours24 = 0;

    // 24-hour format does not show "am" or "pm"
    if (is24HourFormat) {
        hours = now.getHours().toString();
        ampm = "";

        hours = hours.padStart(2, '0');
        minutes = now.getMinutes().toString().padStart(2, '0');

        currentTimeString = `${hours}:${minutes}`;
    }

    // 12-hour format may show "am" or "pm" depending on display location
    if (!is24HourFormat) {
        hours24 = now.getHours();

        // could be 12:00 or 00:00
        if (hours24 % 12 === 0) {
            hours = "12"
        } else {
            hours = (hours24 % 12).toString();
        }

        minutes = now.getMinutes().toString().padStart(2, '0');

        if (displayFullLengthTime) {
            ampm = hours24 < 12 ? "am" : "pm";
            currentTimeString = `${hours}:${minutes}${ampm}`;
        } else {
            // due to display space restrictions,
            // don't show 'a' or 'p' after double-digit hours
            if (hours.length < 2) {
                ampm = hours24 < 12 ? "a" : "p";
            } else {
                ampm = "";
            }
            currentTimeString = `${hours}:${minutes}${ampm}`;
        }
    }

    return currentTimeString;
}

// TODO: change colors based on dark mode setting (or if Chrome skin background is dark or light)

// update the badge with the current time
// https://developer.chrome.com/docs/extensions/reference/api/action
function updateBadge(options) {
    // if 12-hour format is chosen, do not show "am" or "pm" in the badge, only "a" or "p"
    let badgeTime = getCurrentTimeString(options.is24HourFormat, false);
    chrome.action.setBadgeText({ text: badgeTime });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
}

// update the on-hover title with the current time
function updateTitle(options) {
    // if 12-hour format is chosen, show "am" or "pm" in the title
    let titleTime = getCurrentTimeString(!options.is24HourFormat, true);
    chrome.action.setTitle({title: titleTime})
}

// if the badge shows 12-hour time, the title will show 24-hour time
// and vice versa when the badge is toggled
function updateTime() {
    updateBadge(gbl_options);
    updateTitle(gbl_options);
}

// get user preference for 12 or 24-hour time format
async function getOptionsFromStorage() {
    const data = await chrome.storage.sync.get("options");
    return data.options;
}

// set user preference for 12 or 24-hour time format
async function setOptionsToStorage(options) {
    chrome.storage.sync.set({options});
}

// Toggle between 12-hour and 24-hour time format when the user clicks the extension icon
//https://developer.chrome.com/docs/extensions/reference/api/storage
chrome.action.onClicked.addListener(async () => {
    let options = await getOptionsFromStorage();

    console.log("options from storage:");
    console.log(options);

    gbl_options.is24HourFormat = !options.is24HourFormat;

    console.log("gbl_options after toggle:");
    console.log(gbl_options);

    await setOptionsToStorage(gbl_options);
    updateTime();
});

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

// Ensure time badge updates when profile having this extension starts
chrome.runtime.onStartup.addListener(() => {
    console.log("got options after profile startup");
    gbl_options = getOptionsFromStorage();
    updateTime();
});
