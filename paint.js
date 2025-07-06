const setting_stylus_pen_color = "black";

const PRESSURE_RANGE = new OrderedRange(0.0,1.0);
const BRUSHSIZE_RANGE = new OrderedRange(1.0,300.0);


var paint_settings = 
{
    use_tilt: false,
    use_pressure: false,
    brush_size: 50,
    brush_size_control: "PRESSURE",
    eraser_size: 30,
    linecap: "round"
};

var current_dab_settings = 
{
    brush_size: 1,
    brush_color: setting_stylus_pen_color,
    brush_color: "DEFAULT"
};

var paint_state = 
{
    inStroke: false,
    canvas_pos_old: { x: 0, y: 0 },
    isDrawing: false,
    pressure_smoothed_old: -1.0
};

function get_paint_rec( canvas_rect, ptr_event)
{
    var canvas_rect = canvas_el.getBoundingClientRect();

    var paint_rec = 
    {
        screen_pos: new Position(ptr_event.clientX, ptr_event.clientY),
        canvas_pos: new Position(ptr_event.clientX - canvas_rect.left, ptr_event.clientY - canvas_rect.top),
        pressure: clamp_to_range( (ptr_event.pointerType == "pen") ? ptr_event.pressure : PRESSURE_RANGE.Max, PRESSURE_RANGE),
        buttons: ptr_event.buttons,
        tilt: 
            { 
                x: ptr_event.tiltX,
                y: ptr_event.tiltY
            },
        rotate: ptr_event.twist,
    }
    return paint_rec;
}

function update_dab_settings( paint_rec, ptr_event )
{

    var tilt_amt = Math.max( Math.abs(paint_rec.tilt.x), Math.abs(paint_rec.tilt.y) )
    var max_tilt = 60.0;
    var normalized_tilt = tilt_amt/max_tilt;

    var new_size = paint_settings.brush_size;


    if (paint_state.pressure_smoothed_old <0.0)
    {
        var pressure_effective  = paint_rec.pressure;
    }
    else
    {
        var pressure_smoothing_alpha = 1.0-paint_settings.pressure_smoothing ;
        var pressure_effective = ( pressure_smoothing_alpha * paint_rec.pressure ) + ((1.0 - pressure_smoothing_alpha) * paint_state.pressure_smoothed_old);
    }
    paint_state.pressure_smoothed_old = pressure_effective;
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
        new_size = new_size * pressure_effective; 
        new_size = clamp_to_range( new_size, BRUSHSIZE_RANGE )
        new_size = round_to_3_decimal_places( new_size );
        current_dab_settings.brush_size = new_size;        
    }
    else if (paint_settings.brush_size_control == "TILT")
    {
        new_size = new_size * normalized_tilt;
        new_size = clamp_to_range( new_size, BRUSHSIZE_RANGE )
        new_size = round_to_3_decimal_places( new_size );
        current_dab_settings.brush_size = new_size;
    }
    else
    {
        // unhandled case
    }

    // Eraser size
    current_dab_settings.eraser_size = new Size(paint_settings.eraser_size,paint_settings.eraser_size);

    // HANDLE DAB COLOR
    if (ptr_event.pointerType == "pen")
    {
        if (ptr_event.buttons == EPenButton.eraser)
        {
            // ERASING
            current_dab_settings.brush_color = setting_canvas_color;


        }
        else
        {
            // DRAWING
            if (paint_settings.brush_color=="PRESSURE")
            {
                // PRESSURE TO COLOR
                // Low pressure is a blue/green
                // high pressure is read
                var hue = lerp(360, 150, pressure_effective);
                var dab_color = `hsl(${hue}, 100%, 50%)`;
                current_dab_settings.brush_color = dab_color;

            }
            else if (paint_settings.brush_color=="TILT")
            {
                // TILT TO COLOR
                // Low pressure is a blue/green
                // high pressure is read
                var hue = lerp(360, 150, normalized_tilt);
                var dab_color = `hsl(${hue}, 100%, 50%)`;
                current_dab_settings.brush_color = dab_color;

            }
            else if (paint_settings.brush_color=="ERASER")
            {
                // CANVAS COLOR TO COLOR
                current_dab_settings.brush_color = setting_canvas_color;
            }
            else if (paint_settings.brush_color=="RED")
            {
                // CANVAS COLOR TO COLOR
                current_dab_settings.brush_color = "rgba(250, 0, 0, 1.0)";;
            }
            else
            {
                // STANDARD BRUSH COLOR
                current_dab_settings.brush_color = setting_stylus_pen_color;
            }
        }
    }


}



function perform_paint( ptr_event, paint_rec )
{
        if (paint_rec.pressure <= 0)
    {
        // No pressure input
        // set the old smoothed pressure to an invalid value
        paint_state.pressure_smoothed_old = -1.0;
    }

    switch (ptr_event.type) 
    {
        case "pointerdown":
            paint_state.isDrawing = true;
            paint_state.canvas_pos_old = paint_rec.canvas_pos;
            break;

        case "pointermove":
            if (!paint_state.isDrawing) 
            {
                return;
            }

            update_dab_settings(paint_rec, ptr_event);


            if (paint_rec.buttons == EPenButton.eraser) 
            {
                draw_centered_box(
                    canvas_context,
                    paint_rec.canvas_pos,
                    current_dab_settings.eraser_size ,
                    current_dab_settings.brush_color);
            }
            else if (paint_rec.pressure > 0) 
            {
                draw_line( canvas_context, 
                    paint_state.canvas_pos_old, 
                    paint_rec.canvas_pos, 
                    current_dab_settings.brush_size,
                    current_dab_settings.brush_color,
                    paint_settings.linecap);
            }

            paint_state.canvas_pos_old = paint_rec.canvas_pos;
            break;
    }

}
