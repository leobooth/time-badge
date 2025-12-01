export function getCurrentTimeString(is24HourFormat) {
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

    // 12-hour format: show "am" or "pm" 
    if (!is24HourFormat) {
        hours24 = now.getHours();

        // show "12" instead of "00" at midnight, and "1" through "11" instead of "13" through "23"
        if (hours24 % 12 === 0) {
            hours = "12"
        } else {
            hours = (hours24 % 12).toString();
        }

        // due to display space restrictions,
        // show 'a' or 'p' instead of 'am' or 'pm' after double-digit hours   
        if (hours.length < 2) {
            ampm = hours24 < 12 ? "am" : "pm";
        } else {
            ampm = hours24 < 12 ? "a" : "p";
        }

        minutes = now.getMinutes().toString().padStart(2, '0');

        currentTimeString = `${hours}:${minutes}${ampm}`;
    }

    return currentTimeString;
}

export function getCurrentDateInLocalFormat() {
    let now = new Date();
    
    const dateOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric"
    }

    const dateFormatter = new Intl.DateTimeFormat(undefined, dateOptions);
    const formattedDate = dateFormatter.format(now);

    return formattedDate;
}

// TODO: show this in the title tooltip if a user toggles to it
export function getCurrentTimeInLocalFormat() {
    let now = new Date();
    
    const timeOptions = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }

    const timeFormatter = new Intl.DateTimeFormat(undefined, timeOptions);
    const formattedTime = timeFormatter.format(now);

    return formattedTime;
}

// update the on-hover title with the current time
export function updateTitleWithTime() {
    let titleDate = getCurrentTimeInLocalFormat();
    chrome.action.setTitle({title: titleDate});
}

// update the on-hover title with the current date
export function updateTitleWithDate() {
    let titleDate = getCurrentDateInLocalFormat();
    chrome.action.setTitle({title: titleDate});
}