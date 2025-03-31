// TODO: initialize storage when extension is first installed
// TODO: retrieve values from storage when extension is restarted?
let gbl_is24HourFormat = false
let gbl_isAMPMVisible = true;

function getCurrentTimeString(is24HourFormat, isAMPMVisible) {
    let now = new Date();
    let hours = "";
    let minutes = "";
    let ampm = "";
    let currentTimeString = "";

    if (is24HourFormat) {
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

// get user preference for 12 or 24-hour time format
async function getTimeFormatFromStorage() {
    const options = {}
    options.is24HourFormat = false;
    const data = await chrome.storage.sync.get("options");
    Object.assign(options, data.options);
    gbl_is24HourFormat = options.is24HourFormat;
}

// set user preference for 12 or 24-hour time format
async function setTimeFormatToStorage(is24HourFormat) {
    const options = {}
    options.is24HourFormat = is24HourFormat;
    chrome.storage.sync.set({options}, () => {
        console.log("set is24HourFormat to " + is24HourFormat + " in storage");
    });
}


// TODO: toggle is24Hour based on click of extension icon/badge
// Toggle between 12-hour and 24-hour format when the user clicks the extension icon
chrome.action.onClicked.addListener(async () => {
   const formatFromStorage = await getTimeFormatFromStorage();
   gbl_is24HourFormat = !formatFromStorage;
   gbl_isAMPMVisible = !gbl_isAMPMVisible;
   await setTimeFormatToStorage(gbl_is24HourFormat);
   updateTime();
});

// chrome.action.onClicked.addListener(() => {
//     chrome.storage.local.get({ is24HourFormat: false }, (data) => {
//         let newFormat = !data.is24HourFormat;
//         chrome.storage.local.set({ is24HourFormat: newFormat }, () => {
//             updateBadge(); // Refresh badge with new format
//         });
//     });
// });


// update the badge with the current time
// https://developer.chrome.com/docs/extensions/reference/api/action
function updateBadge(is24HourFormat, isAMPMVisible) {
    let badgeTime = getCurrentTimeString(is24HourFormat, isAMPMVisible);
    chrome.action.setBadgeText({ text: badgeTime });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
}

// update the on-hover title with the current time
function updateTitle(is24HourFormat, isAMPMVisible) {
    let titleTime = getCurrentTimeString(is24HourFormat, isAMPMVisible);
    chrome.action.setTitle({title: titleTime})
}

function updateTime() {
    updateBadge(gbl_is24HourFormat, gbl_isAMPMVisible);
    updateTitle(gbl_is24HourFormat, gbl_isAMPMVisible);
}

// Perform an initial update and set interval to refresh every second
updateTime();
let badgeIntervalId = setInterval(updateTime, 1000);

// Detect when the user becomes active after being idle
chrome.idle.setDetectionInterval(15);
chrome.idle.onStateChanged.addListener(function(newSystemState) {
    // console.log("current time: " + getCurrentTimeString(true, false) + "; " +
    // "current system state: " + newSystemState);
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
   console.log("updated time after Chrome start");
});
