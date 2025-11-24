// POINTER STATS ----------------------------------------------
const uxPointerStats = {
    buttons: document.getElementById("buttonsVal"),
    pressureProcessed: document.getElementById("pressureProcessedVal"),

    tiltXProcessed: document.getElementById("tiltXProcessedVal"),
    tiltYProcessed: document.getElementById("tiltYProcessedVal"),
    tiltAzimuthProcessed: document.getElementById("tiltAzimuthProcessedVal"),
    tiltAltitudeProcessed: document.getElementById("tiltAltitudeProcessedVal"),

    posXCanvasProcessed: document.getElementById("posXVal"),
    posYCanvasProcessed: document.getElementById("posYVal"),

    velocity: document.getElementById("velocityVal"),
    direction: document.getElementById("directionVal"),

    brushSize: document.getElementById("brushSizeSelect"),
    barrelRotation: document.getElementById("barrelRotationVal"),

    size: document.getElementById("sizeVal"),

};

function updateUxPointerStats(ptrRec) {
    uxPointerStats.buttons.innerText = ptrRec.buttons + " (" + buttonToString(ptrRec.buttons) + ")";

    uxPointerStats.pressureProcessed.innerText = format1Digit4Decimals(ptrRec.pressureProcessed);
    uxPointerStats.tiltXProcessed.innerText = format4Digits1Decimal(ptrRec.tiltXProcessed);
    uxPointerStats.tiltYProcessed.innerText = format4Digits1Decimal(ptrRec.tiltYProcessed);
    uxPointerStats.tiltAzimuthProcessed.innerText = format4Digits1Decimal(ptrRec.tiltAzimuthProcessed);
    uxPointerStats.tiltAltitudeProcessed.innerText = format4Digits1Decimal(ptrRec.tiltAltitudeProcessed);
    uxPointerStats.posXCanvasProcessed.innerText = format4Digits1Decimal(ptrRec.canvasPosXProcessed);
    uxPointerStats.posYCanvasProcessed.innerText = format4Digits1Decimal(ptrRec.canvasPosYProcessed);
    uxPointerStats.barrelRotation.innerText = ptrRec.barrelRotation.toString();

    if (ptrRec.velocity>0) {
        uxPointerStats.velocity.innerText = format4Digits1Decimal(ptrRec.velocity);
        uxPointerStats.direction.innerText = format4Digits1Decimal(ptrRec.direction);
    }

    if (ptrRec.pressureProcessed > 0) {
        uxPointerStats.size.innerText =
            paintCurrentDabSettings.brushSize.toString() + "px";
    } else {
        uxPointerStats.size.innerText = "xxx";
    }
}


function clearUxPointerStats() {
    const empty = "-";
    uxPointerStats.buttons.innerText = empty;

    uxPointerStats.posXCanvasProcessed.innerText = "\u00a0---.-";
    uxPointerStats.posYCanvasProcessed.innerText = "\u00a0---.-";
    uxPointerStats.size.innerText = empty;
    uxPointerStats.pressureProcessed.innerText = "-.----";
    uxPointerStats.barrelRotation.innerText = empty;

    uxPointerStats.tiltXProcessed.innerText = "\u00a0\u00a0\u00a0-.-";
    uxPointerStats.tiltYProcessed.innerText = "\u00a0\u00a0\u00a0-.-";
    uxPointerStats.tiltAltitudeProcessed.innerText = "\u00a0\u00a0--.-";
    uxPointerStats.tiltAzimuthProcessed.innerText = "\u00a0\u00a0--.-";

    uxPointerStats.velocity.innerText = "\u00a0---.-";
    uxPointerStats.direction.innerText = "\u00a0---.-";

}