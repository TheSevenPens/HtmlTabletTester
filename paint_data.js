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
        pos_x_smoother: new NumericSmoother(0.0),
        pos_y_smoother: new NumericSmoother(0.0),
        pressure_smoother: new NumericSmoother(0.0),
        pressure_curve_amount: new NumericCurve(0.0),
        tilt_x_smoother: new NumericSmoother(0.0),
        tilt_y_smoothing: new NumericSmoother(0.0),
        tilt_azimuth_smoothing: new NumericSmoother(0.0),
        tilt_altitude_smoother: new NumericSmoother(0.0),
        velocity_smoother: new NumericSmoother(0.5),
        pressue_quant: 0,
    };

var paint_current_dab_settings =
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

var paint_stroke_stats=
    {
        stroke_count: 0,
        ptrevent_count: 0,
        start_time: 0,
        end_time: 0,
        duration: 0,
    };
