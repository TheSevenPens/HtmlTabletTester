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

function update_ux_paint_settings() {

    // BRUSH FORMAT
    paint_settings.brush_size_control = ux_paint_brush_settings.brush_size.value;
    var brush_size = parseInt(ux_pointer_stats.brush_size.value);
    paint_settings.brush_size = brush_size;
    paint_settings.brush_color_control = ux_paint_brush_settings.brush_color.value;

    // POSITION
    paint_settings.pos_x_smoother.amount = GetSmoothingValue(ux_paint_brush_settings.position_smoothing.value);
    paint_settings.pos_y_smoother.amount = paint_settings.pos_x_smoother.amount;

    // PRESSURE
    paint_settings.pressure_smoother.amount = GetSmoothingValue(ux_paint_brush_settings.pressure_smoothing.value);
    paint_settings.pressure_curve_amount.setCurveAmount(parseFloat(ux_paint_brush_settings.pressureCurveAmountSlider.value));
    paint_settings.pressure_quant = parseInt(ux_paint_brush_settings.pressure_quant.value);


    // TILT
    paint_settings.tilt_x_smoother.amount = GetSmoothingValue(ux_paint_brush_settings.tilt_smoothing.value);
    paint_settings.tilt_y_smoothing.amount = GetSmoothingValue(ux_paint_brush_settings.tilt_smoothing.value);
    paint_settings.tilt_altitude_smoother.amount = GetSmoothingValue(ux_paint_brush_settings.tilt_smoothing.value);
    paint_settings.tilt_azimuth_smoothing.amount = GetSmoothingValue(ux_paint_brush_settings.tilt_smoothing.value);

    // TODO: The lines below updated UI from the settings which is
    // the opposite of what is supposed to happen in this method.
    // Move somewhere else
    ux_pointer_stats.position_smoothing.innerText = paint_settings.pos_x_smoother.amount.toString();
    ux_pointer_stats.pressure_smoothing.innerText = paint_settings.pressure_smoother.amount.toString();
    ux_pointer_stats.pressure_curve_amount.innerText = paint_settings.pressure_curve_amount.amount.toFixed(1);

    drawPressureCurve();
}

