import * as DateTimeUtils from "./dateTimeUtils.js";
import * as StorageUtils from "./storageUtils.js";

let gbl_options = {}
let badgeIntervalId = -1;

// store options, initiate clock, and start timer when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
        
    // Ensure initial default options are stored on first install
    const storedOptions = await getOptionsFromStorage();
    if (!storedOptions || storedOptions.is24HourFormat === undefined) {
        
        const defaultOptions = { is24HourFormat: false };
        await setOptionsToStorage(defaultOptions);
        console.log("stored initial default options:", defaultOptions);
    }
    
    await initializeTimeBadge();
});

// TODO: Alternate display ideas (user would toggle through them to choose one)
//     * change colors based on dark mode setting (or if Chrome skin background is dark or light)
//     * change icon behind badge to sun or moon so that am/pm status is implied
//     * display digital time in the icon display area as an HTML canvas (larger font?)

// update the badge with the current time
// https://developer.chrome.com/docs/extensions/reference/api/action
function updateBadge(options) {
    // if 12-hour format is chosen, show "am" or "pm" in the badge
    let badgeTime = DateTimeUtils.getCurrentTimeString(options.is24HourFormat);
    chrome.action.setBadgeText({ text: badgeTime });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
}

// if the badge shows 12-hour time, the title will show 24-hour time
// and vice versa when the badge is toggled
function updateTime() {
    updateBadge(gbl_options);
    DateTimeUtils.updateTitleWithDate();
}

// Toggle between 12-hour and 24-hour time format when the user clicks the extension icon
//https://developer.chrome.com/docs/extensions/reference/api/storage
chrome.action.onClicked.addListener(async () => {
    let options = await StorageUtils.getOptionsFromStorage();

    console.log("options from storage:");
    console.log(options);

    gbl_options.is24HourFormat = !options.is24HourFormat;

    console.log("gbl_options after toggle:");
    console.log(gbl_options);

    await StorageUtils.setOptionsToStorage(gbl_options);
    updateTime();
});

// Detect when the user becomes active after being idle
chrome.idle.setDetectionInterval(15);
chrome.idle.onStateChanged.addListener(async function(newSystemState) {
    if (newSystemState === "active") {
        // Get stored options from Chrome sync before updating time
        const storedOptions = await StorageUtils.getOptionsFromStorage();
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
    console.log("initializing time badge");

    // Clear any existing interval
    clearInterval(badgeIntervalId);
    
    // Load options from storage
    const storedOptions = await StorageUtils.getOptionsFromStorage();
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
    console.log("initializing time badge on profile startup");
    await initializeTimeBadge();
});

// Initialize when service worker starts (covers cases where service worker restarts without onInstalled/onStartup)
console.log("initializing time badge on service worker restart");
initializeTimeBadge();
