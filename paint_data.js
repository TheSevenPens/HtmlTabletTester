const settingStylusPenColor = "black";
const PRESSURE_RANGE = new OrderedRange(0.0,1.0);
const BRUSHSIZE_RANGE = new OrderedRange(0.1,300.0);

const paintSettings =
    {
        brushSize: 50,
        brushSizeControl: "PRESSURE",
        brushColorControl: "DEFAULT",
        eraserSize: 30,
        linecap: "round",
    };

const processingSettings =
    {
        posXSmoother: new NumericSmoother(0.0),
        posYSmoother: new NumericSmoother(0.0),
        pressureSmoother: new NumericSmoother(0.0),
        pressureCurveAmount: new NumericCurve(0.0),
        tiltXSmoother: new NumericSmoother(0.0),
        tiltYSmoother: new NumericSmoother(0.0),
        tiltAzimuthSmoother: new NumericSmoother(0.0),
        tiltAltitudeSmoother: new NumericSmoother(0.0),
        velocitySmoother: new NumericSmoother(0.9),
        pressureQuant: 0,
        pressureQuantizationLevels: 0,
    };

const paintCurrentDabSettings =
    {
        brushSize: 1,
        brushColor: settingStylusPenColor,
    };

const paintState =
    {
        canvasPosOldAllEvents : { x: 0, y: 0 },
        canvasPosOld: { x: 0, y: 0 },
        isDrawing: false,
        timeOld: null,
    };

const paintStrokeStats=
    {
        strokeCount: 0,
        ptreventCount: 0,
        startTime: 0,
        endTime: 0,
        duration: 0,
    };
