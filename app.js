/////////////////////////////////////////////////////////////////////////



var appsettings =
{
    canvas_color: "rgba(230, 230, 250, 1.0)",
    download_filename: "TabletTester_Untitled"
}

const canvas_el = document.getElementById("myCanvas");
const canvas_context = canvas_el.getContext("2d");

const curveCanvas = document.getElementById('curveCanvas');
const curveCtx = curveCanvas.getContext('2d');


var controls = 
{
    brush_size:  document.getElementById('brushSizeControlSelect'),
    brush_color:  document.getElementById('brushColorControlSelect'),
    pressureCurveAmountSlider: document.getElementById("pressureCurveAmountSlider"),
    pressure_smoothing: document.getElementById('pressureSmoothing')
}

// LIVESTATS THAT UPDATE ON EVERY POINTER EVENT
var livestats =
{
    pressure: document.getElementById("pressureVal"),
    tiltx: document.getElementById("tiltXVal"),
    tilty: document.getElementById("tiltYVal"),
    tiltazimuth: document.getElementById("tiltAzimuthVal"),
    tiltaltitude: document.getElementById("tiltAltitudeVal"),
    pos: document.getElementById("posVal"),
    size: document.getElementById("sizeVal"),
    brush_size: document.getElementById('brushSizeSelect'),
    pressure_smoothing: document.getElementById("pressureSmoothingValue"),
    pressure_curve_amount: document.getElementById("pressureCurveAmountValue"),
    barrel_rotation: document.getElementById("barrelRotationVal")
}

var paintstats_fields  =
{
    stroke_count: document.getElementById("strokeCountVal"),
}
update_paintsettings(); 

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

// 
// LIVESTATS UI
// 

function update_livestats_ui(paint_rec)
{
    livestats.pressure.innerText = paint_rec.pressure.toFixed(4);
    livestats.tiltx.innerText = paint_rec.tiltx.toFixed(1);
    livestats.tilty.innerText = paint_rec.tilty.toFixed(1) ;
    livestats.tiltazimuth.innerText = paint_rec.tiltazimuth.toFixed(1);
    livestats.tiltaltitude.innerText = paint_rec.tiltaltitude.toFixed(1) ;
    livestats.pos.innerText = paint_rec.canvas_pos.x.toFixed(1) + "x" + paint_rec.canvas_pos.y.toFixed(1);
    livestats.barrel_rotation.innerText = paint_rec.barrelrotation.toString();

    if (paint_rec.pressure > 0)
    {
        livestats.size.innerText = current_dab_settings.brush_size.toString()+"px";
    }
    else
    {
        livestats.size.innerText = "xxx";
    }

}

function update_paintsettings() 
{
    paint_settings.brush_size_control = controls.brush_size.value; 
    var brush_size = parseInt(livestats.brush_size.value);   
    paint_settings.brush_size = brush_size; 
    paint_settings.brush_color_control = controls.brush_color.value;
    paint_settings.pressure_smoothing = GetSmoothingValue( controls.pressure_smoothing.value ),
    paint_settings.pressureCurveAmount = parseFloat(controls.pressureCurveAmountSlider.value)

    // TODO: The lines below updated UI from the settings which is
    // the opposite of what is supposed to happen in this method.
    // Move somewhere else
    livestats.pressure_smoothing.innerText = paint_settings.pressure_smoothing.toString();
    livestats.pressure_curve_amount.innerText = paint_settings.pressureCurveAmount.toFixed(1);


    drawPressureCurve();
}

function getCanvasName()
{
    return appsettings.download_filename + "_" + Date.now().toString() + ".png";
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

function is_target_pointer_event( ptr_event )
{
    return ( (ptr_event.pointerType ==  "mouse")
        || (ptr_event.pointerType == "pen")
        ||  (ptr_event.pointerType == "touch"));
}

/////////////////////////////////////////////////////////////////////////
// Handle drawing for HTML5 Pointer Events.
//
function pointer_event_handler(ptr_event) 
{
    // Ignore events we don't care about
    if (!is_target_pointer_event(ptr_event))
    {
        return;
    }

    // The paint system needs to know the dimensions of the canvas it will draw on 
    var canvas_rect = canvas_el.getBoundingClientRect();
    // given the canvas and the pointer event the paint_rec 
    // has all the information needed to draw
    var paint_rec = get_paint_rec( canvas_rect, ptr_event );
    // Live stats such as pointer position need to updated 
    update_livestats_ui( paint_rec)
    // perform the actual paint
    paint_dab( ptr_event, paint_rec );
}

 
function on_pointerup( ptr_event ) 
{
    paint_stroke_stop();
    paintstats_fields.stroke_count.innerText = paint_stats.stroke_count;
}

function on_pointerenter( ptr_event ) 
{
    document.body.style.cursor = "crosshair";
}

function on_pointerleave( ptr_event ) 
{
    document.body.style.cursor = "default";
    set_livestats_to_empty();
}



function drawPressureCurve() 
{
    curveCtx.clearRect(0, 0, curveCanvas.width, curveCanvas.height);
    curveCtx.beginPath();
    curveCtx.moveTo(0, curveCanvas.height);
    for (let x = 0; x <= curveCanvas.width; x++) {
        const pressure = x / curveCanvas.width;
        const curvedPressure = applyPressureCurve(pressure);
        const y = curveCanvas.height * (1 - curvedPressure);
        curveCtx.lineTo(x, y);
    }
    curveCtx.strokeStyle = 'rgb(150,180,255)';
    curveCtx.lineWidth = 7;
    curveCtx.stroke();

    // Draw axes
    curveCtx.beginPath();
    curveCtx.moveTo(0, 0);
    curveCtx.lineTo(0, curveCanvas.height);
    curveCtx.lineTo(curveCanvas.width, curveCanvas.height);
    curveCtx.strokeStyle = 'black';
    curveCtx.lineWidth = 1;
    curveCtx.stroke();
}

function set_livestats_to_empty( ) 
{
    const empty = "---";
    livestats.pos.innerText = empty;
    livestats.size.innerText = empty;
    livestats.pressure.innerText = empty;
    livestats.tiltx.innerText = empty;
    livestats.tilty.innerText = empty;
    livestats.barrel_rotation.innerText = empty;


}

function default_ptr_event_handler_do_nothing( ptr_event ) 
{
    // do nothing
}

function register_event_handlers()
{
    window.addEventListener('load', register_window_load_event_listeners, true);  
    register_document_hotkey_event_listeners();
}

function register_document_hotkey_event_listeners()
{
    // Hotkey for DELETE or BACKSPACE
    document.addEventListener('keydown', 
        (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault(); // Prevent browser back navigation
            clearCanvas();
        } });

}

function register_window_load_event_listeners()
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

