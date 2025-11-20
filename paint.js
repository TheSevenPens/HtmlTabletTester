
function paint_stroke_start()
{
    if (ux_paint_settings.erase_on_stroke_start.checked)
    {
        clearCanvas();
    }
    paint_state.isDrawing = true;
    paint_stroke_stats.ptrevent_count = 0;
    paint_stroke_stats.start_time = performance.now();
    processing_settings.pos_x_smoother.resetState();
    processing_settings.pos_y_smoother.resetState();
    processing_settings.pressure_smoother.resetState();
    processing_settings.tilt_x_smoother.resetState();
    processing_settings.tilt_y_smoother.resetState();
    processing_settings.tilt_azimuth_smoother.resetState();
    processing_settings.tilt_altitude_smoother.resetState();
    processing_settings.velocity_smoother.resetState();
}

function paint_stroke_stop()
{
    paint_state.isDrawing = false;
    paint_stroke_stats.stroke_count = paint_stroke_stats.stroke_count + 1;
    paint_stroke_stats.end_time = performance.now();
    paint_stroke_stats.duration = Math.round(paint_stroke_stats.end_time - paint_stroke_stats.start_time);
}


function get_dab_size( ptr_rec )
{
    var new_size = paint_settings.brush_size;

    // If the brush size is not dynamic,
    // simply use the the user's
    // desired brush size

    // HANDLE DAB SIZE
    if (paint_settings.brush_size_control === "USER")
    {
        paint_current_dab_settings.brush_size = new_size;
    }
    else if (paint_settings.brush_size_control === "PRESSURE")
    {
        new_size = new_size * ptr_rec.pressure_processed; 
    }
    else if (paint_settings.brush_size_control === "TILTX")
    {
        new_size = new_size * ptr_rec.tilt_x_processed / pointer_constants.max_tilt_x;
    }
    else if (paint_settings.brush_size_control === "TILTY")
    {
        new_size = new_size * ptr_rec.tilt_y_processed / pointer_constants.max_tilt_y;
    }
    else if (paint_settings.brush_size_control === "TILTAZ")
    {
        new_size = new_size * ptr_rec.tilt_azimuth_processed / pointer_constants.max_tilt_azimuth;
    }
    else if (paint_settings.brush_size_control === "TILTALT")
    {
        new_size = new_size * ((1.0 - (ptr_rec.tilt_altitude_processed / pointer_constants.max_tilt_altitude)) + 0.05); // when pen is vertical size is small, as pen tilts dab gets larger
    }
    new_size = clamp_to_range( new_size, BRUSHSIZE_RANGE )
    new_size = round_to_3_decimal_places( new_size );
    return new_size;
}

function get_dab_color( ptr_rec )
{
    var dab_color = setting_stylus_pen_color;

    if (ptr_rec.buttons === pointer_button_code.eraser)
    {
        dab_color = app_settings.canvas_color;
    }
    else if (paint_settings.brush_color_control ==="PRESSURE")
    {
        var hue = lerp(360, 150, ptr_rec.pressure_processed);
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control ==="TILTALT")
    {
        var hue = lerp(360, 150, ptr_rec.tilt_altitude_processed/ pointer_constants.max_tilt_altitude);
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control ==="TILTAZ")
    {
        dab_color = angle_to_color( ptr_rec.tilt_azimuth_processed, azimuth_color_stops, azimuth_angle_stops ) ;
        dab_color = dab_color.toWebRGB();
    }
    else if (paint_settings.brush_color_control ==="TILTX")
    {
        var hue = lerp(360, 150, ptr_rec.tilt_x_processed/pointer_constants.max_tilt_x );
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control ==="TILTY")
    {
        var hue = lerp(360, 150, ptr_rec.tilt_y_processed/pointer_constants.max_tilt_y);
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control ==="BARRELROTATION")
    {
        dab_color = getCETColor( ptr_rec.barrel_rotation) ;
    }
    else if (paint_settings.brush_color_control ==="ERASER")
    {
        dab_color = setting_canvas_color;
    }
    else if (paint_settings.brush_color_control ==="RED")
    {
        // CANVAS COLOR TO COLOR
        dab_color = "rgba(250, 0, 0, 1.0)";
    }

    return dab_color;
}

function update_dab_settings( ptr_rec )
{
    // SIZE
    var new_size = get_dab_size( ptr_rec );
    paint_current_dab_settings.brush_size = new_size;

    // COLOR
    paint_current_dab_settings.brush_color = get_dab_color( ptr_rec  );
}

function paint_dab( ptr_rec )
{
    if (ptr_rec.pressure_raw <= 0)
    {
        // If No pressure input
        // - reset any smoothing
        processing_settings.pos_x_smoother.resetState();
        processing_settings.pos_y_smoother.resetState();
        processing_settings.pressure_smoother.resetState();
        processing_settings.tilt_x_smoother.resetState();
        processing_settings.tilt_y_smoother.resetState();
        processing_settings.tilt_azimuth_smoother.resetState();
        processing_settings.tilt_altitude_smoother.resetState();

    }

    
    var current_pos = new Position( ptr_rec.canvas_pos_x_processed, ptr_rec.canvas_pos_y_processed);
    
    switch (ptr_rec.type) 
    {
        case "pointerdown":
            paint_stroke_start();
            paint_state.canvas_pos_old = current_pos;
            break;

        case "pointermove":
            if (!paint_state.isDrawing) 
            {
                return;
            }

            update_dab_settings(ptr_rec);


            if (ptr_rec.pressure_raw > 0) 
            {
                draw_line( app_canvas_context,
                    paint_state.canvas_pos_old, 
                    current_pos, 
                    paint_current_dab_settings.brush_size,
                    paint_current_dab_settings.brush_color,
                    paint_settings.linecap); 
            }

            paint_state.canvas_pos_old = current_pos;
            break;
    }

}

