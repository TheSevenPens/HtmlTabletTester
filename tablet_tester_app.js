/////////////////////////////////////////////////////////////////////////

const setting_stylus_pen_color = "black";
const setting_canvas_color = "rgba(230, 230, 250, 1.0)";
const setting_download_filename = "TabletTester_Untitled";

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

const PRESSURE_RANGE = new OrderedRange(0.0,1.0);
const BRUSHSIZE_RANGE = new OrderedRange(1.0,300.0);

var canvas_el = document.getElementById("myCanvas");
var canvas_context = canvas_el.getContext("2d");
var pressurelabel_el = document.getElementById("pressureVal");
var tiltlabel_el = document.getElementById("tiltVal");
var poslabel_el = document.getElementById("posVal");
var sizelabel_el = document.getElementById("sizeVal");
var brush_size_control_el =  document.getElementById('brushSizeControlSelect');
var brush_size_el = document.getElementById('brushSizeSelect');
var brush_color_control_el =  document.getElementById('brushColorControlSelect');

var paintstate = 
{
    inStroke: false,
    canvas_pos_old: { x: 0, y: 0 },
    isDrawing: false
};

update_paint_settings_from_ui(); 

var EPenButton =
    {
        tip: 0x1,		// left mouse, touch contact, pen contact
        barrel: 0x2,		// right mouse, pen barrel button
        middle: 0x4,		// middle mouse
        eraser: 0x20		// pen eraser button
    };

/////////////////////////////////////////////////////////////////////////
// Initialize page elements
//
function initPage() 
{
    setCanvasProps();
}

/////////////////////////////////////////////////////////////////////////
// Init canvas properties.
// Sets canvas width to expand to browser window.
// Canvas cleared to restore background color.
//
function setCanvasProps() 
{
    if (canvas_el.width < window.innerWidth) 
    {
        canvas_el.width = window.innerWidth - 50;
    }

    clearCanvas();	// ensures background saved with drawn image
}

/////////////////////////////////////////////////////////////////////////
// Sets a flag to enable/disable use of the pen tilt property.
//
function update_paint_settings_from_ui() 
{
    paint_settings.brush_size_control = brush_size_control_el.value; 
    var brush_size = parseInt(brush_size_el.value);   
    paint_settings.brush_size = brush_size; 
    paint_settings.brush_color = brush_color_control_el.value
}

/////////////////////////////////////////////////////////////////////////
// Clears the drawing canvas.
//
function clearCanvas() 
{
    canvas_context.fillStyle = setting_canvas_color;
    canvas_context.fillRect(0, 0, canvas_el.width, canvas_el.height);
}

function getCanvasName()
{
    return setting_download_filename + "_" + Date.now().toString() + ".png";
}

/////////////////////////////////////////////////////////////////////////
// Saves the image on the drawing canvas and then downloads a png.
//
function saveCanvas() 
{
    var link = document.getElementById('link');
    var url = canvas_el.toDataURL("image/png").replace("image/png", "image/octet-stream");
    link.setAttribute('download', getCanvasName());
    link.setAttribute('href', url);
    link.click();
}

