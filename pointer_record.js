 class PointerRecord {
    constructor(canvas_rect, ptr_event) {
        // get the pressure reported in the event
        // if it is pointer pen event, just use that pressure
        // if it is any other kind of event, then just the maximum pressure
        const pressure_raw = clamp_to_range(ptr_event.pressure, PRESSURE_RANGE);

        const canvas_pos_x_raw = ptr_event.offsetX;
        const canvas_pos_y_raw = ptr_event.offsetY;
        this.type = ptr_event.type;
        this.buttons = ptr_event.buttons;
        this.pointer_type = ptr_event.pointerType;

        this.screen_pos_x = ptr_event.clientX;
        this.screen_pos_y = ptr_event.clientY;

        this.canvas_pos_x_raw = canvas_pos_x_raw;
        this.canvas_pos_y_raw = canvas_pos_y_raw;

        this.canvas_pos_x_processed = processing_settings.pos_x_smoother.apply(canvas_pos_x_raw);
        this.canvas_pos_y_processed = processing_settings.pos_y_smoother.apply(canvas_pos_y_raw);

        this.pressure_raw = pressure_raw;
        this.pressure_processed = process_pressure(pressure_raw);

        this.buttons = ptr_event.buttons;

        this.tilt_x = ptr_event.tiltX;
        this.tilt_y = ptr_event.tiltY;

        this.tilt_azimuth = radians_to_degrees(ptr_event.azimuthAngle);
        this.tilt_altitude = radians_to_degrees(ptr_event.altitudeAngle);

        this.tilt_x_processed = processing_settings.tilt_x_smoother.apply(ptr_event.tiltX);
        this.tilt_y_processed = processing_settings.tilt_y_smoother.apply(ptr_event.tiltY);

        this.tilt_azimuth_processed = radians_to_degrees(processing_settings.tilt_azimuth_smoother.apply(ptr_event.azimuthAngle));
        this.tilt_altitude_processed = radians_to_degrees(processing_settings.tilt_altitude_smoother.apply(ptr_event.altitudeAngle));

        this.barrel_rotation = ptr_event.twist;

        this.time = performance.now();

        this.velocity = 0;
        this.direction = 0;

        if (paint_state.canvas_pos_old != null) {
            const dx = this.canvas_pos_x_processed - paint_state.canvas_pos_old_all_events.x;
            const dy = this.canvas_pos_y_processed - paint_state.canvas_pos_old_all_events.y;

            if (paint_state.time_old != null) {
                const dt = (this.time - paint_state.time_old) / 1000.0;
                if (dt > 0) {

                    const dist = Math.hypot(dx, dy);
                    const raw_speed = dist / dt;
                    const smoothed_speed = processing_settings.velocity_smoother.apply(raw_speed);
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