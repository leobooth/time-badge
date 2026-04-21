import * as DateTimeUtils from "./dateTimeUtils.js";
import * as StorageUtils from "./storageUtils.js";

let gbl_options = {}
let badgeIntervalId = -1;

// store options, initiate clock, and start timer when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
        
    // Ensure initial default options are stored on first install
    const storedOptions = await StorageUtils.getOptionsFromStorage();
    if (!storedOptions || 
        storedOptions.is24HourFormat === undefined || 
        storedOptions.isDarkMode === undefined) {
        
        const defaultOptions = {
            optionSet: 1, 
            is24HourFormat: false,
            isDarkMode: false
        };

        await StorageUtils.setOptionsToStorage(defaultOptions);
        console.log("stored initial default options:", defaultOptions);
    }
    
    await initializeTimeBadge();
});

// update the badge with the current time
// https://developer.chrome.com/docs/extensions/reference/api/action
function updateBadge(options) {

    // if 12-hour format is chosen, show "am" or "pm" in the badge
    let badgeTime = DateTimeUtils.getCurrentTimeString(options.is24HourFormat);
    chrome.action.setBadgeText({ text: badgeTime });

    if (!options.isDarkMode) {
        chrome.action.setBadgeBackgroundColor({ color: "#FFFFFF" });
        chrome.action.setBadgeTextColor({ color: "#000000" });
        chrome.action.setIcon({ 
            path: {
             "16": "icons/light-mode/icon16.png", 
             "32": "icons/light-mode/icon32.png", 
             "48": "icons/light-mode/icon48.png", 
             "128": "icons/light-mode/icon128.png"
            } 
        });
    } else {
        chrome.action.setBadgeBackgroundColor({ color: "#000000" });
        chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
        chrome.action.setIcon({ 
            path: {
             "16": "icons/dark-mode/icon16.png", 
             "32": "icons/dark-mode/icon32.png", 
             "48": "icons/dark-mode/icon48.png", 
             "128": "icons/dark-mode/icon128.png"
            } 
        });
    }

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

    let optionSet = options.optionSet;

    if (optionSet == 1) {
        options.isDarkMode = false;
        options.is24HourFormat = false;
    } else if (optionSet == 2) {
        options.isDarkMode = false;
        options.is24HourFormat = true;
    } else if (optionSet == 3) {
        options.isDarkMode = true;
        options.is24HourFormat = false;
    } else if (optionSet == 4) {
        options.isDarkMode = true;
        options.is24HourFormat = true;
    }

    if (optionSet == 4) {
        options.optionSet = 1;
    } else {
        options.optionSet++;
    }

    gbl_options = options;

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
        gbl_options.optionSet = 1;
        gbl_options.isDarkMode = false;
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
