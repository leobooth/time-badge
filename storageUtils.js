// get user preference for 12 or 24-hour time format
export async function getOptionsFromStorage() {
    const data = await chrome.storage.sync.get("options");
    return data.options;
}

// set user preference for 12 or 24-hour time format
export async function setOptionsToStorage(options) {
    chrome.storage.sync.set({options});
}
