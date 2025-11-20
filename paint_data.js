const setting_stylus_pen_color = "black";
const PRESSURE_RANGE = new OrderedRange(0.0,1.0);
const BRUSHSIZE_RANGE = new OrderedRange(0.1,300.0);

const paint_settings =
    {
        brush_size: 50,
        brush_size_control: "PRESSURE",
        brush_color_control: "DEFAULT",
        eraser_size: 30,
        linecap: "round",
    };

const processing_settings =
    {
        pos_x_smoother: new NumericSmoother(0.0),
        pos_y_smoother: new NumericSmoother(0.0),
        pressure_smoother: new NumericSmoother(0.0),
        pressure_curve_amount: new NumericCurve(0.0),
        tilt_x_smoother: new NumericSmoother(0.0),
        tilt_y_smoother: new NumericSmoother(0.0),
        tilt_azimuth_smoother: new NumericSmoother(0.0),
        tilt_altitude_smoother: new NumericSmoother(0.0),
        velocity_smoother: new NumericSmoother(0.9),
        pressure_quantization_levels: 0,
    };

const paint_current_dab_settings =
    {
        brush_size: 1,
        brush_color: setting_stylus_pen_color,
    };

const paint_state =
    {
        canvas_pos_old_all_events : { x: 0, y: 0 },
        canvas_pos_old: { x: 0, y: 0 },
        isDrawing: false,
        time_old: null,
    };

const paint_stroke_stats=
    {
        stroke_count: 0,
        ptrevent_count: 0,
        start_time: 0,
        end_time: 0,
        duration: 0,
    };
