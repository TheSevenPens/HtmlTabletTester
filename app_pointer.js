
const pointerButtonCode = {
    none: 0x0, // nothing is pressed
    tip: 0x1, // left mouse, touch contact, pen contact
    barrel: 0x2, // right mouse, pen barrel button
    middle: 0x4, // middle mouse
    eraser: 0x20, // pen eraser button
};

const pointerConstants =
{
    maxTiltAltitude : 90.0,
    maxTiltAzimuth:  360.0,
    maxTiltX : 60.0,
    maxTiltY: 60.0,
}

function buttonToString(button) {
    if (button === pointerButtonCode.none) {
        return "none";
    } else if (button === pointerButtonCode.tip) {
        return "pen tip";
    } else if (button === pointerButtonCode.barrel) {
        return "pen button";
    } else if (button === pointerButtonCode.middle) {
        return "middle mouse";
    } else if (button === pointerButtonCode.eraser) {
        return "eraser";
    } else {
        return "unknown";
    }
}

function isTargetPointerEvent(ptrEvent) {
    return (
        ptrEvent.pointerType === "mouse" ||
        ptrEvent.pointerType === "pen" ||
        ptrEvent.pointerType === "touch"
    );
}

function defaultPtrEventHandlerDoNothing(ptrEvent) {
    // do nothing
}

/////////////////////////////////////////////////////////////////////////
// Handle drawing for HTML5 Pointer Events.
//
function pointerEventHandler(ptrEvent) {
    // Ignore events we don't care about
    if (!isTargetPointerEvent(ptrEvent)) {
        return;
    }

    // The paint system needs to know the dimensions of the canvas it will draw on
    const canvasRect = appCanvasEl.getBoundingClientRect();
    // given the canvas and the pointer event the paint_rec
    // has all the information needed to draw
    const ptrRec = getPtrRec(canvasRect, ptrEvent);

    // Live stats such as pointer position need to updated
    updateUxPointerStats(ptrRec);
    // perform the actual paint
    paintDab(ptrRec);

    paintState.canvasPosOldAllEvents = new Position(ptrRec.canvasPosXProcessed, ptrRec.canvasPosYProcessed);
    paintState.timeOld = ptrRec.time;
}

function onPointerUp(ptrEvent) {
    paintStrokeStop();
    updateUxStrokeStats();
}

function onPointerEnter(ptrEvent) {
    document.body.style.cursor = "crosshair";
}

function onPointerLeave(ptrEvent) {
    document.body.style.cursor = "default";
    clearUxPointerStats();
}

function registerWindowLoadEventListeners() {
    if (!window.PointerEvent) {
        console.log("INFO: Browser DOES NOT support pointer events");
        return;
    }

    // pointerover -> handled
    // pointerenter -> not handled
    // pointerdown -> handled
    // pointermove -> handled
    // pointerup -> handled
    // pointercancel -> handled
    // pointerout -> handled
    // pointerleave -> not handled
    // pointerrawupdate -> not handled
    // gotpointercapture -> not handled
    // lostpointercapture -> not handled

    appCanvasEl.addEventListener("pointerdown", pointerEventHandler, false);
    appCanvasEl.addEventListener("pointerup", onPointerUp, false);

    appCanvasEl.addEventListener("pointercancel", pointerEventHandler, false);
    appCanvasEl.addEventListener("pointermove", pointerEventHandler, false);

    appCanvasEl.addEventListener(
        "pointerover",
        defaultPtrEventHandlerDoNothing,
        false
    );

    appCanvasEl.addEventListener(
        "pointerout",
        defaultPtrEventHandlerDoNothing,
        false
    );

    appCanvasEl.addEventListener("pointerenter", onPointerEnter, false);
    appCanvasEl.addEventListener("pointerleave", onPointerLeave, false);

    appCanvasEl.addEventListener(
        "gotpointercapture",
        defaultPtrEventHandlerDoNothing,
        false
    );
    appCanvasEl.addEventListener(
        "lostpointercapture",
        defaultPtrEventHandlerDoNothing,
        false
    );
}

function getPtrRec(canvasRect, ptrEvent) {
    paintStrokeStats.ptreventCount = paintStrokeStats.ptreventCount + 1;
    return new PointerRecord(canvasRect, ptrEvent);
}

function processPressure(inputPressure) {
    var outputPressure = inputPressure;
    // FIRST QUANTIZE
    if (processingSettings.pressureQuant > 0) {
        outputPressure = quantize(inputPressure, processingSettings.pressureQuant);
    }

    // SECOND APPLY A CURVE
    outputPressure = processingSettings.pressureCurveAmount.apply(outputPressure);

    // THIRD APPLY SMOOTHING (negative old values mean there is no old value)
    outputPressure = processingSettings.pressureSmoother.apply(outputPressure);


    return outputPressure;
}