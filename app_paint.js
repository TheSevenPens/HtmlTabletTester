
// STROKESTATS ----------------------------------------


var ux_stroke_stats = {
    stroke_count: document.getElementById("strokeCountVal"),
    ptrevent_count: document.getElementById("pointerEventCountVal"),
    stroke_duration: document.getElementById("strokeDurationVal"),
    ptreventpersec: document.getElementById("strokeEventsPerSecVal"),
};

function update_ux_stroke_stats()
{
    ux_stroke_stats.stroke_count.innerText = paint_stroke_stats.stroke_count;
    ux_stroke_stats.ptrevent_count.innerText = paint_stroke_stats.ptrevent_count;
    ux_stroke_stats.stroke_duration.innerText = paint_stroke_stats.duration;
    ux_stroke_stats.ptreventpersec.innerText = round_to_1_decimal_places( paint_stroke_stats.ptrevent_count / paint_stroke_stats.duration * 1000 ) ;
}

// POINTER STATS ----------------------------------------------
var ux_pointer_stats = {
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

    velocity: document.getElementById("velocityVal"),
    direction: document.getElementById("directionVal"),


    size: document.getElementById("sizeVal"),
    brush_size: document.getElementById("brushSizeSelect"),
    barrel_rotation: document.getElementById("barrelRotationVal"),
    position_smoothing: document.getElementById("positionSmoothingValue"),
    pressure_smoothing: document.getElementById("pressureSmoothingValue"),
    pressure_curve_amount: document.getElementById("pressureCurveAmountValue"),

    pressure_quant: document.getElementById("pressureQuant"),

};

function update_ux_pointer_stats(ptr_rec) {
    ux_pointer_stats.buttons.innerText = ptr_rec.buttons + " (" + button_to_string(ptr_rec.buttons) + ")";
    ux_pointer_stats.pressure_raw.innerText = format1_4( ptr_rec.pressure_raw );
    ux_pointer_stats.pressure_processed.innerText = format1_4( ptr_rec.pressure_processed );

    ux_pointer_stats.tilt_x.innerText = format4_1( ptr_rec.tilt_x );
    ux_pointer_stats.tilt_y.innerText = format4_1( ptr_rec.tilt_y );
    ux_pointer_stats.tilt_azimuth.innerText = format4_1( ptr_rec.tilt_azimuth );
    ux_pointer_stats.tilt_altitude.innerText = format4_1( ptr_rec.tilt_altitude );

    ux_pointer_stats.tilt_x_processed.innerText = format4_1( ptr_rec.tilt_x_processed );
    ux_pointer_stats.tilt_y_processed.innerText = format4_1( ptr_rec.tilt_y_processed );
    ux_pointer_stats.tilt_azimuth_processed.innerText = format4_1( ptr_rec.tilt_azimuth_processed );
    ux_pointer_stats.tilt_altitude_processed.innerText = format4_1( ptr_rec.tilt_altitude_processed );

    ux_pointer_stats.pos_x_canvas.innerText = format4_1( ptr_rec.canvas_pos_x ) ;

    ux_pointer_stats.pos_y_canvas.innerText = format4_1( ptr_rec.canvas_pos_y );

    ux_pointer_stats.pos_x_canvas_raw.innerText = format4_1( ptr_rec.canvas_pos_x_raw );

    ux_pointer_stats.pos_y_canvas_raw.innerText = format4_1( ptr_rec.canvas_pos_y_raw );

    ux_pointer_stats.barrel_rotation.innerText = ptr_rec.barrel_rotation.toString();

    if (paint_state.canvas_pos_old != null)
    {
        var dx =  ptr_rec.canvas_pos_x - paint_state.canvas_pos_old_all_events.x;
        var dy =  ptr_rec.canvas_pos_y - paint_state.canvas_pos_old_all_events.y;

        if (paint_state.time_old!=null)
        {
            var dt = (ptr_rec.time - paint_state.time_old)/1000;
            if (dt>0)
            {

                var dist = Math.hypot( dx, dy);
                var speed = velocitySmoother.apply( dist/dt ) ;
                var direction = Math.atan2(dy, dx) * 180 / Math.PI;
                if (direction <0)
                {
                    direction = 359 + direction;
                }
                ux_pointer_stats.velocity.innerText = format4_1(speed);
                ux_pointer_stats.direction.innerText = format4_1(direction);

            }


        }

    }


    if (ptr_rec.pressure_processed > 0) {
        ux_pointer_stats.size.innerText =
            paint_current_dab_settings.brush_size.toString() + "px";
    } else {
        ux_pointer_stats.size.innerText = "xxx";
    }
}



