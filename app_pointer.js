
const pointer_button_code = {
    none: 0x0, // nothing is pressed
    tip: 0x1, // left mouse, touch contact, pen contact
    barrel: 0x2, // right mouse, pen barrel button
    middle: 0x4, // middle mouse
    eraser: 0x20, // pen eraser button
};

const pointer_constants =
{
    max_tilt_altitude : 90.0,
    max_tilt_azimuth:  360.0,
    max_tilt_x : 60.0,
    max_tilt_y: 60.0,
}

function buttonToString(button) {
    if (button === pointer_button_code.none) {
        return "none";
    } else if (button === pointer_button_code.tip) {
        return "pen tip";
    } else if (button === pointer_button_code.barrel) {
        return "pen button";
    } else if (button === pointer_button_code.middle) {
        return "middle mouse";
    } else if (button === pointer_button_code.eraser) {
        return "eraser";
    } else {
        return "unknown";
    }
}

function isTargetPointerEvent(ptr_event) {
    return (
        ptr_event.pointerType === "mouse" ||
        ptr_event.pointerType === "pen" ||
        ptr_event.pointerType === "touch"
    );
}

function defaultPtrEventHandlerDoNothing(ptr_event) {
    // do nothing
}

/////////////////////////////////////////////////////////////////////////
// Handle drawing for HTML5 Pointer Events.
//
function pointerEventHandler(ptr_event) {
    // Ignore events we don't care about
    if (!isTargetPointerEvent(ptr_event)) {
        return;
    }

    // The paint system needs to know the dimensions of the canvas it will draw on
    const canvas_rect = app_canvas_el.getBoundingClientRect();
    // given the canvas and the pointer event the paint_rec
    // has all the information needed to draw
    const ptr_rec = getPtrRec(canvas_rect, ptr_event);

    // Live stats such as pointer position need to updated
    updateUxPointerStats(ptr_rec);
    // perform the actual paint
    paintDab(ptr_rec);

    paint_state.canvas_pos_old_all_events = new Position(ptr_rec.canvas_pos_x_processed, ptr_rec.canvas_pos_y_processed);
    paint_state.time_old = ptr_rec.time;
}

function onPointerUp(ptr_event) {
    paintStrokeStop();
    updateUxStrokeStats();
}

function onPointerEnter(ptr_event) {
    document.body.style.cursor = "crosshair";
}

function onPointerLeave(ptr_event) {
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

    app_canvas_el.addEventListener("pointerdown", pointerEventHandler, false);
    app_canvas_el.addEventListener("pointerup", onPointerUp, false);

    app_canvas_el.addEventListener("pointercancel", pointerEventHandler, false);
    app_canvas_el.addEventListener("pointermove", pointerEventHandler, false);

    app_canvas_el.addEventListener(
        "pointerover",
        defaultPtrEventHandlerDoNothing,
        false
    );

    app_canvas_el.addEventListener(
        "pointerout",
        defaultPtrEventHandlerDoNothing,
        false
    );

    app_canvas_el.addEventListener("pointerenter", onPointerEnter, false);
    app_canvas_el.addEventListener("pointerleave", onPointerLeave, false);

    app_canvas_el.addEventListener(
        "gotpointercapture",
        defaultPtrEventHandlerDoNothing,
        false
    );
    app_canvas_el.addEventListener(
        "lostpointercapture",
        defaultPtrEventHandlerDoNothing,
        false
    );
}

function getPtrRec(canvas_rect, ptr_event) {
    paint_stroke_stats.ptrevent_count = paint_stroke_stats.ptrevent_count + 1;
    return new PointerRecord(canvas_rect, ptr_event);
}

function processPressure(input_pressure) {
    var output_pressure = input_pressure;
    // FIRST QUANTIZE
    if (processing_settings.pressure_quant > 0) {
        output_pressure = quantize(input_pressure, processing_settings.pressure_quant);
    }

    // SECOND APPLY A CURVE
    output_pressure = processing_settings.pressure_curve_amount.apply(output_pressure);

    // THIRD APPLY SMOOTHING (negative old values mean there is no old value)
    output_pressure = processing_settings.pressure_smoother.apply(output_pressure);


    return output_pressure;
}