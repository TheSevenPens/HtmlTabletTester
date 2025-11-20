let ux_processing_settings = {
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

function updateProcessingSettingsFromUx() {
    // POSITION
    processing_settings.pos_x_smoother.amount = getSmoothingValue(ux_processing_settings.position_smoothing_slider.value);
    processing_settings.pos_y_smoother.amount = processing_settings.pos_x_smoother.amount;

    // PRESSURE
    processing_settings.pressure_smoother.amount = getSmoothingValue(ux_processing_settings.pressure_smoothing_slider.value);
    processing_settings.pressure_curve_amount.setCurveAmount(parseFloat(ux_processing_settings.pressureCurveAmountSlider.value));
    processing_settings.pressure_quant = parseInt(ux_processing_settings.pressure_quantization_dropdown.value);

    // TILT
    const tilt_smoothing = ux_processing_settings.tilt_smoothing_slider.value;
    processing_settings.tilt_x_smoother.amount = getSmoothingValue(tilt_smoothing);
    processing_settings.tilt_y_smoother.amount = getSmoothingValue(tilt_smoothing);
    processing_settings.tilt_altitude_smoother.amount = getSmoothingValue(tilt_smoothing);
    processing_settings.tilt_azimuth_smoother.amount = getSmoothingValue(tilt_smoothing);

    updateUxFromProcessingSettings();

}

function updateUxFromProcessingSettings() {
    ux_processing_settings.position_smoothing_value.innerText = processing_settings.pos_x_smoother.amount.toString();
    ux_processing_settings.pressure_smoothing_value.innerText = processing_settings.pressure_smoother.amount.toString();
    ux_processing_settings.pressure_curve_amount_value.innerText = processing_settings.pressure_curve_amount.amount.toFixed(1);
    ux_processing_settings.tilt_smoothing_value.innerText = processing_settings.tilt_x_smoother.amount.toString();
    drawPressureCurve();
    
    // Update pressure label color based on pressure processing settings
    updatePressureLabelColor();
    
    // Update tilt label colors based on tilt smoothing
    updateTiltLabelColors();
    
    // Update position label colors based on position smoothing
    updatePositionLabelColors();
}

function updatePressureLabelColor() {
    const pressureLabel = document.getElementById("pressureLabel");
    if (!pressureLabel) return;
    
    // Check if any pressure processing is active
    const pressureSmoothing = parseFloat(ux_processing_settings.pressure_smoothing_slider.value);
    const pressureQuant = parseInt(ux_processing_settings.pressure_quantization_dropdown.value);
    const pressureCurve = parseFloat(ux_processing_settings.pressure_curve_amount_slider.value);
    
    const isProcessingActive = 
        pressureSmoothing > 0 || 
        pressureQuant !== 0 || 
        pressureCurve !== 0;
    
    pressureLabel.style.color = isProcessingActive ? "red" : "";
}

function updateTiltLabelColors() {
    const tiltXLabel = document.getElementById("tiltXLabel");
    const tiltYLabel = document.getElementById("tiltYLabel");
    const tiltAzimuthLabel = document.getElementById("tiltAzimuthLabel");
    const tiltAltitudeLabel = document.getElementById("tiltAltitudeLabel");
    
    if (!tiltXLabel || !tiltYLabel || !tiltAzimuthLabel || !tiltAltitudeLabel) return;
    
    // Check if tilt smoothing is enabled
    const tiltSmoothing = parseFloat(ux_processing_settings.tilt_smoothing_slider.value);
    const isSmoothingActive = tiltSmoothing > 0;
    
    const color = isSmoothingActive ? "red" : "";
    tiltXLabel.style.color = color;
    tiltYLabel.style.color = color;
    tiltAzimuthLabel.style.color = color;
    tiltAltitudeLabel.style.color = color;
}

function updatePositionLabelColors() {
    const posXLabel = document.getElementById("posXLabel");
    const posYLabel = document.getElementById("posYLabel");
    
    if (!posXLabel || !posYLabel) return;
    
    // Check if position smoothing is enabled
    const positionSmoothing = parseFloat(ux_processing_settings.position_smoothing_slider.value);
    const isSmoothingActive = positionSmoothing > 0;
    
    const color = isSmoothingActive ? "red" : "";
    posXLabel.style.color = color;
    posYLabel.style.color = color;
}
