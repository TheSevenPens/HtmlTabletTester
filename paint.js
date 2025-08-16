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
    pos_x_smoothing: new NumericSmoother(0.0),
    pos_y_smoothing: new NumericSmoother(0.0),
    pressure_smoothing: new NumericSmoother(0.0),
    pressure_curve: new NumericCurve(0.0),
    tilt_x_smoothing: new NumericSmoother(0.0),
    tilt_y_smoothing: new NumericSmoother(0.0),
    tilt_azimuth_smoothing: new NumericSmoother(0.0),
    tilt_altitude_smoothing: new NumericSmoother(0.0),
    pressue_quant: 0,
};

var current_dab_settings = 
{
    brush_size: 1,
    brush_color: setting_stylus_pen_color,
};

var paint_state = 
{
    canvas_pos_old_all_events : { x: 0, y: 0 },
    canvas_pos_old: { x: 0, y: 0 },
    isDrawing: false,
    time_old: null,
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
    paint_settings.pos_x_smoothing.resetState();
    paint_settings.pos_y_smoothing.resetState();
    paint_settings.pressure_smoothing.resetState();
}

function paint_stroke_stop()
{
    paint_state.isDrawing = false;
    paint_stats.stroke_count = paint_stats.stroke_count + 1;
    paint_stats.end_time = performance.now();
    paint_stats.duration = Math.round(paint_stats.end_time - paint_stats.start_time);
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
        new_size = new_size * ptr_rec.tilt_x_processed / max_tilt_x;  
    }
    else if (paint_settings.brush_size_control == "TILTY")
    {
        new_size = new_size * ptr_rec.tilt_y_processed / max_tilt_y;  
    }
    else if (paint_settings.brush_size_control == "TILTAZ")
    {
        new_size = new_size * ptr_rec.tilt_azimuth_processed / max_tilt_azimuth;  
    }
    else if (paint_settings.brush_size_control == "TILTALT")
    {
        new_size = new_size * ((1.0 - (ptr_rec.tilt_altitude_processed / max_tilt_altitude)) + 0.05); // when pen is vertical size is small, as pen tilts dab gets larger 
    }
    new_size = clamp_to_range( new_size, BRUSHSIZE_RANGE )
    new_size = round_to_3_decimal_places( new_size );
    return new_size;
}

function get_dab_color( ptr_rec )
{
    var dab_color = setting_stylus_pen_color;

    if (ptr_rec.buttons == EPenButton.eraser)
    {
        dab_color = appsettings.canvas_color;
    }
    else if (paint_settings.brush_color_control =="PRESSURE")
    {
        var hue = lerp(360, 150, ptr_rec.pressure_processed);
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control =="TILTALT")
    {
        var hue = lerp(360, 150, ptr_rec.tilt_altitude_processed/ max_tilt_altitude);
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control =="TILTAZ")
    {
        dab_color = angle_to_color( ptr_rec.tilt_azimuth_processed, azimuth_color_stops, azimuth_angle_stops ) ;
        dab_color = dab_color.toWebRGB();
    }
    else if (paint_settings.brush_color_control =="TILTX")
    {
        var hue = lerp(360, 150, ptr_rec.tilt_x_processed/max_tilt_x );
        dab_color = `hsl(${hue}, 100%, 50%)`;
    }
    else if (paint_settings.brush_color_control =="TILTY")
    {
        var hue = lerp(360, 150, ptr_rec.tilt_y_processed/max_tilt_y);
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

function paint_dab( ptr_rec )
{
    if (ptr_rec.pressure_raw <= 0)
    {
        // If No pressure input
        // - reset any smoothing
        paint_settings.pos_x_smoothing.resetState();
        paint_settings.pos_y_smoothing.resetState();
        paint_settings.pressure_smoothing.resetState();
        paint_settings.tilt_x_smoothing.resetState();
        paint_settings.tilt_y_smoothing.resetState();
        paint_settings.tilt_azimuth_smoothing.resetState();
        paint_settings.tilt_altitude_smoothing.resetState();

    }

    
    var current_pos = new Position( ptr_rec.canvas_pos_x, ptr_rec.canvas_pos_y);
    
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
                draw_line( canvas_context, 
                    paint_state.canvas_pos_old, 
                    current_pos, 
                    current_dab_settings.brush_size,
                    current_dab_settings.brush_color,
                    paint_settings.linecap); 
            }

            paint_state.canvas_pos_old = current_pos;
            break;
    }

}

