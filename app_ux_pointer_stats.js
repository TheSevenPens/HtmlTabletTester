// POINTER STATS ----------------------------------------------
var ux_pointer_stats = {
    buttons: document.getElementById("buttonsVal"),
    pressure_processed: document.getElementById("pressureProcessedVal"),

    tilt_x_processed: document.getElementById("tiltXProcessedVal"),
    tilt_y_processed: document.getElementById("tiltYProcessedVal"),
    tilt_azimuth_processed: document.getElementById("tiltAzimuthProcessedVal"),
    tilt_altitude_processed: document.getElementById("tiltAltitudeProcessedVal"),

    pos_x_canvas_processed: document.getElementById("posXVal"),
    pos_y_canvas_processed: document.getElementById("posYVal"),

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

    ux_pointer_stats.pressure_processed.innerText = format1_4(ptr_rec.pressure_processed);
    ux_pointer_stats.tilt_x_processed.innerText = format4_1(ptr_rec.tilt_x_processed);
    ux_pointer_stats.tilt_y_processed.innerText = format4_1(ptr_rec.tilt_y_processed);
    ux_pointer_stats.tilt_azimuth_processed.innerText = format4_1(ptr_rec.tilt_azimuth_processed);
    ux_pointer_stats.tilt_altitude_processed.innerText = format4_1(ptr_rec.tilt_altitude_processed);
    ux_pointer_stats.pos_x_canvas_processed.innerText = format4_1(ptr_rec.canvas_pos_x_processed);
    ux_pointer_stats.pos_y_canvas_processed.innerText = format4_1(ptr_rec.canvas_pos_y_processed);
    ux_pointer_stats.barrel_rotation.innerText = ptr_rec.barrel_rotation.toString();

    if (ptr_rec.velocity>0) {
        ux_pointer_stats.velocity.innerText = format4_1(ptr_rec.velocity);
        ux_pointer_stats.direction.innerText = format4_1(ptr_rec.direction);
    }

    if (ptr_rec.pressure_processed > 0) {
        ux_pointer_stats.size.innerText =
            paint_current_dab_settings.brush_size.toString() + "px";
    } else {
        ux_pointer_stats.size.innerText = "xxx";
    }
}


function clear_ux_pointer_stats() {
    const empty = "-";
    ux_pointer_stats.buttons.innerText = empty;

    ux_pointer_stats.pos_x_canvas_processed.innerText = empty;
    ux_pointer_stats.pos_y_canvas_processed.innerText = empty;
    ux_pointer_stats.size.innerText = empty;
    ux_pointer_stats.pressure_processed.innerText = empty;
    ux_pointer_stats.barrel_rotation.innerText = empty;

    ux_pointer_stats.tilt_x_processed.innerText = empty;
    ux_pointer_stats.tilt_y_processed.innerText = empty;
    ux_pointer_stats.tilt_altitude_processed.innerText = empty;
    ux_pointer_stats.tilt_azimuth_processed.innerText = empty;

    ux_pointer_stats.velocity.innerText = empty;
    ux_pointer_stats.direction.innerText = empty;

}