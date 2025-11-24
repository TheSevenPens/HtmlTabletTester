let uxProcessingSettings = {
    pressureCurveAmountSlider: document.getElementById(
        "pressureCurveAmountSlider"
    ),
    positionSmoothingSlider: document.getElementById("positionSmoothingSlider"),
    positionSmoothingValue: document.getElementById("positionSmoothingValue"),
    pressureSmoothingSlider: document.getElementById("pressureSmoothingSlider"),
    pressureSmoothingValue: document.getElementById("pressureSmoothingValue"),
    pressureCurveAmountValue: document.getElementById("pressureCurveAmountValue"),
    tiltSmoothingSlider: document.getElementById("tiltSmoothingSlider"),
    tiltSmoothingValue: document.getElementById("tiltSmoothingValue"),
    pressureQuantizationDropdown: document.getElementById("pressureQuantSelect"),
};

function updateProcessingSettingsFromUx() {
    // POSITION
    processingSettings.posXSmoother.amount = getSmoothingValue(uxProcessingSettings.positionSmoothingSlider.value);
    processingSettings.posYSmoother.amount = processingSettings.posXSmoother.amount;

    // PRESSURE
    processingSettings.pressureSmoother.amount = getSmoothingValue(uxProcessingSettings.pressureSmoothingSlider.value);
    processingSettings.pressureCurveAmount.setCurveAmount(parseFloat(uxProcessingSettings.pressureCurveAmountSlider.value));
    processingSettings.pressureQuant = parseInt(uxProcessingSettings.pressureQuantizationDropdown.value);

    // TILT
    const tiltSmoothing = uxProcessingSettings.tiltSmoothingSlider.value;
    processingSettings.tiltXSmoother.amount = getSmoothingValue(tiltSmoothing);
    processingSettings.tiltYSmoother.amount = getSmoothingValue(tiltSmoothing);
    processingSettings.tiltAltitudeSmoother.amount = getSmoothingValue(tiltSmoothing);
    processingSettings.tiltAzimuthSmoother.amount = getSmoothingValue(tiltSmoothing);

    updateUxFromProcessingSettings();

}

function updateUxFromProcessingSettings() {
    uxProcessingSettings.positionSmoothingValue.innerText = processingSettings.posXSmoother.amount.toString();
    uxProcessingSettings.pressureSmoothingValue.innerText = processingSettings.pressureSmoother.amount.toString();
    uxProcessingSettings.pressureCurveAmountValue.innerText = processingSettings.pressureCurveAmount.amount.toFixed(1);
    uxProcessingSettings.tiltSmoothingValue.innerText = processingSettings.tiltXSmoother.amount.toString();
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
    const pressureSmoothing = parseFloat(uxProcessingSettings.pressureSmoothingSlider.value);
    const pressureQuant = parseInt(uxProcessingSettings.pressureQuantizationDropdown.value);
    const pressureCurve = parseFloat(uxProcessingSettings.pressureCurveAmountSlider.value);
    
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
    const tiltSmoothing = parseFloat(uxProcessingSettings.tiltSmoothingSlider.value);
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
    const positionSmoothing = parseFloat(uxProcessingSettings.positionSmoothingSlider.value);
    const isSmoothingActive = positionSmoothing > 0;
    
    const color = isSmoothingActive ? "red" : "";
    posXLabel.style.color = color;
    posYLabel.style.color = color;
}
