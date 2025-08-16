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

const max_tilt_altitude = 90.0;
const max_tilt_azimuth = 360.0;
const max_tilt_x = 60.0;
const max_tilt_y = 60.0;

function tiltxy_to_tiltazimuth(tiltX,tiltY)
{
    var azimuth = tiltX || tiltY 
                ? (Math.atan2(tiltY, tiltX) * 180 / Math.PI) 
                : 0;
    if (azimuth<0) {
        azimuth = 360  + azimuth;
    }
    return azimuth;
}

function tiltxy_to_tiltangle(tiltX,tiltY)
{
   const angle = tiltX  || tiltY 
                ? (Math.sqrt( tiltX  * tiltX  + tiltY  * tiltY))
                : 0;
    return angle;
}


class PointerRecord {
  constructor(canvas_rect, ptr_event) 
  {
    var canvas_rect = canvas_el.getBoundingClientRect();
   
    // get the pressure reported in the event
    // if it is pointer pen event, just use that pressure
    // if it is any other kind of event, then just the maximum pressure
    const pressure_raw = clamp_to_range( ptr_event.pressure , PRESSURE_RANGE);

    const canvas_pos_x_raw = ptr_event.clientX - canvas_rect.left;
    const canvas_pos_y_raw = ptr_event.clientY - canvas_rect.top;

    this.type = ptr_event.type;
    this.buttons = ptr_event.buttons;
    this.pointer_type = ptr_event.pointerType;
        
    this.screen_pos_x = ptr_event.clientX;
    this.screen_pos_y = ptr_event.clientY;

    this.canvas_pos_x_raw = canvas_pos_x_raw;
    this.canvas_pos_y_raw = canvas_pos_y_raw;

    this.canvas_pos_x = paint_settings.pos_x_smoothing.apply(canvas_pos_x_raw);
    this.canvas_pos_y = paint_settings.pos_y_smoothing.apply(canvas_pos_y_raw);
        
    this.pressure_raw= pressure_raw;
    this.pressure_processed = process_pressure(pressure_raw);
        
    this.buttons = ptr_event.buttons;
                
    this.tilt_x =  ptr_event.tiltX;
    this.tilt_y = ptr_event.tiltY;

    //const calculatedTiltAzimuth = tiltxy_to_tiltazimuth( ptr_event.tiltX , ptr_event.tiltY );
    //const calculatedTiltAngle =  tiltxy_to_tiltangle( ptr_event.tiltX , ptr_event.tiltY );

    this.tilt_azimuth = radians_to_degrees( ptr_event.azimuthAngle );
    this.tilt_altitude = radians_to_degrees( ptr_event.altitudeAngle );
    //this.tilt_azimuth = calculatedTiltAzimuth;
    //this.tilt_altitude = calculatedTiltAngle;

        
    this.tilt_x_processed = paint_settings.tilt_x_smoothing.apply( ptr_event.tiltX ) ;
    this.tilt_y_processed = paint_settings.tilt_y_smoothing.apply(ptr_event.tiltY);

    //this.tilt_azimuth_processed = paint_settings.tilt_azimuth_smoothing.apply( radians_to_degrees( ptr_event.azimuthAngle ));
    //this.tilt_altitude_processed = paint_settings.tilt_altitude_smoothing.apply( radians_to_degrees( ptr_event.altitudeAngle ));
    this.tilt_azimuth_processed = tiltxy_to_tiltazimuth( this.tilt_x_processed , this.tilt_y_processed );
    this.tilt_altitude_processed = tiltxy_to_tiltangle( this.tilt_x_processed , this.tilt_y_processed );

    this.barrel_rotation = ptr_event.twist;

    this.time = performance.now();

  }
}

function get_ptr_rec( canvas_rect, ptr_event)
{
    paint_stats.ptrevent_count = paint_stats.ptrevent_count +1;
    return new PointerRecord(canvas_rect, ptr_event); 
}

function process_pressure( input_pressure )
{
    var output_pressure = input_pressure;
    // FIRST QUANTIZE
    if (paint_settings.pressure_quant > 0)
    {
        output_pressure = quantize( input_pressure, paint_settings.pressure_quant );
    }
    
    // SECOND APPLY A CURVE
    output_pressure = paint_settings.pressure_curve.apply( output_pressure );  

    // THIRD APPLY SMOOTHING (negative old values mean there is no old value)
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

