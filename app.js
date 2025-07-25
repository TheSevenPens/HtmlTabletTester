/////////////////////////////////////////////////////////////////////////

var appsettings = {
  canvas_color: "rgba(230, 230, 250, 1.0)",
  download_filename: "TabletTester_Untitled",
};

const canvas_el = document.getElementById("myCanvas");
const canvas_context = canvas_el.getContext("2d");

const curveCanvas = document.getElementById("curveCanvas");
const curveCtx = curveCanvas.getContext("2d");

var controls = {
  brush_size: document.getElementById("brushSizeControlSelect"),
  brush_color: document.getElementById("brushColorControlSelect"),
  pressureCurveAmountSlider: document.getElementById(
    "pressureCurveAmountSlider"
  ),
  position_smoothing: document.getElementById("positionSmoothingSlider"),
  pressure_smoothing: document.getElementById("pressureSmoothingSlider"),
  pressure_curve_amount: document.getElementById("pressureCurveAmountSlider"),
  tilt_smoothing: document.getElementById("tiltSmoothingSlider"),
};

// LIVESTATS THAT UPDATE ON EVERY POINTER EVENT
var livestats_ux = {
  buttons: document.getElementById("buttonsVal"),
  pressure_raw: document.getElementById("pressureRawVal"),
  pressure_processed: document.getElementById("pressureProcessedVal"),
  tilt_x: document.getElementById("tiltXVal"),
  tilt_y: document.getElementById("tiltYVal"),
  tilt_azimuth: document.getElementById("tiltAzimuthVal"),
  tilt_altitude: document.getElementById("tiltAltitudeVal"),

  tilt_x_processed: document.getElementById("tiltXProcessedVal"),
  tilt_y_processed: document.getElementById("tiltYProcessedVal"),
  tilt_azimuth_processed: document.getElementById("tiltAzimuthProcessedVal"),
  tilt_altitude_processed: document.getElementById("tiltAltitudeProcessedVal"),

  pos_x_canvas_raw: document.getElementById("posXValRaw"),
  pos_y_canvas_raw: document.getElementById("posYValRaw"),

  pos_x_canvas: document.getElementById("posXVal"),
  pos_y_canvas: document.getElementById("posYVal"),
  size: document.getElementById("sizeVal"),
  brush_size: document.getElementById("brushSizeSelect"),
  barrel_rotation: document.getElementById("barrelRotationVal"),
  position_smoothing: document.getElementById("positionSmoothingValue"),
  pressure_smoothing: document.getElementById("pressureSmoothingValue"),
  pressure_curve_amount: document.getElementById("pressureCurveAmountValue"),
};

var paintstats_ux = {
  stroke_count: document.getElementById("strokeCountVal"),
  ptrevent_count: document.getElementById("pointerEventCountVal"),
  stroke_duration: document.getElementById("strokeDurationVal"),
};



function button_to_string( button )
{
  if ( button == EPenButton.none) { return "none";}
  else if ( button == EPenButton.tip) { return "pen tip";}
  else if ( button == EPenButton.barrel) { return "pen button";}
  else if ( button == EPenButton.middle) { return "middle mouse";}
  else if ( button == EPenButton.eraser) { return "eraser";}
  else { return "unknown"; }
}

update_paintsettings();

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

//
// LIVESTATS UI
//

function update_livestats_ui(ptr_rec) {
  livestats_ux.buttons.innerText = ptr_rec.buttons + " (" + button_to_string(ptr_rec.buttons) + ")";
  livestats_ux.pressure_raw.innerText = ptr_rec.pressure_raw.toFixed(4);
  livestats_ux.pressure_processed.innerText = ptr_rec.pressure_processed.toFixed(4);

  livestats_ux.tilt_x.innerText = ptr_rec.tilt_x.toFixed(1);
  livestats_ux.tilt_y.innerText = ptr_rec.tilt_y.toFixed(1);
  livestats_ux.tilt_azimuth.innerText = ptr_rec.tilt_azimuth.toFixed(1);
  livestats_ux.tilt_altitude.innerText = ptr_rec.tilt_altitude.toFixed(1);

  livestats_ux.tilt_x_processed.innerText = ptr_rec.tilt_x_processed.toFixed(1);
  livestats_ux.tilt_y_processed.innerText = ptr_rec.tilt_y_processed.toFixed(1);
  livestats_ux.tilt_azimuth_processed.innerText = ptr_rec.tilt_azimuth_processed.toFixed(1);
  livestats_ux.tilt_altitude_processed.innerText = ptr_rec.tilt_altitude_processed.toFixed(1);

  livestats_ux.pos_x_canvas.innerText =
    ptr_rec.canvas_pos.x.toFixed(1) ;

  livestats_ux.pos_y_canvas.innerText =
    ptr_rec.canvas_pos.y.toFixed(1);

   livestats_ux.pos_x_canvas_raw.innerText =
    ptr_rec.canvas_pos_raw.x.toFixed(1) ;

  livestats_ux.pos_y_canvas_raw.innerText =
    ptr_rec.canvas_pos_raw.y.toFixed(1);

    livestats_ux.barrel_rotation.innerText = ptr_rec.barrel_rotation.toString();

  if (ptr_rec.pressure_processed > 0) {
    livestats_ux.size.innerText =
      current_dab_settings.brush_size.toString() + "px";
  } else {
    livestats_ux.size.innerText = "xxx";
  }
}

