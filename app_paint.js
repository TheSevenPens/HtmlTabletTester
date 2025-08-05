
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
  pressure_quant: document.getElementById("pressureQuantSelect"),

};

// LIVESTATS
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

  pressure_quant: document.getElementById("pressureQuant"),
 
};

// STROKESTATS
var strokestats_ux = {
  stroke_count: document.getElementById("strokeCountVal"),
  ptrevent_count: document.getElementById("pointerEventCountVal"),
  stroke_duration: document.getElementById("strokeDurationVal"),
  ptreventpersec: document.getElementById("strokeEventsPerSecVal"),
};




function format4_1(num) {
    const nbsp = "\u00A0";
    return num.toFixed(1).padStart(6, nbsp );
}

function format1_4(num) {
    return num.toFixed(4);
}

function update_livestats_ui(ptr_rec) {
  livestats_ux.buttons.innerText = ptr_rec.buttons + " (" + button_to_string(ptr_rec.buttons) + ")";
  livestats_ux.pressure_raw.innerText = format1_4( ptr_rec.pressure_raw );
  livestats_ux.pressure_processed.innerText = format1_4( ptr_rec.pressure_processed );

  livestats_ux.tilt_x.innerText = format4_1( ptr_rec.tilt_x );
  livestats_ux.tilt_y.innerText = format4_1( ptr_rec.tilt_y );
  livestats_ux.tilt_azimuth.innerText = format4_1( ptr_rec.tilt_azimuth );
  livestats_ux.tilt_altitude.innerText = format4_1( ptr_rec.tilt_altitude );

  livestats_ux.tilt_x_processed.innerText = format4_1( ptr_rec.tilt_x_processed );
  livestats_ux.tilt_y_processed.innerText = format4_1( ptr_rec.tilt_y_processed );
  livestats_ux.tilt_azimuth_processed.innerText = format4_1( ptr_rec.tilt_azimuth_processed );
  livestats_ux.tilt_altitude_processed.innerText = format4_1( ptr_rec.tilt_altitude_processed );

  livestats_ux.pos_x_canvas.innerText = format4_1( ptr_rec.canvas_pos_x ) ;

  livestats_ux.pos_y_canvas.innerText = format4_1( ptr_rec.canvas_pos_y );

  livestats_ux.pos_x_canvas_raw.innerText = format4_1( ptr_rec.canvas_pos_x_raw );

  livestats_ux.pos_y_canvas_raw.innerText = format4_1( ptr_rec.canvas_pos_y_raw );

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
  paint_settings.pressure_quant = parseInt(controls.pressure_quant.value ) ;


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