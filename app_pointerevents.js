
var EPenButton = {
  none: 0x0, // nothing is pressed
  tip: 0x1, // left mouse, touch contact, pen contact
  barrel: 0x2, // right mouse, pen barrel button
  middle: 0x4, // middle mouse
  eraser: 0x20, // pen eraser button
};

function is_target_pointer_event(ptr_event) {
  return (
    ptr_event.pointerType == "mouse" ||
    ptr_event.pointerType == "pen" ||
    ptr_event.pointerType == "touch"
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
  var canvas_rect = canvas_el.getBoundingClientRect();
  // given the canvas and the pointer event the paint_rec
  // has all the information needed to draw
  var ptr_rec = get_ptr_rec(canvas_rect, ptr_event);

  // Live stats such as pointer position need to updated
  update_livestats_ui(ptr_rec);
  // perform the actual paint
  paint_dab(ptr_rec);
}

function update_stroke_stats_ux()
{
  paintstats_ux.stroke_count.innerText = paint_stats.stroke_count;
  paintstats_ux.ptrevent_count.innerText = paint_stats.ptrevent_count;
  paintstats_ux.stroke_duration.innerText = paint_stats.duration;
  paintstats_ux.ptreventpersec.innerText = round_to_1_decimal_places( paint_stats.ptrevent_count / paint_stats.duration * 1000 ) ;

}


function on_pointerup(ptr_event) {
  paint_stroke_stop();
  update_stroke_stats_ux();
}

function on_pointerenter(ptr_event) {
  document.body.style.cursor = "crosshair";
}

function on_pointerleave(ptr_event) {
  document.body.style.cursor = "default";
  clear_livestats_ux();
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

  canvas_el.addEventListener("pointerdown", pointer_event_handler, false);
  canvas_el.addEventListener("pointerup", on_pointerup, false);

  canvas_el.addEventListener("pointercancel", pointer_event_handler, false);
  canvas_el.addEventListener("pointermove", pointer_event_handler, false);

  canvas_el.addEventListener(
    "pointerover",
    default_ptr_event_handler_do_nothing,
    false
  );
  
  canvas_el.addEventListener(
    "pointerout",
    default_ptr_event_handler_do_nothing,
    false
  );

  canvas_el.addEventListener("pointerenter", on_pointerenter, false);
  canvas_el.addEventListener("pointerleave", on_pointerleave, false);

  canvas_el.addEventListener(
    "gotpointercapture",
    default_ptr_event_handler_do_nothing,
    false
  );
  canvas_el.addEventListener(
    "lostpointercapture",
    default_ptr_event_handler_do_nothing,
    false
  );
}