function update_paintsettings() {

  // BRUSH FORMAT
  paint_settings.brush_size_control = controls.brush_size.value;
  var brush_size = parseInt(livestats_ux.brush_size.value);
  paint_settings.brush_size = brush_size;
  paint_settings.brush_color_control = controls.brush_color.value;

  // POSITION
  paint_settings.pos_x_smoothing.amount = GetSmoothingValue(controls.position_smoothing.value);
  paint_settings.pos_y_smoothing.amount = paint_settings.pos_x_smoothing.amount;

  // PRESSURE
  paint_settings.pressure_smoothing.amount = GetSmoothingValue(controls.pressure_smoothing.value);
  paint_settings.pressure_curve.setCurveAmount(  parseFloat(controls.pressureCurveAmountSlider.value) ) ;

  // TILT
  paint_settings.tilt_x_smoothing.amount = GetSmoothingValue(controls.tilt_smoothing.value);
  paint_settings.tilt_y_smoothing.amount = GetSmoothingValue(controls.tilt_smoothing.value);
  paint_settings.tilt_altitude_smoothing.amount = GetSmoothingValue(controls.tilt_smoothing.value);
  paint_settings.tilt_azimuth_smoothing.amount = GetSmoothingValue(controls.tilt_smoothing.value);

  // TODO: The lines below updated UI from the settings which is
  // the opposite of what is supposed to happen in this method.
  // Move somewhere else
  livestats_ux.position_smoothing.innerText = paint_settings.pos_x_smoothing.amount.toString();
  livestats_ux.pressure_smoothing.innerText = paint_settings.pressure_smoothing.amount.toString();
  livestats_ux.pressure_curve_amount.innerText = paint_settings.pressure_curve.amount.toFixed(1);

  drawPressureCurve();
}

function getCanvasName() {
  return appsettings.download_filename + "_" + Date.now().toString() + ".png";
}

/////////////////////////////////////////////////////////////////////////
// Saves the image on the drawing canvas and then downloads a png.
//
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
  controls.pressure_smoothing.value = 0.0;
  controls.pressure_curve_amount.value = 0.0;
  controls.position_smoothing.value = 0.0;
  update_paintsettings();
}

function clear_livestats_ux() {
  const empty = "-";
  livestats_ux.buttons.innerText = empty;
  livestats_ux.pos_x_canvas.innerText = empty;
  livestats_ux.pos_y_canvas.innerText = empty;
  livestats_ux.pos_x_canvas_raw.innerText = empty;
  livestats_ux.pos_y_canvas_raw.innerText = empty;
  livestats_ux.size.innerText = empty;
  livestats_ux.pressure_raw.innerText = empty;
  livestats_ux.pressure_processed.innerText = empty;
  livestats_ux.barrel_rotation.innerText = empty;

  livestats_ux.tilt_x.innerText = empty;
  livestats_ux.tilt_y.innerText = empty;
  livestats_ux.tilt_altitude.innerText = empty;
  livestats_ux.tilt_azimuth.innerText = empty;

  livestats_ux.tilt_x_processed.innerText = empty;
  livestats_ux.tilt_y_processed.innerText = empty;
  livestats_ux.tilt_altitude_processed.innerText = empty;
  livestats_ux.tilt_azimuth_processed.innerText = empty;

}



function drawPressureCurve() {
  curveCtx.clearRect(0, 0, curveCanvas.width, curveCanvas.height);
  curveCtx.beginPath();
  curveCtx.moveTo(0, curveCanvas.height);
  for (let x = 0; x <= curveCanvas.width; x++) {
    const pressure = x / curveCanvas.width;
    const curvedPressure = paint_settings.pressure_curve.apply( pressure );  
    const y = curveCanvas.height * (1 - curvedPressure);
    curveCtx.lineTo(x, y);
  }
  curveCtx.strokeStyle = "rgb(150,180,255)";
  curveCtx.lineWidth = 3;
  curveCtx.stroke();

  // Draw axes
  curveCtx.beginPath();
  curveCtx.moveTo(0, 0);
  curveCtx.lineTo(0, curveCanvas.height);
  curveCtx.lineTo(curveCanvas.width, curveCanvas.height);
  curveCtx.strokeStyle = "black";
  curveCtx.lineWidth = 1;
  curveCtx.stroke();
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
