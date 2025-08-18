/////////////////////////////////////////////////////////////////////////

var appsettings = {
  canvas_color: "rgba(230, 230, 250, 1.0)",
  download_filename: "TabletTester_Untitled",
};

const canvas_el = document.getElementById("myCanvas");
const canvas_context = canvas_el.getContext("2d");

const curveCanvas = document.getElementById("curveCanvas");
const curveCtx = curveCanvas.getContext("2d");

update_ux_paint_settings();

function initPage() {
  setCanvasProps();
}

/////////////////////////////////////////////////////////////////////////
// Init canvas properties.
// Sets canvas width to expand to browser window.
// Canvas cleared to restore background color.
//
function setCanvasProps() {
  if (canvas_el.width < window.innerWidth) {
    canvas_el.width = window.innerWidth - 50;
  }

  clearCanvas(); // ensures background saved with drawn image
}


function getCanvasName() {
  return appsettings.download_filename + "_" + Date.now().toString() + ".png";
}

function saveCanvas() {
  var link = document.getElementById("link");
  var url = canvas_el
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  link.setAttribute("download", getCanvasName());
  link.setAttribute("href", url);
  link.click();
}

function toggleAdvancedDiv() {
  const checkbox = document.getElementById("toggleAdvancedControlsCheckbox");
  const div = document.getElementById("advancedcontrols");
  div.style.display = checkbox.checked ? "flex" : "none";
}

function resetAdvanced() {
  ux_paint_brush_settings.pressure_smoothing.value = 0.0;
  ux_paint_brush_settings.pressure_curve_amount.value = 0.0;
  ux_paint_brush_settings.position_smoothing.value = 0.0;
  ux_paint_brush_settings.pressure_quant.value = 0.0;
  update_ux_paint_settings();
}



function register_event_handlers() {
  window.addEventListener("load", register_window_load_event_listeners, true);
  register_document_hotkey_event_listeners();
}

function register_document_hotkey_event_listeners() {
  // Hotkey for DELETE or BACKSPACE
  document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault(); // Prevent browser back navigation
      clearCanvas();
    }
  });
}

register_event_handlers();
