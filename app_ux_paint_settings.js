var ux_paint_settings = {
    brush_size: document.getElementById("brushSizeControlSelect"),
    brush_color: document.getElementById("brushColorControlSelect"),
    erase_on_stroke_start: document.getElementById("toggleEraseOnStartStrokeCheckbox")

};




function update_settings_from_ux() {
    update_paint_settings_from_ux();
    update_pointer_settings_from_ux();
}

function update_paint_settings_from_ux() {
    paint_settings.brush_size_control = ux_paint_settings.brush_size.value;
    paint_settings.brush_size = parseInt(ux_pointer_stats.brush_size.value);
    paint_settings.brush_color_control = ux_paint_settings.brush_color.value;
}

