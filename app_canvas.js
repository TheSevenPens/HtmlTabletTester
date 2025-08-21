
const app_canvas_el = document.getElementById("myCanvas");
const app_canvas_context = app_canvas_el.getContext("2d");
const canvas_computed_style = window.getComputedStyle(app_canvas_el);
const app_canvas_top_width =  parseInt(canvas_computed_style.getPropertyValue('border-top-width'));
const app_canvas_left_width =  parseInt(canvas_computed_style.getPropertyValue('border-left-width'));
console.log("app_canvas_top_width: " + app_canvas_top_width);
console.log("app_canvas_left_width: " + app_canvas_left_width);

const app_pressure_curve_canvas = document.getElementById("curveCanvas");
const app_pressure_curve_canvas_ctx = app_pressure_curve_canvas.getContext("2d");

/////////////////////////////////////////////////////////////////////////
// Init canvas properties.
// Sets canvas width to expand to browser window.
// Canvas cleared to restore background color.
//
function setCanvasProps() {
    if (app_canvas_el.width < window.innerWidth) {
        app_canvas_el.width = window.innerWidth - 50;
    }

    clearCanvas(); // ensures background saved with drawn image
}


function getCanvasName() {
    return app_settings.download_filename + "_" + Date.now().toString() + ".png";
}

function saveCanvas() {
    var link = document.getElementById("link");
    var url = app_canvas_el
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    link.setAttribute("download", getCanvasName());
    link.setAttribute("href", url);
    link.click();
}