function update_currect_dab_settings( paint_rec, ptr_event )
{

    var tilt_amt = Math.max( Math.abs(paint_rec.tilt.x), Math.abs(paint_rec.tilt.y) )
    var max_tilt = 60.0;
    var normalized_tilt = tilt_amt/max_tilt;

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
        new_size = new_size * paint_rec.pressure; 
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
                var hue = lerp(360, 150, paint_rec.pressure);
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

function get_pressure( ptr_event )
{
    var p =  (ptr_event.pointerType == "pen") ? ptr_event.pressure : PRESSURE_RANGE.Max;  
    p = clamp_to_range( p, PRESSURE_RANGE);
    return p;
}

/////////////////////////////////////////////////////////////////////////
// Handle drawing for HTML5 Pointer Events.
//
function pointer_event_handler(ptr_event) 
{

    if ( 
        (ptr_event.pointerType != "mouse")
        && (ptr_event.pointerType != "pen")
        && (ptr_event.pointerType != "touch") 
        ) 
    {
        return;
    }


    var canvas_rect = canvas_el.getBoundingClientRect();

    var pointer_rec = 
    {
        screen_pos: new Position(ptr_event.clientX, ptr_event.clientY),
        canvas_pos: new Position(ptr_event.clientX - canvas_rect.left, ptr_event.clientY - canvas_rect.top),
        pressure: get_pressure(ptr_event),
        buttons: ptr_event.buttons,
        tilt: 
            { 
                x: ptr_event.tiltX,
                y: ptr_event.tiltY
            },
        rotate: ptr_event.twist,
    }

    pressurelabel_el.innerText = pointer_rec.pressure.toFixed(4);
    tiltlabel_el.innerText = pointer_rec.tilt.x.toFixed(1) + "x" + pointer_rec.tilt.y.toFixed(1) ;
    poslabel_el.innerText = pointer_rec.canvas_pos.x.toFixed(1) + "x" + pointer_rec.canvas_pos.y.toFixed(1);

    if (pointer_rec.pressure > 0)
    {
        sizelabel_el.innerText = current_dab_settings.brush_size.toString()+"px";
    }
    else
    {
        sizelabel_el.innerText = "xxx";
    }

    switch (ptr_event.type) 
    {
        case "pointerdown":
            paintstate.isDrawing = true;
            paintstate.canvas_pos_old = pointer_rec.canvas_pos;
            break;

        case "pointermove":
            if (!paintstate.isDrawing) 
            {
                return;
            }

            update_currect_dab_settings(pointer_rec, ptr_event);

            eraser_size = new Size(paint_settings.eraser_size,paint_settings.eraser_size);
            if (pointer_rec.buttons == EPenButton.eraser) 
            {
                draw_centered_box(
                    canvas_context,
                    pointer_rec.canvas_pos,
                    eraser_size ,
                    current_dab_settings.brush_color);
            }
            else if (pointer_rec.pressure > 0) 
            {
                draw_line( canvas_context, 
                    paintstate.canvas_pos_old, 
                    pointer_rec.canvas_pos, 
                    current_dab_settings.brush_size,
                    current_dab_settings.brush_color,
                    paint_settings.linecap);
            }

            paintstate.canvas_pos_old = pointer_rec.canvas_pos;
            break;
    }
}

function on_pointerup( ptr_event ) 
{
    paintstate.isDrawing = false;
}

function on_pointerenter( ptr_event ) 
{
    document.body.style.cursor = "crosshair";
}

function on_pointerleave( ptr_event ) 
{
    document.body.style.cursor = "default";

    const empty = "---";
    poslabel_el.innerText = empty;
    sizelabel_el.innerText = empty;
    pressurelabel_el.innerText = empty;
    tiltlabel_el.innerText = empty;

}

function default_ptr_event_handler_do_nothing( ptr_event ) 
{
    // do nothing
}

/////////////////////////////////////////////////////////////////////////
// Upon a window load event, registers all events.
//
function register_event_handlers()
{
    window.addEventListener('load', register_pointer_event_handlers, true);  

    // Hotkey for DELETE or BACKSPACE
    document.addEventListener('keydown', 
        (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault(); // Prevent browser back navigation
            clearCanvas();
        } });
}

/////////////////////////////////////////////////////////////////////////
// Register listeners to canvas
//
function register_pointer_event_handlers()
{
    if (!window.PointerEvent) 
    {
        console.log("INFO: Browser DOES NOT support pointer events");
        return;
    }

    console.log("INFO: Browser DOES support pointer events");

    canvas_el.addEventListener("pointerdown", pointer_event_handler, false);
    canvas_el.addEventListener("pointerup", on_pointerup, false);

    canvas_el.addEventListener("pointercancel", pointer_event_handler, false);
    canvas_el.addEventListener("pointermove", pointer_event_handler, false);

    canvas_el.addEventListener("pointerover", default_ptr_event_handler_do_nothing, false);
    canvas_el.addEventListener("pointerout", default_ptr_event_handler_do_nothing, false);

    canvas_el.addEventListener("pointerenter", on_pointerenter, false);
    canvas_el.addEventListener("pointerleave", on_pointerleave, false);

    canvas_el.addEventListener("gotpointercapture", default_ptr_event_handler_do_nothing, false);
    canvas_el.addEventListener("lostpointercapture", default_ptr_event_handler_do_nothing, false);
}

register_event_handlers();

