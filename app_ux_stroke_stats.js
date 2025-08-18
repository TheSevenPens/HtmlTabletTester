var ux_stroke_stats = {
    stroke_count: document.getElementById("strokeCountVal"),
    pointer_event_count: document.getElementById("pointerEventCountVal"),
    stroke_duration: document.getElementById("strokeDurationVal"),
    pointer_event_rate: document.getElementById("strokeEventsPerSecVal"),
};

function update_ux_stroke_stats()
{
    ux_stroke_stats.stroke_count.innerText = paint_stroke_stats.stroke_count;
    ux_stroke_stats.pointer_event_count.innerText = paint_stroke_stats.ptrevent_count;
    ux_stroke_stats.stroke_duration.innerText = paint_stroke_stats.duration;
    ux_stroke_stats.pointer_event_rate.innerText = round_to_1_decimal_places( paint_stroke_stats.ptrevent_count / paint_stroke_stats.duration * 1000 ) ;
}