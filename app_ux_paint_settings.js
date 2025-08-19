var ux_paint_settings = {
    brush_size: document.getElementById("brushSizeControlSelect"),
    brush_color: document.getElementById("brushColorControlSelect"),
};

var ux_pointer_settings = {
    pressureCurveAmountSlider: document.getElementById(
        "pressureCurveAmountSlider"
    ),
    position_smoothing_slider: document.getElementById("positionSmoothingSlider"),
    position_smoothing_value: document.getElementById("positionSmoothingValue"),
    pressure_smoothing_slider: document.getElementById("pressureSmoothingSlider"),
    pressure_smoothing_value: document.getElementById("pressureSmoothingValue"),
    pressure_curve_amount_slider: document.getElementById("pressureCurveAmountSlider"),
    pressure_curve_amount_value: document.getElementById("pressureCurveAmountValue"),
    tilt_smoothing_slider: document.getElementById("tiltSmoothingSlider"),
    tilt_smoothing_value: document.getElementById("tiltSmoothingValue"),
    pressure_quantization_dropdown: document.getElementById("pressureQuantSelect"),
};


function update_settings_from_ux() {
    update_paint_settings_from_ux();
    update_pointer_settings_from_ux();
}

function update_paint_settings_from_ux() {
    paint_settings.brush_size_control = ux_paint_settings.brush_size.value;
    paint_settings.brush_size = parseInt(ux_pointer_stats.brush_size.value);
    paint_settings.brush_color_control = ux_paint_settings.brush_color.value;
}

function update_pointer_settings_from_ux() {
    // POSITION
    pointer_settings.pos_x_smoother.amount = GetSmoothingValue(ux_pointer_settings.position_smoothing_slider.value);
    pointer_settings.pos_y_smoother.amount = pointer_settings.pos_x_smoother.amount;

    // PRESSURE
    pointer_settings.pressure_smoother.amount = GetSmoothingValue(ux_pointer_settings.pressure_smoothing_slider.value);
    pointer_settings.pressure_curve_amount.setCurveAmount(parseFloat(ux_pointer_settings.pressureCurveAmountSlider.value));
    pointer_settings.pressure_quant = parseInt(ux_pointer_settings.pressure_quantization_dropdown.value);

    // TILT
    var tilt_smoothing = ux_pointer_settings.tilt_smoothing_slider.value;
    pointer_settings.tilt_x_smoother.amount = GetSmoothingValue(tilt_smoothing);
    pointer_settings.tilt_y_smoother.amount = GetSmoothingValue(tilt_smoothing);
    pointer_settings.tilt_altitude_smoother.amount = GetSmoothingValue(tilt_smoothing);
    pointer_settings.tilt_azimuth_smoother.amount = GetSmoothingValue(tilt_smoothing);

    update_ux_from_pointer_settings();

}
function update_ux_from_pointer_settings() {
    ux_pointer_settings.position_smoothing_value.innerText = pointer_settings.pos_x_smoother.amount.toString();
    ux_pointer_settings.pressure_smoothing_value.innerText = pointer_settings.pressure_smoother.amount.toString();
    ux_pointer_settings.pressure_curve_amount_value.innerText = pointer_settings.pressure_curve_amount.amount.toFixed(1);
    ux_pointer_settings.tilt_smoothing_value.innerText = pointer_settings.tilt_x_smoother.amount.toString();
    drawPressureCurve();
}

