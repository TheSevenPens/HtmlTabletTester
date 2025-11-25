const uxFormatSettings = {
    brushSize: document.getElementById("brushSizeControlSelect"),
    brushColor: document.getElementById("brushColorControlSelect"),
    eraseOnStrokeStart: document.getElementById("toggleEraseOnStartStrokeCheckbox"),
    minStrokeSize: document.getElementById("minStrokeSizeSelect")

};

function updateFormatSettingsFromUx() {
    paintSettings.brushSizeControl = uxFormatSettings.brushSize.value;
    paintSettings.brushSize = parseInt(uxPointerStats.brushSize.value);
    paintSettings.brushColorControl = uxFormatSettings.brushColor.value;
    paintSettings.minStrokeSize = parseFloat(uxFormatSettings.minStrokeSize.value);
}

