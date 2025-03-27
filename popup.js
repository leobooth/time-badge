import * as time from "./time"

function updatePopupTime() {
    let timeString = time.getCurrentTimeString();
    document.getElementById("time").textContent = timeString;
}

updatePopupTime();
setInterval(updatePopupTime, 1000);