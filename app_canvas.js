const appCanvasEl = document.getElementById("myCanvas");
const appCanvasContext = appCanvasEl.getContext("2d");
const appPressureCurveCanvas = document.getElementById("curveCanvas");
const appPressureCurveCanvasCtx = appPressureCurveCanvas.getContext("2d");

/////////////////////////////////////////////////////////////////////////
// Init canvas properties.
// Sets canvas width to expand to browser window.
// Canvas cleared to restore background color.
//
function setCanvasProps() {
    if (appCanvasEl.width < window.innerWidth) {
        appCanvasEl.width = window.innerWidth - 50;
    }

    clearCanvas(); // ensures background saved with drawn image
}


function getCanvasName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    return appSettings.downloadFilename + "_" + timestamp + ".png";
}

function saveCanvas() {
    const link = document.getElementById("link");
    const url = appCanvasEl
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    link.setAttribute("download", getCanvasName());
    link.setAttribute("href", url);
    link.click();
}