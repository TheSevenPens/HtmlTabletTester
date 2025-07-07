/////////////////////////////////////////////////////////////////////////


const setting_canvas_color = "rgba(230, 230, 250, 1.0)";
const setting_download_filename = "TabletTester_Untitled";




const canvas_el = document.getElementById("myCanvas");
const canvas_context = canvas_el.getContext("2d");

const curveCanvas = document.getElementById('curveCanvas');
const curveCtx = curveCanvas.getContext('2d');

var pressurelabel_el = document.getElementById("pressureVal");
var tiltlabel_el = document.getElementById("tiltVal");
var poslabel_el = document.getElementById("posVal");
var sizelabel_el = document.getElementById("sizeVal");
var brush_size_control_el =  document.getElementById('brushSizeControlSelect');
var brush_size_el = document.getElementById('brushSizeSelect');
var brush_color_control_el =  document.getElementById('brushColorControlSelect');
var pressure_smoothing_el = document.getElementById('pressureSmoothing');
var pressureSmoothingValue_el = document.getElementById("pressureSmoothingValue");
var pressureCurveExponentSlider_el = document.getElementById("pressureCurveExponentSlider");
var pressureCurveExponentValue_el = document.getElementById("pressureCurveExponentValue");
var barrelRotationVal_el = document.getElementById("barrelRotationVal");



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
    paint_settings.brush_color_control = brush_color_control_el.value;
    paint_settings.pressure_smoothing = GetSmoothingValue( pressure_smoothing_el.value ) ;

    // TODO: This line below updated UI from the settings which is
    // the opposite of what is supposed to happen in this method.
    // Move somewhere else
    pressureSmoothingValue_el.innerText = paint_settings.pressure_smoothing.toString();

    // PRESSURE CURVE
    paint_settings.pressureCurveExponent = parseFloat(pressureCurveExponentSlider_el.value);
    pressureCurveExponentValue_el.innerText = paint_settings.pressureCurveExponent.toFixed(1);
    //        drawCurveVisualization();


    drawPressureCurve();
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

/////////////////////////////////////////////////////////////////////////
// Handle drawing for HTML5 Pointer Events.
//
function pointer_event_handler(ptr_event) 
{

    // Ignore events we don't care about
    if ( 
        (ptr_event.pointerType != "mouse")
        && (ptr_event.pointerType != "pen")
        && (ptr_event.pointerType != "touch") 
        ) 
    {
        return;
    }

    // The paint system needs to know the dimensions of the canvas it will draw on 
    var canvas_rect = canvas_el.getBoundingClientRect();
    // given the canvas and the pointer event the paint_rec 
    // has all the information needed to draw
    var paint_rec = get_paint_rec( canvas_rect, ptr_event );
    // Live stats such as pointer position need to updated 
    set_livestats( paint_rec)
    // perform the actual paint
    perform_paint( ptr_event, paint_rec );
}

 
function on_pointerup( ptr_event ) 
{
    paint_state.isDrawing = false;
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

function set_livestats(pointer_rec)
{
    pressurelabel_el.innerText = pointer_rec.pressure.toFixed(4);
    tiltlabel_el.innerText = pointer_rec.tilt.x.toFixed(1) + "x" + pointer_rec.tilt.y.toFixed(1) ;
    poslabel_el.innerText = pointer_rec.canvas_pos.x.toFixed(1) + "x" + pointer_rec.canvas_pos.y.toFixed(1);
    barrelRotationVal_el.innerText = pointer_rec.barrelrotation.toString();

    if (pointer_rec.pressure > 0)
    {
        sizelabel_el.innerText = current_dab_settings.brush_size.toString()+"px";
    }
    else
    {
        sizelabel_el.innerText = "xxx";
    }
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
    curveCtx.strokeStyle = 'blue';
    curveCtx.lineWidth = 2;
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
    poslabel_el.innerText = empty;
    sizelabel_el.innerText = empty;
    pressurelabel_el.innerText = empty;
    tiltlabel_el.innerText = empty;
    barrelRotationVal_el.innerText = empty;


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