// BRUSH SETTINGS -----------------------------------


var ux_paint_brush_settings = {
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


var velocitySmoother = new NumericSmoother();
velocitySmoother.setSmoothingAmount(0.5);





function update_paint_settings() {
 
  // BRUSH FORMAT
  paint_settings.brush_size_control = ux_paint_brush_settings.brush_size.value;
  var brush_size = parseInt(ux_pointer_stats.brush_size.value);
  paint_settings.brush_size = brush_size;
  paint_settings.brush_color_control = ux_paint_brush_settings.brush_color.value;

  // POSITION
  paint_settings.pos_x_smoothing.amount = GetSmoothingValue(ux_paint_brush_settings.position_smoothing.value);
  paint_settings.pos_y_smoothing.amount = paint_settings.pos_x_smoothing.amount;

  // PRESSURE
  paint_settings.pressure_smoothing.amount = GetSmoothingValue(ux_paint_brush_settings.pressure_smoothing.value);
  paint_settings.pressure_curve.setCurveAmount(  parseFloat(ux_paint_brush_settings.pressureCurveAmountSlider.value) ) ;
  paint_settings.pressure_quant = parseInt(ux_paint_brush_settings.pressure_quant.value ) ;


  // TILT
  paint_settings.tilt_x_smoothing.amount = GetSmoothingValue(ux_paint_brush_settings.tilt_smoothing.value);
  paint_settings.tilt_y_smoothing.amount = GetSmoothingValue(ux_paint_brush_settings.tilt_smoothing.value);
  paint_settings.tilt_altitude_smoothing.amount = GetSmoothingValue(ux_paint_brush_settings.tilt_smoothing.value);
  paint_settings.tilt_azimuth_smoothing.amount = GetSmoothingValue(ux_paint_brush_settings.tilt_smoothing.value);

  // TODO: The lines below updated UI from the settings which is
  // the opposite of what is supposed to happen in this method.
  // Move somewhere else
  ux_pointer_stats.position_smoothing.innerText = paint_settings.pos_x_smoothing.amount.toString();
  ux_pointer_stats.pressure_smoothing.innerText = paint_settings.pressure_smoothing.amount.toString();
  ux_pointer_stats.pressure_curve_amount.innerText = paint_settings.pressure_curve.amount.toFixed(1);

  drawPressureCurve();
}



function clear_ux_pointer_stats() {
  const empty = "-";
  ux_pointer_stats.buttons.innerText = empty;
  ux_pointer_stats.pos_x_canvas.innerText = empty;
  ux_pointer_stats.pos_y_canvas.innerText = empty;
  ux_pointer_stats.pos_x_canvas_raw.innerText = empty;
  ux_pointer_stats.pos_y_canvas_raw.innerText = empty;
  ux_pointer_stats.size.innerText = empty;
  ux_pointer_stats.pressure_raw.innerText = empty;
  ux_pointer_stats.pressure_processed.innerText = empty;
  ux_pointer_stats.barrel_rotation.innerText = empty;

  ux_pointer_stats.tilt_x.innerText = empty;
  ux_pointer_stats.tilt_y.innerText = empty;
  ux_pointer_stats.tilt_altitude.innerText = empty;
  ux_pointer_stats.tilt_azimuth.innerText = empty;

  ux_pointer_stats.tilt_x_processed.innerText = empty;
  ux_pointer_stats.tilt_y_processed.innerText = empty;
  ux_pointer_stats.tilt_altitude_processed.innerText = empty;
  ux_pointer_stats.tilt_azimuth_processed.innerText = empty;

  ux_pointer_stats.velocity.innerText = empty;
  ux_pointer_stats.direction.innerText= empty;

}