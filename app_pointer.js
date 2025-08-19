var EPenButton = {
    none: 0x0, // nothing is pressed
    tip: 0x1, // left mouse, touch contact, pen contact
    barrel: 0x2, // right mouse, pen barrel button
    middle: 0x4, // middle mouse
    eraser: 0x20, // pen eraser button
};

const max_tilt_altitude = 90.0;
const max_tilt_azimuth = 360.0;
const max_tilt_x = 60.0;
const max_tilt_y = 60.0;


function button_to_string(button) {
    if (button == EPenButton.none) {
        return "none";
    } else if (button === EPenButton.tip) {
        return "pen tip";
    } else if (button === EPenButton.barrel) {
        return "pen button";
    } else if (button === EPenButton.middle) {
        return "middle mouse";
    } else if (button === EPenButton.eraser) {
        return "eraser";
    } else {
        return "unknown";
    }
}

function is_target_pointer_event(ptr_event) {
    return (
        ptr_event.pointerType === "mouse" ||
        ptr_event.pointerType === "pen" ||
        ptr_event.pointerType === "touch"
    );
}

function default_ptr_event_handler_do_nothing(ptr_event) {
    // do nothing
}

/////////////////////////////////////////////////////////////////////////
// Handle drawing for HTML5 Pointer Events.
//
function pointer_event_handler(ptr_event) {
    // Ignore events we don't care about
    if (!is_target_pointer_event(ptr_event)) {
        return;
    }

    // The paint system needs to know the dimensions of the canvas it will draw on
    var canvas_rect = app_canvas_el.getBoundingClientRect();
    // given the canvas and the pointer event the paint_rec
    // has all the information needed to draw
    var ptr_rec = get_ptr_rec(canvas_rect, ptr_event);

    // Live stats such as pointer position need to updated
    update_ux_pointer_stats(ptr_rec);
    // perform the actual paint
    paint_dab(ptr_rec);

    paint_state.canvas_pos_old_all_events = new Position(ptr_rec.canvas_pos_x, ptr_rec.canvas_pos_y);
    paint_state.time_old = ptr_rec.time;
}

function on_pointerup(ptr_event) {
    paint_stroke_stop();
    update_ux_stroke_stats();
}

function on_pointerenter(ptr_event) {
    document.body.style.cursor = "crosshair";
}

function on_pointerleave(ptr_event) {
    document.body.style.cursor = "default";
    clear_ux_pointer_stats();
}

function register_window_load_event_listeners() {
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

    console.log("INFO: Browser DOES support pointer events");

    app_canvas_el.addEventListener("pointerdown", pointer_event_handler, false);
    app_canvas_el.addEventListener("pointerup", on_pointerup, false);

    app_canvas_el.addEventListener("pointercancel", pointer_event_handler, false);
    app_canvas_el.addEventListener("pointermove", pointer_event_handler, false);

    app_canvas_el.addEventListener(
        "pointerover",
        default_ptr_event_handler_do_nothing,
        false
    );

    app_canvas_el.addEventListener(
        "pointerout",
        default_ptr_event_handler_do_nothing,
        false
    );

    app_canvas_el.addEventListener("pointerenter", on_pointerenter, false);
    app_canvas_el.addEventListener("pointerleave", on_pointerleave, false);

    app_canvas_el.addEventListener(
        "gotpointercapture",
        default_ptr_event_handler_do_nothing,
        false
    );
    app_canvas_el.addEventListener(
        "lostpointercapture",
        default_ptr_event_handler_do_nothing,
        false
    );
}

class PointerRecord {
    constructor(canvas_rect, ptr_event) {
        var canvas_rect = app_canvas_el.getBoundingClientRect();

        // get the pressure reported in the event
        // if it is pointer pen event, just use that pressure
        // if it is any other kind of event, then just the maximum pressure
        const pressure_raw = clamp_to_range(ptr_event.pressure, PRESSURE_RANGE);

        const canvas_pos_x_raw = ptr_event.clientX - canvas_rect.left;
        const canvas_pos_y_raw = ptr_event.clientY - canvas_rect.top;

        this.type = ptr_event.type;
        this.buttons = ptr_event.buttons;
        this.pointer_type = ptr_event.pointerType;

        this.screen_pos_x = ptr_event.clientX;
        this.screen_pos_y = ptr_event.clientY;

        this.canvas_pos_x_raw = canvas_pos_x_raw;
        this.canvas_pos_y_raw = canvas_pos_y_raw;

        this.canvas_pos_x = paint_settings.pos_x_smoother.apply(canvas_pos_x_raw);
        this.canvas_pos_y = paint_settings.pos_y_smoother.apply(canvas_pos_y_raw);

        this.pressure_raw = pressure_raw;
        this.pressure_processed = process_pressure(pressure_raw);

        this.buttons = ptr_event.buttons;

        this.tilt_x = ptr_event.tiltX;
        this.tilt_y = ptr_event.tiltY;

        this.tilt_azimuth = radians_to_degrees(ptr_event.azimuthAngle);
        this.tilt_altitude = radians_to_degrees(ptr_event.altitudeAngle);

        this.tilt_x_processed = paint_settings.tilt_x_smoother.apply(ptr_event.tiltX);
        this.tilt_y_processed = paint_settings.tilt_y_smoother.apply(ptr_event.tiltY);

        this.tilt_azimuth_processed = tiltxy_to_tiltazimuth(this.tilt_x_processed, this.tilt_y_processed);
        this.tilt_altitude_processed = tiltxy_to_tiltangle(this.tilt_x_processed, this.tilt_y_processed);

        this.barrel_rotation = ptr_event.twist;

        this.time = performance.now();

        this.velocity = 0;
        this.direction = 0;

        if (paint_state.canvas_pos_old != null) {
            var dx = this.canvas_pos_x - paint_state.canvas_pos_old_all_events.x;
            var dy = this.canvas_pos_y - paint_state.canvas_pos_old_all_events.y;

            if (paint_state.time_old != null) {
                const dt = (this.time - paint_state.time_old) / 1000.0;
                if (dt > 0) {

                    const dist = Math.hypot(dx, dy);
                    const raw_speed = dist / dt;
                    const smoothed_speed = paint_settings.velocity_smoother.apply(raw_speed);
                    var direction = Math.atan2(dy, dx) * 180.0 / Math.PI;
                    if (direction < 0) {
                        direction = 359 + direction;
                    }

                    this.velocity = smoothed_speed;
                    this.direction = direction;

                }
            }

        }

    }
}

function get_ptr_rec(canvas_rect, ptr_event) {
    paint_stroke_stats.ptrevent_count = paint_stroke_stats.ptrevent_count + 1;
    return new PointerRecord(canvas_rect, ptr_event);
}

function process_pressure(input_pressure) {
    var output_pressure = input_pressure;
    // FIRST QUANTIZE
    if (paint_settings.pressure_quant > 0) {
        output_pressure = quantize(input_pressure, paint_settings.pressure_quant);
    }

    // SECOND APPLY A CURVE
    output_pressure = paint_settings.pressure_curve_amount.apply(output_pressure);

    // THIRD APPLY SMOOTHING (negative old values mean there is no old value)
    output_pressure = paint_settings.pressure_smoother.apply(output_pressure);


    return output_pressure;
}