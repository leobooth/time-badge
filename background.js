let gbl_options = {}
let badgeIntervalId = -1;

// store options, initiate clock, and start timer when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
    console.log("onInstalled: initializing time badge");
    
    // Ensure initial default options are stored on first install
    const storedOptions = await getOptionsFromStorage();
    if (!storedOptions || storedOptions.is24HourFormat === undefined) {
        const defaultOptions = { is24HourFormat: false };
        await setOptionsToStorage(defaultOptions);
        console.log("stored initial default options:", defaultOptions);
    }
    
    // Initialize the badge
    await initializeTimeBadge();
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

function getCurrentDateTimeFormattedString(dateOrTime) {
    let now = new Date();
    
    const dateOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric"
    }
    
    const timeOptions = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }

    const dateFormatter = new Intl.DateTimeFormat(undefined, dateOptions);
    const timeFormatter = new Intl.DateTimeFormat(undefined, timeOptions);

    const formattedDate = dateFormatter.format(now);
    const formattedTime = timeFormatter.format(now);

    if (dateOrTime.toString().toLowerCase().trim() === "date") {
        return formattedDate;
    } else if (dateOrTime.toString().toLowerCase().trim() === "time") {
        return formattedTime;
    } else {
        throw new Error("getCurrentDateTimeFormatttedString() argument must be 'date' or 'time'");
    }
}

// TODO: Alternate display ideas (user would toggle through them to choose one)
//     * change colors based on dark mode setting (or if Chrome skin background is dark or light)
//     * change icon behind badge to sun or moon so that am/pm status is implied
//     * display digital time in the icon display area as an HTML canvas (larger font?)

// update the badge with the current time
// https://developer.chrome.com/docs/extensions/reference/api/action
function updateBadge(options) {
    // if 12-hour format is chosen, do not show "am" or "pm" in the badge, only "a" or "p"
    let badgeTime = getCurrentTimeString(options.is24HourFormat, false);
    chrome.action.setBadgeText({ text: badgeTime });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
}

// update the on-hover title with the current time
function updateTitleWithTime(options) {
    // if 12-hour format is chosen, show "am" or "pm" in the title
    let titleTime = getCurrentTimeString(!options.is24HourFormat, true);
    chrome.action.setTitle({title: titleTime})
}

// update the on-hover title with the current time
function updateTitleWithDate() {
    let titleDate = getCurrentDateTimeFormattedString("date");
    chrome.action.setTitle({title: titleDate});
}

// if the badge shows 12-hour time, the title will show 24-hour time
// and vice versa when the badge is toggled
function updateTime() {
    updateBadge(gbl_options);
    updateTitleWithDate();
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
chrome.idle.onStateChanged.addListener(async function(newSystemState) {
    if (newSystemState === "active") {
        // Get stored options from Chrome sync before updating time
        const storedOptions = await getOptionsFromStorage();
        if (storedOptions) {
            gbl_options = storedOptions;
        }
        
        // Clear any existing interval before creating a new one
        clearInterval(badgeIntervalId);
        badgeIntervalId = setInterval(updateTime, 1000);
    } else if (newSystemState === "locked" || newSystemState === "idle") {
        clearInterval(badgeIntervalId);
    }
});

// Ensure service worker restarts after Chrome restarts
// This handles the case where Chrome crashed and the service worker was inactive
async function initializeTimeBadge() {
    // Clear any existing interval
    clearInterval(badgeIntervalId);
    
    // Load options from storage
    const storedOptions = await getOptionsFromStorage();
    if (storedOptions) {
        gbl_options = storedOptions;
    } else {
        // Fallback to defaults if no options exist
        gbl_options.is24HourFormat = false;
    }
    
    // Perform an initial update and start the interval
    updateTime();
    badgeIntervalId = setInterval(updateTime, 1000);
}

// Ensure time badge updates when profile having this extension starts
chrome.runtime.onStartup.addListener(async () => {
    console.log("onStartup: initializing time badge");
    await initializeTimeBadge();
});

// Initialize when service worker starts (covers cases where service worker restarts without onInstalled/onStartup)
console.log("Service worker initialized");
initializeTimeBadge();
