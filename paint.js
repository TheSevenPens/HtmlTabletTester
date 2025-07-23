const setting_stylus_pen_color = "black";
const PRESSURE_RANGE = new OrderedRange(0.0,1.0);
const BRUSHSIZE_RANGE = new OrderedRange(0.1,300.0);

var paint_settings = 
{
    brush_size: 50,
    brush_size_control: "PRESSURE",
    brush_color_control: "DEFAULT",
    eraser_size: 30,
    linecap: "round",
    pressure_smoothing: new NumericSmoother(0.0),
    pressure_curve: new NumericCurve(0.0),
};

var current_dab_settings = 
{
    brush_size: 1,
    brush_color: setting_stylus_pen_color,
};

var paint_state = 
{
    canvas_pos_old: { x: 0, y: 0 },
    isDrawing: false,
};

var paint_stats=
{
    stroke_count: 0,
    ptrevent_count: 0,
    start_time: 0,
    end_time: 0,
    duration: 0,
};

function paint_stroke_start()
{
    paint_state.isDrawing = true;
    paint_stats.ptrevent_count = 0; 
    paint_stats.start_time = performance.now();
}

function paint_stroke_stop()
{
    paint_state.isDrawing = false;
    paint_stats.stroke_count = paint_stats.stroke_count + 1;
    paint_stats.end_time = performance.now();
    paint_stats.duration = Math.round(paint_stats.end_time - paint_stats.start_time);
}

function get_ptr_rec( canvas_rect, ptr_event)
{
    paint_stats.ptrevent_count = paint_stats.ptrevent_count +1; 
    var canvas_rect = canvas_el.getBoundingClientRect();
   
    // get the pressure reported in the event
    // if it is pointer pen event, just use that pressure
    // if it is any other kind of event, then just the maximum pressure
    pressure_raw = clamp_to_range( ptr_event.pressure , PRESSURE_RANGE);

    const max_tilt_altitude = 90.0;
    const max_tilt_azimuth = 360.0;
    const max_tilt_x = 60.0;
    const max_tilt_y = 60.0;

    var ptr_rec = 
    {
        type: ptr_event.type,
        pointer_type: ptr_event.pointerType,
        screen_pos: new Position(ptr_event.clientX, ptr_event.clientY),
        canvas_pos: new Position(ptr_event.clientX - canvas_rect.left, ptr_event.clientY - canvas_rect.top),
        pressure_raw: pressure_raw,
        pressure_processed: process_pressure(pressure_raw),
        buttons: ptr_event.buttons,
        tilt_x: ptr_event.tiltX,
        tilt_y: ptr_event.tiltY,
        tilt_azimuth: radians_to_degrees( ptr_event.azimuthAngle ),
        tilt_altitude: radians_to_degrees( ptr_event.altitudeAngle ),
        barrel_rotation: ptr_event.twist,
        tilt_altitude_normalized:  Math.abs(radians_to_degrees(ptr_event.altitudeAngle))/max_tilt_altitude,
        tilt_azimuth_normalized:  Math.abs(radians_to_degrees(ptr_event.azimuthAngle))/max_tilt_azimuth,
        tilt_x_normalized:  Math.abs(ptr_event.tiltX)/max_tilt_x,
        tilt_y_normalized:  Math.abs(ptr_event.tiltY)/max_tilt_y,

    }

    return ptr_rec;
}

function process_pressure( input_pressure )
{
    // FIRST APPLY A CURVE
    var output_pressure = paint_settings.pressure_curve.apply( input_pressure );  

    // SECOND APPLY SMOOTHING (negative old values mean there is no old value)
    output_pressure = paint_settings.pressure_smoothing.apply( output_pressure );

    
    return output_pressure;
}

