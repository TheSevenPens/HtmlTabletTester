const uxStrokeStats = {
    strokeCount: document.getElementById("strokeCountVal"),
    pointerEventCount: document.getElementById("pointerEventCountVal"),
    strokeDuration: document.getElementById("strokeDurationVal"),
    pointerEventRate: document.getElementById("strokeEventsPerSecVal"),
};

function updateUxStrokeStats()
{
    uxStrokeStats.strokeCount.innerText = paintStrokeStats.strokeCount;
    uxStrokeStats.pointerEventCount.innerText = paintStrokeStats.ptreventCount;
    uxStrokeStats.strokeDuration.innerText = paintStrokeStats.duration;
    uxStrokeStats.pointerEventRate.innerText = roundTo1DecimalPlaces( paintStrokeStats.ptreventCount / paintStrokeStats.duration * 1000 ) ;
}