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
  pressure_smoothing: document.getElementById("pressureSmoothingSlider"),
  pressure_curve_amount: document.getElementById("pressureCurveAmountSlider"),
};

// LIVESTATS THAT UPDATE ON EVERY POINTER EVENT
var livestats_ux = {
  pressure: document.getElementById("pressureVal"),
  tilt_x: document.getElementById("tiltXVal"),
  tilt_y: document.getElementById("tiltYVal"),
  tilt_azimuth: document.getElementById("tiltAzimuthVal"),
  tilt_altitude: document.getElementById("tiltAltitudeVal"),
  pos_canvas: document.getElementById("posVal"),
  size: document.getElementById("sizeVal"),
  brush_size: document.getElementById("brushSizeSelect"),
  barrel_rotation: document.getElementById("barrelRotationVal"),
  pressure_smoothing: document.getElementById("pressureSmoothingValue"),
  pressure_curve_amount: document.getElementById("pressureCurveAmountValue"),
};

var paintstats_ux = {
  stroke_count: document.getElementById("strokeCountVal"),
  ptrevent_count: document.getElementById("pointerEventCountVal"),
  stroke_duration: document.getElementById("strokeDurationVal"),
};

var EPenButton = {
  tip: 0x1, // left mouse, touch contact, pen contact
  barrel: 0x2, // right mouse, pen barrel button
  middle: 0x4, // middle mouse
  eraser: 0x20, // pen eraser button
};

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
  livestats_ux.pressure.innerText = ptr_rec.pressure_processed.toFixed(4);
  livestats_ux.tilt_x.innerText = ptr_rec.tilt_x.toFixed(1);
  livestats_ux.tilt_y.innerText = ptr_rec.tilt_y.toFixed(1);
  livestats_ux.tilt_azimuth.innerText = ptr_rec.tilt_azimuth.toFixed(1);
  livestats_ux.tilt_altitude.innerText = ptr_rec.tilt_altitude.toFixed(1);
  livestats_ux.pos_canvas.innerText =
    ptr_rec.canvas_pos.x.toFixed(1) + "x" + ptr_rec.canvas_pos.y.toFixed(1);
  livestats_ux.barrel_rotation.innerText = ptr_rec.barrel_rotation.toString();

  if (ptr_rec.pressure_processed > 0) {
    livestats_ux.size.innerText =
      current_dab_settings.brush_size.toString() + "px";
  } else {
    livestats_ux.size.innerText = "xxx";
  }
}

function update_paintsettings() {
  paint_settings.brush_size_control = controls.brush_size.value;
  var brush_size = parseInt(livestats_ux.brush_size.value);
  paint_settings.brush_size = brush_size;
  paint_settings.brush_color_control = controls.brush_color.value;
  paint_settings.pressure_smoothing.amount = GetSmoothingValue(controls.pressure_smoothing.value);
  paint_settings.pressure_curve.setCurveAmount(  parseFloat(controls.pressureCurveAmountSlider.value) ) ;

  // TODO: The lines below updated UI from the settings which is
  // the opposite of what is supposed to happen in this method.
  // Move somewhere else
  livestats_ux.pressure_smoothing.innerText =
    paint_settings.pressure_smoothing.amount.toString();
  livestats_ux.pressure_curve_amount.innerText =
    paint_settings.pressure_curve.amount.toFixed(1);

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

function is_target_pointer_event(ptr_event) {
  return (
    ptr_event.pointerType == "mouse" ||
    ptr_event.pointerType == "pen" ||
    ptr_event.pointerType == "touch"
  );
}




function toggleAdvancedDiv() {
  const checkbox = document.getElementById("toggleAdvancedControlsCheckbox");
  const div = document.getElementById("advancedcontrols");
  div.style.display = checkbox.checked ? "flex" : "none";
}

function resetAdvanced() {
  controls.pressure_smoothing.value = 0.0;
  controls.pressure_curve_amount.value = 0.0;
  update_paintsettings();
}

function clear_livestats_ux() {
  const empty = "---";
  livestats_ux.pos_canvas.innerText = empty;
  livestats_ux.size.innerText = empty;
  livestats_ux.pressure.innerText = empty;
  livestats_ux.tilt_x.innerText = empty;
  livestats_ux.tilt_y.innerText = empty;
  livestats_ux.barrel_rotation.innerText = empty;
  livestats_ux.tilt_altitude.innerText = empty;
  livestats_ux.tilt_azimuth.innerText = empty;
}

function default_ptr_event_handler_do_nothing(ptr_event) {
  // do nothing
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

/////////////////////////////////////////////////////////////////////////
// Handle drawing for HTML5 Pointer Events.
//
function pointer_event_handler(ptr_event) {
  // Ignore events we don't care about
  if (!is_target_pointer_event(ptr_event)) {
    return;
  }

  // The paint system needs to know the dimensions of the canvas it will draw on
  var canvas_rect = canvas_el.getBoundingClientRect();
  // given the canvas and the pointer event the paint_rec
  // has all the information needed to draw
  var paint_rec = get_ptr_rec(canvas_rect, ptr_event);
  // Live stats such as pointer position need to updated
  update_livestats_ui(paint_rec);
  // perform the actual paint
  paint_dab(ptr_event, paint_rec);
}

function on_pointerup(ptr_event) {
  paint_stroke_stop();
  paintstats_ux.stroke_count.innerText = paint_stats.stroke_count;
  paintstats_ux.ptrevent_count.innerText = paint_stats.ptrevent_count;
  paintstats_ux.stroke_duration.innerText = paint_stats.duration;
}

function on_pointerenter(ptr_event) {
  document.body.style.cursor = "crosshair";
}

function on_pointerleave(ptr_event) {
  document.body.style.cursor = "default";
  clear_livestats_ux();
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

function register_window_load_event_listeners() {
  if (!window.PointerEvent) {
    console.log("INFO: Browser DOES NOT support pointer events");
    return;
  }

  console.log("INFO: Browser DOES support pointer events");

  canvas_el.addEventListener("pointerdown", pointer_event_handler, false);
  canvas_el.addEventListener("pointerup", on_pointerup, false);

  canvas_el.addEventListener("pointercancel", pointer_event_handler, false);
  canvas_el.addEventListener("pointermove", pointer_event_handler, false);

  canvas_el.addEventListener(
    "pointerover",
    default_ptr_event_handler_do_nothing,
    false
  );
  canvas_el.addEventListener(
    "pointerout",
    default_ptr_event_handler_do_nothing,
    false
  );

  canvas_el.addEventListener("pointerenter", on_pointerenter, false);
  canvas_el.addEventListener("pointerleave", on_pointerleave, false);

  canvas_el.addEventListener(
    "gotpointercapture",
    default_ptr_event_handler_do_nothing,
    false
  );
  canvas_el.addEventListener(
    "lostpointercapture",
    default_ptr_event_handler_do_nothing,
    false
  );
}

register_event_handlers();