function get_dab_size( ptr_rec )
{
    var new_size = paint_settings.brush_size;

    // If the brush size is not dynamic,
    // simply use the the user's
    // desired brush size

    // HANDLE DAB SIZE
    if (paint_settings.brush_size_control == "USER")
    {
        current_dab_settings.brush_size = new_size;
    }
    else if (paint_settings.brush_size_control == "PRESSURE")
    {
        new_size = new_size * ptr_rec.pressure_processed; 
    }
    else if (paint_settings.brush_size_control == "TILTX")
    {
        new_size = new_size * ptr_rec.tilt_x_normalized;  
    }
    else if (paint_settings.brush_size_control == "TILTY")
    {
        new_size = new_size * ptr_rec.tilt_y_normalized;  
    }
    else if (paint_settings.brush_size_control == "TILTAZ")
    {
        new_size = new_size * ptr_rec.tilt_azimuth_normalized;  
    }
    else if (paint_settings.brush_size_control == "TILTALT")
    {
        new_size = new_size * ((1.0 - ptr_rec.tilt_altitude_normalized) + 0.05); // when pen is vertical size is small, as pen tilts dab gets larger 
    }
    new_size = clamp_to_range( new_size, BRUSHSIZE_RANGE )
    new_size = round_to_3_decimal_places( new_size );
    return new_size;
}

function get_dab_color( ptr_rec )
{
    var dab_color = setting_stylus_pen_color;

    if (paint_settings.brush_color_control =="PRESSURE")
    {
        var hue = lerp(360, 150, pressure_effective);
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control =="TILTALT")
    {
        var hue = lerp(360, 150, ptr_rec.tilt_altitude_normalized);
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control =="TILTAZ")
    {
        //var hue = lerp(360, 150, ptr_rec.tilt_azimuth);
        // dab_color = `hsl(${hue}, 100%, 50%)`;
        dab_color = getCETColor( ptr_rec.tilt_azimuth) ;
    }
    else if (paint_settings.brush_color_control =="TILTX")
    {
        var hue = lerp(360, 150, ptr_rec.tilt_x_normalized);
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control =="TILTY")
    {
        var hue = lerp(360, 150, ptr_rec.tilt_y_normalized);
        dab_color = `hsl(${hue}, 100%, 50%)`;

    }
    else if (paint_settings.brush_color_control =="BARRELROTATION")
    {
        dab_color = getCETColor( ptr_rec.barrel_rotation) ;
    }
    else if (paint_settings.brush_color_control =="ERASER")
    {
        dab_color = setting_canvas_color;
    }
    else if (paint_settings.brush_color_control =="RED")
    {
        // CANVAS COLOR TO COLOR
        dab_color = "rgba(250, 0, 0, 1.0)";;
    }

    return dab_color;

}

function update_dab_settings( ptr_rec )
{
    // SIZE
    var new_size = get_dab_size( ptr_rec );
    current_dab_settings.brush_size = new_size;

    // COLOR
    current_dab_settings.brush_color = get_dab_color( ptr_rec  );
}



function paint_dab( ptr_event, ptr_rec )
{
    if (ptr_rec.pressure_raw <= 0)
    {
        // No pressure input
        // set the old smoothed pressure to an invalid value
        paint_settings.pressure_smoothing.reset();
    }

    switch (ptr_event.type) 
    {
        case "pointerdown":
            paint_stroke_start();
            paint_state.canvas_pos_old = ptr_rec.canvas_pos;
            break;

        case "pointermove":
            if (!paint_state.isDrawing) 
            {
                return;
            }

            update_dab_settings(ptr_rec);

            if (ptr_rec.buttons == EPenButton.eraser) 
            {
                draw_centered_box(
                    canvas_context,
                    ptr_rec.canvas_pos,
                    current_dab_settings.eraser_size ,
                    current_dab_settings.brush_color);
            }
            else if (ptr_rec.pressure_raw > 0) 
            {
                draw_line( canvas_context, 
                    paint_state.canvas_pos_old, 
                    ptr_rec.canvas_pos, 
                    current_dab_settings.brush_size,
                    current_dab_settings.brush_color,
                    paint_settings.linecap);
            }

            paint_state.canvas_pos_old = ptr_rec.canvas_pos;
            break;
    }

}

