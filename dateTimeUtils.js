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
        // do not show 'a' or 'p' after double-digit hours
        if (hours.length < 2) {
            ampm = hours24 < 12 ? "a" : "p";
        } else {
            ampm = "";
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