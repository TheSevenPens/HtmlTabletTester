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